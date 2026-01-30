import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Receiver } from '@upstash/qstash'

const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

@Injectable()
export class QStashGuard implements CanActivate {
  private receiver: Receiver

  constructor() {
    this.receiver = new Receiver({
      currentSigningKey,
      nextSigningKey
    })
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const signature = request.headers['upstash-signature']
    if (!signature) {
      throw new UnauthorizedException('Missing QStash signature')
    }
    const body = request.rawBody.toString()

    const protocol = request.headers['x-forwarded-proto'] || request.protocol
    const host = request.headers['host']
    const originalUrl = request.originalUrl
    const url = `${protocol}://${host}${originalUrl}`

    try {
      const isValid = await this.receiver.verify({
        signature,
        body,
        url
      })

      if (!isValid) {
        throw new UnauthorizedException('Invalid QStash signature')
      }
      return true
    } catch (error) {
      throw new UnauthorizedException(`QStash verification failed: ${error.message}`)
    }
  }
}

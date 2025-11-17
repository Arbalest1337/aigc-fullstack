import { Injectable } from '@nestjs/common'
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerStorageService,
  ThrottlerModuleOptions,
  ThrottlerLimitDetail
} from '@nestjs/throttler'
import { Reflector } from '@nestjs/core'
import { RATE_LIMIT_KEY } from './rate-limit.decorator'
import { getRateLimitByKey } from './rate-limit.sql'

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorageService,
    protected readonly reflector: Reflector
  ) {
    super(options, storageService, reflector)
  }

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, generateKey, getTracker, throttler } = requestProps
    const handler = context.getHandler()
    const key: string | undefined = this.reflector.get<string>(RATE_LIMIT_KEY, handler)

    if (!key) {
      return super.handleRequest(requestProps)
    }

    const record = await getRateLimitByKey(key)
    if (!record) {
      return super.handleRequest(requestProps)
    }
    const { limit, ttlSec } = record

    const ttl = ttlSec * 1000
    const req = context.switchToHttp().getRequest()
    const tracker = await getTracker(req, context)
    const redisKey = generateKey(context, tracker, throttler.name)
    const res = await this.storageService.increment(redisKey, ttl, limit, ttl, throttler.name)
    const totalHits = res.totalHits ?? undefined
    const isBlocked = res.isBlocked ?? (typeof totalHits === 'number' ? totalHits > limit : false)

    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key: redisKey,
        totalHits
      } as ThrottlerLimitDetail)
    }

    return true
  }
}

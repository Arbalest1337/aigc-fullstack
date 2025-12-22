import { Controller, Get, Body, Post } from '@nestjs/common'
import { XService } from './x.service'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth, Public } from 'src/decorators/auth.decorator'

@Auth()
@Controller('oauth/x')
export class XController {
  constructor(private readonly XService: XService) {}

  @Get('auth-url')
  async getAuthorizationUrl(@CurrentUser('id') userId) {
    const authUrl = await this.XService.getAuthorizationUrl()
    return { authUrl }
  }

  @Post('exchange-code')
  async exchangeCode(@CurrentUser('id') userId, @Body() body) {
    const { state, code } = body
    const res = await this.XService.exchangeCode({
      code,
      state,
      userId
    })
    return res
  }

  @Post('publish')
  async postToTweet(@CurrentUser('id') userId, @Body() body) {
    const { postId } = body
    const res = await this.XService.publish({ userId, postId })
    return res
  }
}

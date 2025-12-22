import { Controller, Get, Body, Post } from '@nestjs/common'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { TikTokService } from './tiktok.service'
import { CurrentUser } from 'src/decorators/currentUser.decorator'

@Auth()
@Controller('oauth/tiktok')
export class TikTokController {
  constructor(private readonly tikTokService: TikTokService) {}

  @Get('auth-url')
  async getAuthorizationUrl(@CurrentUser('id') userId) {
    const authUrl = await this.tikTokService.getAuthorizationUrl()
    return { authUrl }
  }

  @Post('exchange-code')
  async exchangeCode(@CurrentUser('id') userId, @Body() body) {
    const { state, code } = body
    const res = await this.tikTokService.exchangeCode({
      code,
      state,
      userId
    })
    return res
  }

  @Post('publish')
  async publish(@CurrentUser('id') userId, @Body() body) {
    const { postId } = body
    const res = await this.tikTokService.publish({
      postId,
      userId
    })
    return res
  }
}

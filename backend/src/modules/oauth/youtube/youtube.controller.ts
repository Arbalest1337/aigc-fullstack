import { Controller, Get, Body, Post } from '@nestjs/common'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { YoutubeService } from './youtube.service'
import { CurrentUser } from 'src/decorators/currentUser.decorator'

@Auth()
@Controller('oauth/youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('auth-url')
  async getAuthorizationUrl(@CurrentUser('id') userId) {
    const authUrl = await this.youtubeService.getAuthorizationUrl()
    return { authUrl }
  }

  @Post('exchange-code')
  async exchangeCode(@CurrentUser('id') userId, @Body() body) {
    const { state, code } = body
    const res = await this.youtubeService.exchangeCode({
      code,
      state,
      userId
    })
    return res
  }

  @Post('publish')
  async publish(@CurrentUser('id') userId, @Body() body) {
    const { postId } = body
    const res = await this.youtubeService.publish({
      postId,
      userId
    })
    return res
  }
}

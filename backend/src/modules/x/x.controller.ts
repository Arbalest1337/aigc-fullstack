import { Controller, Get, Body, Post } from '@nestjs/common'
import { XService } from './x.service'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth, Public } from 'src/decorators/auth.decorator'
import * as XSql from './x.sql'

@Auth()
@Controller('x')
export class XController {
  constructor(private readonly XService: XService) {}

  @Get('oauth2-url')
  async getAuthorizationUrl(@CurrentUser('id') userId) {
    const { state, codeVerifier, authUrl } = await this.XService.getAuthorizationUrl()
    await this.XService.setCodeVerifierToRedis({ state, codeVerifier, userId })
    return { authUrl }
  }

  @Post('exchange-code')
  async exchangeCode(@CurrentUser('id') userId, @Body() body) {
    const { state, code } = body
    const codeVerifier = await this.XService.getAndRemoveCodeVerifierFromRedis({ state, userId })
    if (!codeVerifier) {
      throw new Error('Authorization link expired or already used. Please try again.')
    }
    const tokens = await this.XService.exchangeCode({ code, codeVerifier })
    await XSql.insertOrUpdateXTokens({ userId, tokens })
    const res = await this.XService.insertOrUpdateXAccount({
      userId,
      access_token: tokens.access_token
    })
    return res
  }

  @Get('me')
  async getXAccount(@CurrentUser('id') userId) {
    const res = await XSql.getXAccountByUserId(userId)
    return res
  }

  @Get('me-refresh')
  async refreshXAccount(@CurrentUser('id') userId) {
    const res = await this.XService.insertOrUpdateXAccount(userId)
    return res
  }

  @Get('my-posts')
  async getMyPosts(@CurrentUser('id') userId) {
    const res = await this.XService.getMyPosts(userId)
    return res
  }

  @Post('create-post')
  async createPost(@CurrentUser('id') userId, @Body() body) {
    const { text } = body
    const res = await this.XService.createPost({ userId, text })
    return res
  }

  @Post('post-to-tweet')
  async postToTweet(@CurrentUser('id') userId, @Body() body) {
    const { postId } = body
    const res = await this.XService.postToTweet({ userId, postId })
    return res
  }
}

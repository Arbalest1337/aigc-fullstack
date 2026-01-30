import { Injectable } from '@nestjs/common'
import { OAuthCommonService } from '../oauth-common/oauth-common.service'
import {
  generateAuthUrl,
  codeToToken,
  getAccountInfo,
  publishImage,
  publishVideo,
  refreshToken
} from './tiktok.api'
import { insertOrUpdateToken, insertOrUpdateAccount } from '../oauth.sql'
const platform = 'tiktok'

@Injectable()
export class TikTokService {
  constructor(private readonly oauthCommonService: OAuthCommonService) {}

  async getAuthorizationUrl() {
    const { state, codeChallenge } = await this.oauthCommonService.generateAndStorePKCE(platform)
    const authUrl = generateAuthUrl({ state, codeChallenge })
    return authUrl
  }

  async exchangeCode({ code, state, userId }: { code: string; state: string; userId: string }) {
    const codeVerifier = await this.oauthCommonService.consumePKCE(state)
    if (!codeVerifier) {
      throw new Error('Authorization link expired or already used. Please try again.')
    }
    const tokens = await codeToToken({ code, codeVerifier })
    const account = await getAccountInfo(tokens.access_token)
    await insertOrUpdateToken({ userId, tokens, platform })
    const res = await insertOrUpdateAccount({ userId, account, platform })
    return res
  }

  async getAndRefreshToken(userId: string) {
    const { tokens, isExpired } = await this.oauthCommonService.checkToken({ userId, platform })
    if (!isExpired) return tokens
    const newTokens = await refreshToken(tokens.refresh_token)
    await insertOrUpdateToken({ userId, tokens: newTokens, platform })
    return newTokens
  }

  async publish({ postId, userId }: { postId: string; userId: string }) {
    const { access_token } = await this.getAndRefreshToken(userId)
    const { content, videos, images } = await this.oauthCommonService.getPostData(postId)
    if (videos[0]) {
      const res = await publishVideo({
        title: content,
        videoUrl: videos[0].url,
        access_token
      })
      return res
    } else {
      const res = await publishImage({
        title: content,
        imageUrls: images.map(item => item.url),
        access_token
      })
      return res
    }
  }
}

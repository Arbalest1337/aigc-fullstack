import { Injectable } from '@nestjs/common'
import { OAuthCommonService } from '../oauth-common/oauth-common.service'
import {
  generateAuthUrl,
  codeToToken,
  getAccountInfo,
  refreshToken,
  initUploadUrl
} from './youtube.api'
import { insertOrUpdateToken, insertOrUpdateAccount } from '../oauth.sql'
import { S3Service } from '../../s3/s3.service'

const platform = 'youtube'

@Injectable()
export class YoutubeService {
  constructor(
    private readonly oauthCommonService: OAuthCommonService,
    private readonly s3Service: S3Service
  ) {}

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
    if (isExpired) {
      const newTokens = await refreshToken(tokens.refresh_token)
      await insertOrUpdateToken({ userId, tokens: newTokens, platform })
      return newTokens
    }
    return tokens
  }

  async publish({ postId, userId }: { postId: string; userId: string }) {
    const { access_token } = await this.getAndRefreshToken(userId)
    const { content, videos } = await this.oauthCommonService.getPostData(postId)
    if (!videos[0]) {
      throw new Error('Can not find any video')
    }
    const { key } = videos[0]
    const { Body, ContentType, ContentLength } = await this.s3Service.get(key)
    const uploadUrl = await initUploadUrl({
      access_token,
      ContentType,
      ContentLength,
      title: content
    })

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': `${ContentLength}`,
        'Content-Type': ContentType
      },
      body: Body as BodyInit,
      // @ts-ignore
      duplex: 'half'
    })
    if (!res.ok) {
      throw new Error(`Youtube upload video error ${res.status} ${res.statusText}`)
    }
    return await res.json()
  }
}

import { Injectable } from '@nestjs/common'
import { Client, OAuth2 } from '@xdevplatform/xdk'
import { OAuthCommonService } from '../oauth-common/oauth-common.service'
import { S3Service } from '../../s3/s3.service'
import { insertOrUpdateToken, insertOrUpdateAccount } from '../oauth.sql'
import { uploadInit, uploadAppend, uploadFinalize, createPost, refreshToken } from './x.api'

const platform = 'x'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
uploadInit
@Injectable()
export class XService {
  private readonly oauth2
  constructor(
    private readonly s3Service: S3Service,
    private readonly oauthCommonService: OAuthCommonService
  ) {
    this.oauth2 = new OAuth2({
      clientId: process.env.OAUTH_X_CLIENT_ID,
      clientSecret: process.env.OAUTH_X_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_REDIRECT_URI,
      scope: ['tweet.read', 'tweet.write', 'media.write', 'users.read', 'offline.access']
    })
  }

  async getAuthorizationUrl() {
    const { state, codeChallenge } = await this.oauthCommonService.generateAndStorePKCE(platform)
    const baseUrl = await this.oauth2.getAuthorizationUrl(state)
    const authUrl = new URL(baseUrl)
    authUrl.searchParams.set('code_challenge_method', 'S256')
    authUrl.searchParams.set('code_challenge', codeChallenge)
    return authUrl.toString()
  }

  async exchangeCode({ code, state, userId }: { code: string; state: string; userId: string }) {
    const codeVerifier = await this.oauthCommonService.consumePKCE(state)
    if (!codeVerifier) {
      throw new Error('Authorization link expired or already used. Please try again.')
    }
    const tokens = await this.oauth2.exchangeCode(code, codeVerifier)
    const account = await this.getAccountInfo(tokens.access_token)
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

  async getAccountInfo(accessToken: string) {
    const client = new Client({ accessToken })
    const res = await client.users.getMe()
    return res.data as { id: string; name: string; username: string }
  }

  async uploadFromS3ToTwitter({ key, accessToken }) {
    // init
    const head = await this.s3Service.getHead(key)
    const totalBytes = head.ContentLength
    const mediaType = head.ContentType
    const isVideo = mediaType?.startsWith('video/')
    const isImage = mediaType?.startsWith('image/')
    if (!isVideo && !isImage) {
      throw new Error('Unsupported media type. Only images and videos are supported.')
    }
    const initRes = await uploadInit({
      media_category: isVideo ? 'tweet_video' : 'tweet_image',
      media_type: mediaType,
      total_bytes: totalBytes,
      accessToken
    })
    const mediaId = initRes.data.id

    // append
    const CHUNK_SIZE = 2 * 1024 * 1024
    const res = await this.s3Service.get(key)
    const body = res.Body
    let buffer = Buffer.alloc(0)
    let segmentIndex = 0

    for await (const chunk of body as any) {
      buffer = Buffer.concat([buffer, Buffer.from(chunk)])
      while (buffer.length >= CHUNK_SIZE) {
        const part = buffer.subarray(0, CHUNK_SIZE)
        await uploadAppend({
          mediaId,
          segmentIndex,
          media: part,
          accessToken
        })
        segmentIndex++
        buffer = buffer.subarray(CHUNK_SIZE)
      }
    }
    if (buffer.length > 0) {
      await uploadAppend({
        mediaId,
        segmentIndex,
        media: buffer,
        accessToken
      })
    }

    // finalize
    await uploadFinalize({ mediaId, accessToken })
    return mediaId
  }

  async publish({ postId, userId }: { postId: string; userId: string }) {
    const { access_token: accessToken } = await this.getAndRefreshToken(userId)
    const { content, images, videos } = await this.oauthCommonService.getPostData(postId)
    const mediaList = videos.length > 0 ? [videos[0]] : images.slice(0, 4).map(item => item.key)
    const mediaIds = await Promise.all(
      mediaList.map(key =>
        this.uploadFromS3ToTwitter({
          key,
          accessToken: accessToken
        })
      )
    )

    if (mediaIds.length > 0) {
      await sleep(5_000) // wait for twitter media processing
    }

    const tweet = await createPost({
      text: content,
      mediaIds,
      accessToken
    })
    return tweet
  }
}

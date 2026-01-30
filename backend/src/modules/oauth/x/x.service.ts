import { Injectable } from '@nestjs/common'
import { OAuthCommonService } from '../oauth-common/oauth-common.service'
import { S3Service } from '../../s3/s3.service'
import { insertOrUpdateToken, insertOrUpdateAccount, OAuth2Token } from '../oauth.sql'
import {
  uploadInit,
  uploadAppend,
  uploadFinalize,
  createPost,
  refreshToken,
  generateAuthUrl,
  getAccountInfo,
  codeToToken
} from './x.api'

const platform = 'x'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

@Injectable()
export class XService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly oauthCommonService: OAuthCommonService
  ) {}

  async getAuthorizationUrl() {
    const { state, codeChallenge } = await this.oauthCommonService.generateAndStorePKCE(platform)
    const authUrl = await generateAuthUrl({ state, codeChallenge })
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
    return newTokens as OAuth2Token
  }

  async uploadFromS3ToTwitter({ key, access_token }: { key: string; access_token: string }) {
    // init
    const head = await this.s3Service.getHead(key)
    const totalBytes = head.ContentLength
    const mediaType = head.ContentType
    const isVideo = mediaType?.startsWith('video/')
    const isImage = mediaType?.startsWith('image/')
    if (!isVideo && !isImage) {
      throw new Error('Unsupported media type. Only images and videos are supported.')
    }
    const mediaId = await uploadInit({
      media_category: isVideo ? 'tweet_video' : 'tweet_image',
      media_type: mediaType,
      total_bytes: totalBytes,
      access_token
    })

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
          access_token
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
        access_token
      })
    }

    // finalize
    await uploadFinalize({ mediaId, access_token })
    return mediaId
  }

  async publish({ postId, userId }: { postId: string; userId: string }) {
    const { access_token } = await this.getAndRefreshToken(userId)
    const { content, images, videos } = await this.oauthCommonService.getPostData(postId)
    const mediaList = (videos.length > 0 ? [videos[0]] : images.slice(0, 4)).map(item => item.key)
    const mediaIds = await Promise.all(
      mediaList.map(key =>
        this.uploadFromS3ToTwitter({
          key,
          access_token
        })
      )
    )

    if (mediaIds.length > 0) {
      await sleep(5_000) // wait for twitter media processing
    }

    const tweet = await createPost({
      text: content,
      mediaIds,
      access_token
    })
    return tweet
  }
}

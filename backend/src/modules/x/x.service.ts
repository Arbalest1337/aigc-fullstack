import { Injectable } from '@nestjs/common'
import { Client, OAuth2, generateCodeVerifier, generateCodeChallenge } from '@xdevplatform/xdk'
import type { OAuth2Token } from '@xdevplatform/xdk'
import { RedisService } from '../redis/redis.service'
import { randomBytes } from 'crypto'
import * as XSql from './x.sql'
import { getCurrentDbTime } from 'src/db'
import { getPostById } from '../post/post.sql'
import { S3Service } from '../s3/s3.service'
@Injectable()
export class XService {
  private readonly oauth2
  constructor(
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service
  ) {
    this.oauth2 = new OAuth2({
      clientId: process.env.OAUTH_TWITTER_CLIENT_ID,
      clientSecret: process.env.OAUTH_TWITTER_CLIENT_SECRET,
      redirectUri: process.env.OAUTH_TWITTER_REDIRECT_URI,
      scope: ['tweet.read', 'tweet.write', 'media.write', 'users.read', 'offline.access']
    })
  }

  // Redis
  generateXOauth2Key({ state, userId }) {
    return `oauth-x:${userId}-${state}`
  }

  async setCodeVerifierToRedis({ state, codeVerifier, userId }) {
    const key = this.generateXOauth2Key({ state, userId })
    await this.redisService.set(key, codeVerifier, 'EX', 180)
  }

  async getAndRemoveCodeVerifierFromRedis({ state, userId }) {
    const key = this.generateXOauth2Key({ state, userId })
    try {
      const result = await this.redisService.get(key)
      return result
    } finally {
      await this.redisService.del(key)
    }
  }

  // Oauth2
  async getAuthorizationUrl() {
    // base
    const state = randomBytes(32).toString('hex')
    const baseUrl = await this.oauth2.getAuthorizationUrl(state)
    // PKCE
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const PKCEParams = new URLSearchParams({
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })
    const authUrl = `${baseUrl}&${PKCEParams.toString()}&platform=x`
    return {
      state,
      codeVerifier,
      authUrl
    }
  }

  async exchangeCode({ code, codeVerifier }) {
    const tokens = await this.oauth2.exchangeCode(code, codeVerifier)
    return tokens as OAuth2Token
  }

  async refreshToken(refresh_token: string) {
    const credentials = this.oauth2._base64Encode(
      `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
    )
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    }
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    })
    const response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers,
      body: params.toString()
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text())
      throw new Error(
        `Refresh X tokens HTTP error! status: ${response.status}, body: ${JSON.stringify(errorData)}`
      )
    }
    const tokens = await response.json()
    return tokens
  }

  async getAndVerifyXTokensByUser(userId: string) {
    const { tokens, updatedAt } = await XSql.getXTokensByUserId(userId)
    if (!tokens) {
      throw new Error(
        'No X (Twitter) authorization found. Please authorize your account and try again.'
      )
    }
    const { expires_in, refresh_token } = tokens as OAuth2Token
    const expirySafetyMarginSec = 600
    const dbTime = new Date(await getCurrentDbTime()).getTime()
    const prevUpdated = new Date(updatedAt).getTime()
    const isExpired = dbTime > prevUpdated + (expires_in - expirySafetyMarginSec) * 1_000
    if (isExpired) {
      const newTokens = await this.refreshToken(refresh_token)
      await XSql.insertOrUpdateXTokens({ userId, tokens: newTokens })
      return newTokens as OAuth2Token
    }
    return tokens as OAuth2Token
  }

  // Account
  async insertOrUpdateXAccount({
    userId,
    access_token
  }: {
    userId: string
    access_token?: string
  }) {
    const accessToken = access_token ?? (await this.getAndVerifyXTokensByUser(userId)).access_token
    const client = new Client({ accessToken })
    const response = await client.users.getMe({
      userfields: ['username', 'profile_image_url', 'name', 'id']
    })
    const res = await XSql.insertOrUpdateXAccount({ userId, account: response.data })
    return res
  }

  async getXAccountByUser(userId: string) {
    const res = await XSql.getXAccountByUserId(userId)
    return res.account as { id: string; name: string; username: string }
  }

  // Post (Tweet)
  async getUserClient(userId: string) {
    const tokens = await this.getAndVerifyXTokensByUser(userId)
    const client = new Client({ accessToken: tokens.access_token })
    return client
  }

  async getMyPosts(userId: string) {
    const account = await this.getXAccountByUser(userId)
    const client = await this.getUserClient(userId)
    const response = await client.users.getPosts(account.id)
    return response.data as any
  }

  async createPost({ accessToken, text, mediaIds = [] }) {
    const url = `https://api.x.com/2/tweets`
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        media: { media_ids: mediaIds }
      })
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data
  }

  async uploadInit({ media_type, media_category, total_bytes, accessToken }) {
    const url = `https://api.x.com/2/media/upload/initialize`
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_category,
        media_type,
        total_bytes
      })
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data as { data: { id: string } }
  }

  async uploadAppend({ mediaId, media, segmentIndex, accessToken }) {
    const url = `https://api.x.com/2/media/upload/${mediaId}/append`
    const form = new FormData()
    const blob = new Blob([media], { type: 'application/octet-stream' })
    form.append('media', blob, `segment-${segmentIndex}.bin`)
    form.append('segment_index', segmentIndex.toString())
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data
  }

  async uploadFinalize({ mediaId, accessToken }) {
    const url = `https://api.x.com/2/media/upload/${mediaId}/finalize`
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: undefined
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data
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
    const initRes = await this.uploadInit({
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
        await this.uploadAppend({
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
      await this.uploadAppend({
        mediaId,
        segmentIndex,
        media: buffer,
        accessToken
      })
    }

    // finalize
    await this.uploadFinalize({ mediaId, accessToken })
    return mediaId
  }

  async postToTweet({ postId, userId }: { postId: string; userId: string }) {
    const post = await getPostById(postId)
    const videoKeys = (post.media as { url: string; type: string }[])
      .filter(item => item.type === 'video')
      .map(item => item.url)
    const imageKeys = (post.media as { url: string; type: string }[])
      .filter(item => item.type === 'image')
      .map(item => item.url)
      .slice(0, 4)
    const client = await this.getUserClient(userId)
    const mediaList = videoKeys.length > 0 ? videoKeys : imageKeys

    const mediaIds = await Promise.all(
      mediaList.map(key =>
        this.uploadFromS3ToTwitter({
          key,
          accessToken: client.accessToken
        })
      )
    )
    await sleep(5_000) // wait for twitter media processing

    const content = post.content.slice(0, 140)
    const tweet = await this.createPost({
      text: content,
      mediaIds,
      accessToken: client.accessToken
    })
    return tweet
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      redirectUri: 'http://127.0.0.1:3003/x',
      scope: ['tweet.read', 'tweet.write', 'media.write', 'users.read', 'offline.access']
    })
  }

  // Redis
  generateXOauth2Key({ state, userId }) {
    return `x-oauth2:${userId}-${state}`
  }

  async setCodeVerifierToRedis({ state, codeVerifier, userId }) {
    const key = this.generateXOauth2Key({ state, userId })
    await this.redisService.set(key, codeVerifier, 'EX', 180)
  }

  async getAndRemoveCodeVerifierFromRedis({ state, userId }) {
    const key = this.generateXOauth2Key({ state, userId })
    const result = await this.redisService.get(key)
    if (result) {
      await this.redisService.del(key)
    }
    return result
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
    const authUrl = baseUrl + `&` + PKCEParams.toString()
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
    const response = await client.users.getMe()
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

  async createPost({
    text,
    userId,
    mediaIds = []
  }: {
    text: string
    userId: string
    mediaIds?: string[]
  }) {
    const client = await this.getUserClient(userId)
    const params = { text, media: { media_ids: mediaIds } }
    const response = await client.posts.create(params)
    return response.data
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
    return data
  }

  async uploadAppend({ id, media, accessToken }) {
    const url = `https://api.x.com/2/media/upload/${id}/append`
    const form = new FormData()
    form.append('media', media)
    form.append('segment_index', '0')
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data
  }

  async uploadFinalize({ id, accessToken }) {
    const url = `https://api.x.com/2/media/upload/${id}/finalize`
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: undefined
    }
    const res = await fetch(url, options)
    const data = await res.json()
    return data
  }

  async getMediaIdFromS3Key({ key, type, client }: { key: string; type: string; client: Client }) {
    const s3Object = await this.s3Service.get(key)
    const arrayBuffer = await s3Object.Body.transformToByteArray()
    const fileBuffer = Buffer.from(arrayBuffer)
    const uint8Array = new Uint8Array(fileBuffer)
    const blob = new Blob([uint8Array], { type })

    const res = await this.uploadInit({
      media_category: 'tweet_image',
      media_type: type,
      total_bytes: blob.size,
      accessToken: client.accessToken
    })
    const { id } = res.data ?? {}
    const appendRes = await this.uploadAppend({
      id,
      media: blob,
      accessToken: client.accessToken
    })

    const finalizeRes = await this.uploadFinalize({ id, accessToken: client.accessToken })
    return finalizeRes.data.id as string
  }

  async postToTweet({ postId, userId }: { postId: string; userId: string }) {
    const post = await getPostById(postId)
    const imageKeys = (post.media as { url: string; type: string }[])
      .filter(item => item.type === 'image')
      .map(item => item.url)
      .slice(0, 4)
    const client = await this.getUserClient(userId)
    const mediaIds = await Promise.all(
      imageKeys.map(url =>
        this.getMediaIdFromS3Key({
          key: url,
          type: 'image/jpeg',
          client
        })
      )
    )
    const tweet = await this.createPost({
      // 280 limit
      text: post.content.slice(0, 140),
      userId,
      mediaIds
    })
    return tweet
  }
}

import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/modules/redis/redis.service'
import { generatePKCE } from './PKCE'
import { getDBCurrentTime } from 'src/db'
import { getPostById } from '../../post/post.sql'
import { getTokenByUserId } from '../oauth.sql'

@Injectable()
export class OAuthCommonService {
  constructor(private readonly redisService: RedisService) {}

  async generateAndStorePKCE(prefix: string) {
    const { state, codeVerifier, codeChallenge } = generatePKCE()
    const key = `${prefix}_${state}`
    await this.redisService.set(key, codeVerifier, 'EX', 300)
    return { state: key, codeChallenge }
  }

  async consumePKCE(state: string) {
    try {
      return await this.redisService.get(state)
    } finally {
      await this.redisService.del(state)
    }
  }

  async isTokenExpired({
    updatedAt,
    expiresIn,
    safetyMarginSec = 600
  }: {
    updatedAt: Date | string
    expiresIn: number
    safetyMarginSec?: number
  }) {
    const dbCurrentTime = new Date(await getDBCurrentTime()).getTime()
    const currentMs = new Date(dbCurrentTime).getTime()
    const updatedMs = new Date(updatedAt).getTime()
    const expiryMs = updatedMs + expiresIn * 1000 - safetyMarginSec * 1000
    return currentMs > expiryMs
  }

  async checkToken({ userId, platform }: { userId: string; platform: string }) {
    const { tokens, updatedAt } = await getTokenByUserId(userId, platform)
    if (!tokens) {
      throw new Error(`User ${userId} No ${platform} authorization found.`)
    }
    const isExpired = await this.isTokenExpired({ updatedAt, expiresIn: tokens.expires_in })
    return {
      tokens,
      isExpired
    }
  }

  async getPostData(postId: string) {
    const post = await getPostById(postId)
    const media = (post.media as { type: string; url: string }[]).map(item => ({
      ...item,
      key: item.url,
      url: process.env.CLOUDFLARE_R2_PUBLIC_URL + '/' + item.url
    })) as { url: string; type: string; key: string }[]
    const videos = media.filter(item => item.type === 'video')
    const images = media.filter(item => item.type === 'image')
    return {
      content: post.content,
      videos,
      images
    }
  }
}

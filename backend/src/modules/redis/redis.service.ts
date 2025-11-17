import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  private readonly client
  constructor() {
    this.client = new Redis(process.env.REDIS_URL)
  }

  async set(...params) {
    await this.client.set(...params)
  }

  async get(key) {
    return await this.client.get(key)
  }

  async del(...keys) {
    await this.client.del(...keys)
  }
}

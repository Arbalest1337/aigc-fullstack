import { Controller, Post, Get, Body } from '@nestjs/common'
import { getRateLimits, insertOrUpdateRateLimitByKey } from './rate-limit.sql'
import { RateLimitKeys } from 'src/db/schema/rate-limit'
import { RateLimitThrottle } from './rate-limit.decorator'
import { Auth } from 'src/decorators/auth.decorator'

@Auth()
@Controller('rate-limit')
export class RateLimitController {
  @Get('query')
  async getRateLimits() {
    const res = await getRateLimits()
    return res
  }

  @Post('update')
  async updateRateLimit(@Body() body: { ttlSec: number; limit: number; key: RateLimitKeys }) {
    const { key, ...rest } = body
    const res = await insertOrUpdateRateLimitByKey(key, rest)
    return res
  }

  @Post(`trigger/${RateLimitKeys.POST_CREATE}`)
  @RateLimitThrottle(RateLimitKeys.POST_CREATE)
  async createRateLimit() {
    console.log('### RateLimit')
    return 'RateLimit'
  }

  @Post(`trigger/${RateLimitKeys.POST_LIKE}`)
  @RateLimitThrottle(RateLimitKeys.POST_LIKE)
  async likeRateLimit() {
    console.log('### RateLimit')
    return 'RateLimit'
  }
}

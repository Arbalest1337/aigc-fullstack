import { Controller, Post, Get, Body } from '@nestjs/common'
import { getRateLimits, insertOrUpdateRateLimitByKey } from './rate-limit.sql'
import { RateLimitKeys } from 'src/db/schema/rate-limit'
import { RateLimitThrottle } from './rate-limit.decorator'
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

  @RateLimitThrottle(RateLimitKeys.POST_CREATE)
  @Post('trigger')
  async RateLimit() {
    console.log('### RateLimit')
    return 'RateLimit'
  }
}

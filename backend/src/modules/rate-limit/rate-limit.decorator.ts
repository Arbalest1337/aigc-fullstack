import { RateLimitKeys } from 'src/db/schema/rate-limit'
import { RateLimitGuard } from './rate-limit.guard'
import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common'
import {RATE_LIMIT_KEY} from './rate-limit.constant'

export const RateLimitThrottle = (key: RateLimitKeys) => {
  return applyDecorators(SetMetadata(RATE_LIMIT_KEY, key), UseGuards(RateLimitGuard))
}

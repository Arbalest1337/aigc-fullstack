import { RateLimitKeys } from 'src/db/schema/rate-limit'
import { SetMetadata } from '@nestjs/common'

export const RATE_LIMIT_KEY = 'rate_limit_key'

export const RateLimitThrottle = (key: RateLimitKeys) => SetMetadata(RATE_LIMIT_KEY, key)

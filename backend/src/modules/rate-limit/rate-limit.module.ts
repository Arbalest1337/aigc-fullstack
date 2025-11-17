import { Module } from '@nestjs/common'
import { RateLimitController } from './rate-limit.controller'
@Module({
  controllers: [RateLimitController]
})
export class RateLimitModule {}

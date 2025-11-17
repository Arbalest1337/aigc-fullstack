import { Module } from '@nestjs/common'
import { XService } from './x.service'
import { XController } from './x.controller'
import { RedisModule } from '../redis/redis.module'
import { S3Module } from '../s3/s3.module'

@Module({
  imports: [RedisModule, S3Module],
  controllers: [XController],
  providers: [XService]
})
export class XModule {}

import { Module } from '@nestjs/common'
import { SongController } from './song.controller'
import { SongService } from './song.service'
import { BullModule } from '@nestjs/bullmq'
import { SongProcessor } from './song.processor'
import { S3Module } from '../s3/s3.module'
import { SongProducer } from './song.producer'
import { QUEUE_TASK } from 'src/utils/queue'
import { SubscriptionModule } from '../subscription/subscription.module'
import { SongQStash } from './song.qstash'
import { QStashModule } from '../upstash/qstash/qstash.module'

@Module({
  imports: [S3Module, SubscriptionModule, QStashModule],
  controllers: [SongController],
  providers: [SongService, SongQStash]
})
export class SongModule {}

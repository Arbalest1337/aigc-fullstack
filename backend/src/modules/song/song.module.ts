import { Module } from '@nestjs/common'
import { SongController } from './song.controller'
import { SongService } from './song.service'
import { BullModule } from '@nestjs/bullmq'
import { SongProcessor } from './song.processor'
import { S3Module } from '../s3/s3.module'
import { SongProducer } from './song.producer'
import { QUEUE_TASK } from 'src/utils/queue'
import { SubscriptionModule } from '../subscription/subscription.module'

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_TASK.SONG }), S3Module, SubscriptionModule],
  controllers: [SongController],
  providers: [SongService, SongProducer, SongProcessor]
})
export class SongModule {}

import { Module } from '@nestjs/common'
import { VideoController } from './video.controller'
import { VideoService } from './video.service'
import { BullModule } from '@nestjs/bullmq'
import { VideoProcessor } from './video.processor'
import { S3Module } from '../s3/s3.module'
import { VideoProducer } from './video.producer'
import { QUEUE_TASK } from 'src/utils/queue'
import { SubscriptionModule } from '../subscription/subscription.module'

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_TASK.VIDEO }), S3Module, SubscriptionModule],
  controllers: [VideoController],
  providers: [VideoService, VideoProducer, VideoProcessor]
})
export class VideoModule {}

import { Module } from '@nestjs/common'
import { PostScheduleController } from './post-schedule.controller'
import { PostScheduleService } from './post-schedule.service'
import { PostModule } from '../post/post.module'
import { BullModule } from '@nestjs/bullmq'
import { PostScheduleProducer } from './post-schedule.producer'
import { PostScheduleProcessor } from './post-schedule.processor'
import { S3Module } from '../s3/s3.module'
import { QUEUE_TASK } from 'src/utils/queue'
import { SubscriptionModule } from '../subscription/subscription.module'

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_TASK.POST_SCHEDULE }),
    PostModule,
    S3Module,
    SubscriptionModule
  ],
  controllers: [PostScheduleController],
  providers: [PostScheduleService, PostScheduleProducer, PostScheduleProcessor]
})
export class PostScheduleModule {}

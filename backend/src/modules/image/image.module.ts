import { Module } from '@nestjs/common'
import { ImageController } from './image.controller'
import { ImageService } from './image.service'
import { S3Module } from '../s3/s3.module'
import { SubscriptionModule } from '../subscription/subscription.module'
import { ImageQStash } from './image.qstash'
import { QStashModule } from '../upstash/qstash/qstash.module'

@Module({
  imports: [S3Module, SubscriptionModule, QStashModule],
  controllers: [ImageController],
  providers: [ImageService, ImageQStash]
})
export class ImageModule {}

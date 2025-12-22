import { Module } from '@nestjs/common'
import { YoutubeService } from './youtube.service'
import { YoutubeController } from './youtube.controller'
import { OAuthCommonModule } from '../oauth-common/oauth-common.module'
import { S3Module } from '../../s3/s3.module'

@Module({
  imports: [OAuthCommonModule, S3Module],
  controllers: [YoutubeController],
  providers: [YoutubeService]
})
export class YoutubeModule {}

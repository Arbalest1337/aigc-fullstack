import { Module } from '@nestjs/common'
import { XModule } from './x/x.module'
import { OAuthController } from './oauth.controller'
import { TikTokModule } from './tiktok/tiktok.module'
import { YoutubeModule } from './youtube/youtube.module'

@Module({
  imports: [XModule, TikTokModule, YoutubeModule],
  controllers: [OAuthController]
})
export class OAuthModule {}

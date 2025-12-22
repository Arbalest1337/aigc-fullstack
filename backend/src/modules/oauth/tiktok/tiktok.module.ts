import { Module } from '@nestjs/common'
import { TikTokService } from './tiktok.service'
import { TikTokController } from './tiktok.controller'
import { OAuthCommonModule } from '../oauth-common/oauth-common.module'

@Module({
  imports: [OAuthCommonModule],
  controllers: [TikTokController],
  providers: [TikTokService]
})
export class TikTokModule {}

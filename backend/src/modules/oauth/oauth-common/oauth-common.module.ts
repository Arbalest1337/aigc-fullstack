import { Module } from '@nestjs/common'
import { RedisModule } from 'src/modules/redis/redis.module'
import { OAuthCommonService } from './oauth-common.service'

@Module({
  imports: [RedisModule],
  providers: [OAuthCommonService],
  exports: [OAuthCommonService]
})
export class OAuthCommonModule {}

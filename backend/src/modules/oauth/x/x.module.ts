import { Module } from '@nestjs/common'
import { XService } from './x.service'
import { XController } from './x.controller'
import { S3Module } from '../../s3/s3.module'
import { OAuthCommonModule } from '../oauth-common/oauth-common.module'

@Module({
  imports: [OAuthCommonModule, S3Module],
  controllers: [XController],
  providers: [XService]
})
export class XModule {}

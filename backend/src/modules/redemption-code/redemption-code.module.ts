import { Module } from '@nestjs/common'
import { RedemptionCodeService } from './redemption-code.service'
import { RedemptionCodeController } from './redemption-code.controller'

@Module({
  controllers: [RedemptionCodeController],
  providers: [RedemptionCodeService]
})
export class RedemptionCodeModule {}

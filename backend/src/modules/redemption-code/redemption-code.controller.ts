import { Controller, Post, Body } from '@nestjs/common'
import { RedemptionCodeService } from './redemption-code.service'
import { Auth } from 'src/decorators/auth.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { RateLimitThrottle } from '../rate-limit/rate-limit.decorator'
import { RateLimitKeys } from 'src/db/schema/rate-limit'
@Auth()
@Controller('redemption-code')
export class RedemptionCodeController {
  constructor(private readonly redemptionCodeService: RedemptionCodeService) {}

  @RateLimitThrottle(RateLimitKeys.POST_LIKE)
  @Post('generate')
  async generateRedemptionCode(@CurrentUser('id') userId: string) {
    const res = await this.redemptionCodeService.generateRedemptionCode(userId)
    return res
  }

  @Post('redeem')
  async redeemRedemptionCode(@CurrentUser('id') userId: string, @Body('code') code: string) {
    const res = await this.redemptionCodeService.redeemCode(code, userId)
    return res
  }
}

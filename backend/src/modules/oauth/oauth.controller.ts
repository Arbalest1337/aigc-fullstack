import { Controller, Get, Param } from '@nestjs/common'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { getAccounts, getAccountByUserId } from './oauth.sql'

@Auth()
@Controller('oauth')
export class OAuthController {
  @Get('accounts')
  async getOAuthAccounts(@CurrentUser('id') userId) {
    const res = await getAccounts(userId)
    return res
  }

  @Get(':platform/account')
  async getAccountByUserId(@CurrentUser('id') userId, @Param('platform') platform) {
    const res = await getAccountByUserId(userId, platform)
    return res
  }
}

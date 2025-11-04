import { Controller, Get, Post, Body, RawBody, Headers } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'

@Auth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async querySubscriptionPlans() {
    const res = await this.subscriptionService.querySubscriptionPlans()
    return res
  }

  @Post('create-payment')
  async createPayment(
    @CurrentUser('id') userId: string,
    @Body('subscriptionPlanId') subscriptionPlanId: string
  ) {
    const res = await this.subscriptionService.createSubscriptionPayment(userId, subscriptionPlanId)
    return res
  }

  @Post('retrieve-payment')
  async retrievePayment(@Body('paymentIntentId') paymentIntentId: string) {
    const res = await this.subscriptionService.retrieveSubscriptionPayment(paymentIntentId)
    return res
  }

  @Public()
  @Post('payment-webhook')
  async paymentWebhook(@Headers('stripe-signature') signature: string, @RawBody() rawBody: Buffer) {
    const res = await this.subscriptionService.handlePaymentWebhook(signature, rawBody)
    return res
  }

  @Get('me')
  async getMySubscription(@CurrentUser('id') userId: string) {
    const res = await this.subscriptionService.querySubscriptionByUserId(userId)
    return res
  }
  
}

import { Module } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { SubscriptionController } from './subscription.controller'
import { StripeModule } from '../stripe/stripe.module'
import { SubscriptionGuard } from './subscription.guard'

@Module({
  imports: [StripeModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionGuard],
  exports: [SubscriptionService, SubscriptionGuard]
})
export class SubscriptionModule {}

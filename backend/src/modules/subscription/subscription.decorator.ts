import { applyDecorators, UseGuards } from '@nestjs/common'
import { SubscriptionGuard } from './subscription.guard'

export const RequireSubscription = () => applyDecorators(UseGuards(SubscriptionGuard))

import { CanActivate, ExecutionContext, Injectable, HttpException } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const user = request.user
    if (!user.id || !(await this.subscriptionService.hasActiveSubscriptionByUserId(user.id))) {
      throw new HttpException(`You do not have an active subscription to the Agent service.`, 500)
    }
    return true
  }
}

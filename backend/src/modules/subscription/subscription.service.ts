import { Injectable, OnModuleInit } from '@nestjs/common'
import { StripeService } from '../stripe/stripe.service'
import * as SubscriptionSql from './subscription.sql'
import { getCurrentDbTime } from 'src/db'
@Injectable()
export class SubscriptionService {
  constructor(private readonly stripeService: StripeService) {}

  async OnModuleInit() {
    this.insertInitialPlans()
  }

  async querySubscriptionPlans() {
    const res = await SubscriptionSql.querySubscriptionPlans()
    return res
  }

  async createSubscriptionPayment(userId: string, subscriptionPlanId: string) {
    const [subscriptionPlan] = await SubscriptionSql.querySubscriptionPlans({
      id: subscriptionPlanId
    })
    if (!subscriptionPlan) {
      throw new Error(`Can not find subscription plan ${subscriptionPlanId}`)
    }
    const { price, duration } = subscriptionPlan
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: price,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        type: 'subscription_payment',
        userId,
        duration,
        subscriptionPlanId
      }
    })

    await SubscriptionSql.insertSubscriptionPayment({
      userId,
      paymentIntent,
      paymentIntentId: paymentIntent.id
    })

    return paymentIntent
  }

  async handlePaymentWebhook(signature: string, rawBody: Buffer) {
    const WEBHOOK_SECRET = `whsec_4fb3206ac5ebe4b8aa949fde49aabc01d94fd379f8e35d40f90179d6689d6fbf`
    const event = await this.stripeService.verifyWebhookSignature(
      signature,
      rawBody,
      WEBHOOK_SECRET
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      await this.handlePaymentIntentSucceeded(paymentIntent)
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object
      await this.handlePaymentIntentFailed(paymentIntent)
    }

    return event.type
  }

  async retrieveSubscriptionPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId)
    if (paymentIntent.status === 'succeeded') {
      await this.handlePaymentIntentSucceeded(paymentIntent)
    }
    return paymentIntent.status
  }

  async handlePaymentIntentSucceeded(paymentIntent) {
    const updatedPayment = await SubscriptionSql.updateSubscriptionPayment(paymentIntent.id, {
      status: 'succeeded',
      paymentIntent
    })
    if (!updatedPayment) return
    const { userId, duration } = paymentIntent.metadata
    return await this.handleSubscriptionSucceeded({ userId, duration: Number(duration) })
  }

  async handlePaymentIntentFailed(paymentIntent) {
    return await SubscriptionSql.updateSubscriptionPayment(paymentIntent.id, {
      status: 'failed',
      paymentIntent
    })
  }

  async handleSubscriptionSucceeded({ userId, duration }: { userId: string; duration: number }) {
    const dbNow = new Date(await getCurrentDbTime()).getTime()
    const existSubscription = await SubscriptionSql.getSubscriptionByUserId(userId)
    if (existSubscription) {
      // update
      const prevExpiresAt = new Date(existSubscription.expiresAt).getTime()
      const updatedExpiresAt = new Date(
        (prevExpiresAt > dbNow ? prevExpiresAt : dbNow) + duration * 1000
      ).toISOString()
      return await SubscriptionSql.updateSubscription(existSubscription.id, {
        expiresAt: updatedExpiresAt
      })
    } else {
      // insert
      const expiresAt = new Date(dbNow + duration * 1000).toISOString()
      return await SubscriptionSql.insertSubscription({
        userId,
        expiresAt
      })
    }
  }

  async hasActiveSubscriptionByUserId(userId: string) {
    return await SubscriptionSql.querySubscriptionByUserId({ userId, isActive: true })
  }

  async querySubscriptionByUserId(userId: string) {
    return await SubscriptionSql.querySubscriptionByUserId({ userId })
  }

  async insertInitialPlans() {
    const plans = await this.querySubscriptionPlans()
    if (plans.length > 0) return
    await SubscriptionSql.insertSubscriptionPlans([
      {
        key: 'plan_1',
        price: 598,
        duration: 7 * 24 * 3600,
        detail: {
          name: 'Weekly'
        }
      },
      {
        key: 'plan_2',
        price: 1998,
        duration: 30 * 24 * 3600,
        detail: {
          name: 'Monthly'
        }
      }
    ])
  }
}

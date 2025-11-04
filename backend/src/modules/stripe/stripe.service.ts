import Stripe from 'stripe'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StripeService {
  private stripe
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async createPaymentIntent(params: Stripe.PaymentIntentCreateParams) {
    const paymentIntent = await this.stripe.paymentIntents.create(params)
    return paymentIntent
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent as Stripe.PaymentIntent
  }

  async verifyWebhookSignature(signature: string, rawBody: Buffer, webhookSecret: string) {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    return event as Stripe.Event
  }
}

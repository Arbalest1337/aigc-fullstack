'use client'
import { useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from './CheckoutForm'
import CreatePayment from './CreatePayment'
import Plans from './Plans'
import MySubscription from './MySubscription'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
export default function Stripe() {
  const [clientSecret, setClientSecret] = useState('')
  const [planId, setPlanId] = useState('')
  const options = {
    clientSecret
  }
  return (
    <>
      <MySubscription />
      <Plans planId={planId} setPlanId={setPlanId} />
      <CreatePayment setClientSecret={setClientSecret} planId={planId} />
      <h1>Payment {clientSecret}</h1>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  )
}

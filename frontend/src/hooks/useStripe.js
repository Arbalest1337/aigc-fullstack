import { loadStripe } from '@stripe/stripe-js'
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function useStripe() {
  const confirmPaymentIntent = async client_secret => {
    const { paymentIntent, error } = await stripe.confirmPaymentIntent(client_secret, {
      payment_method: 'card'
    })
    if (error) {
      throw new Error('Pay failed \n', { error })
      return
    }
    console.log('Pay success \n', { paymentIntent })
  }

  return {
    confirmPaymentIntent
  }
}

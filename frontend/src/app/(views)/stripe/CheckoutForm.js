'use client'
import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import useRequest from '@/hooks/useRequest'

export default function CheckoutForm() {
  const request = useRequest()

  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const [errorMessage, setErrorMessage] = useState(null)

  const handleSubmit = async event => {
    event.preventDefault()
    if (!stripe || !elements) {
      return
    }
    try {
      setLoading(true)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/stripe`
        },
        redirect: 'if_required'
      })
      if (error) {
        setErrorMessage(error.message)
        return
      }
      console.log('success !!!', paymentIntent.id)
      onSuccess(paymentIntent.id)
    } finally {
      setLoading(false)
    }
  }

  const onSuccess = async paymentIntentId => {
    await request({
      url: '/subscription/retrieve-payment',
      method: 'POST',
      data: {
        paymentIntentId
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || loading}>
        {loading && 'Loading'}
        {!loading && 'Submit'}
      </button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
}

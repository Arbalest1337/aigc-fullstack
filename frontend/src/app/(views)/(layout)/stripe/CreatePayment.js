'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function CreatePayment({ setClientSecret, planId }) {
  const [loading, setLoading] = useState(false)
  const request = useRequest()
  const onCreatePayment = async () => {
    try {
      setLoading(true)
      const { client_secret } = await request({
        url: '/subscription/create-payment',
        method: 'POST',
        data: {
          subscriptionPlanId: planId
        }
      })
      setClientSecret(client_secret)
    } finally {
      setLoading(false)
    }
  }
  return (
    <button disabled={loading || !planId} onClick={() => onCreatePayment()}>
      {loading && 'Loading'}
      {!loading && 'Create Payment'}
    </button>
  )
}

'use client'
import useRequest from '@/hooks/useRequest'
import { useEffect, useState } from 'react'

export default function SubscriptionPlans({ planId, setPlanId }) {
  const request = useRequest()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const getPlans = async () => {
    try {
      setLoading(true)
      const plans = await request({
        url: '/subscription/plans',
        method: 'GET'
      })
      setPlans(plans)
      console.log({ plans })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getPlans()
  }, [])
  return (
    <>
      {loading && 'loading plans...'}
      {!loading &&
        plans.map(item => (
          <button disabled={loading} key={item.id} onClick={() => setPlanId(item.id)}>
            {item.detail.name}
          </button>
        ))}
      <div>{planId}</div>
    </>
    
  )
}

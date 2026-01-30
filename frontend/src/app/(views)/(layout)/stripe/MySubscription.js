'use client'
import { useState, useEffect } from 'react'
import useRequest from '@/hooks/useRequest'
export default function MySubscription() {
  const request = useRequest()
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  const getMySubscription = async () => {
    try {
      setLoading(true)
      const { expiresAt } = await request({
        url: '/subscription/me',
        method: 'GET'
      })
      setExpiresAt(expiresAt)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getMySubscription()
  }, [])
  return (
    <h1>
      {loading && 'loading...'}
      {!loading && `Expires at: ${expiresAt && new Date(expiresAt).toLocaleString()}`}
    </h1>
  )
}

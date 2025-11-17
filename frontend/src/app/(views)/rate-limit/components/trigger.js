'use client'

import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function RateLimitTrigger() {
  const request = useRequest()
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const handleClick = async () => {
    try {
      setLoading(true)
      const res = await request({
        url: '/rate-limit/trigger',
        method: 'Post'
      })
      setCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4">{count}</h1>
      <button
        className="cursor-pointer border px-2 "
        disabled={loading}
        onClick={() => handleClick()}
      >
        {loading && 'Loading...'}
        {!loading && 'Test'}
      </button>
    </div>
  )
}

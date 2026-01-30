'use client'
import useRequest from '@/hooks/useRequest'
import { useEffect, useState } from 'react'

export default function RateLimits({ limits, setLimits }) {
  const request = useRequest()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRateLimits()
  }, [])

  const getRateLimits = async () => {
    try {
      setLoading(true)
      const res = await request({
        url: '/rate-limit/query',
        method: 'GET'
      })
      setLimits(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        className="cursor-pointer border px-2 mb-10"
        disabled={loading}
        onClick={() => getRateLimits()}
      >
        {loading && 'Loading...'}
        {!loading && 'Get Rate Limits'}
      </button>
      {limits.map(item => (
        <div key={item.id} className="flex my-2 gap-2 items-center">
          <h1>{item.key}</h1>
          <div>
            <b className="text-xl">{item.limit}</b> times / <b className="text-xl">{item.ttlSec}</b>{' '}
          </div>
          <div></div>
        </div>
      ))}
    </div>
  )
}

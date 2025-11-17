'use client'
import useRequest from '@/hooks/useRequest'
import { useState, useEffect } from 'react'

export default function Unauthorized() {
  const request = useRequest()

  const [loading, setLoading] = useState(false)

  const handleRedirectToAuthUrl = async () => {
    try {
      setLoading(true)
      const res = await request({ url: '/x/oauth2-url' })
      location.href = res.authUrl
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          onClick={handleRedirectToAuthUrl}
          disabled={loading}
          className="border p-2 cursor-pointer"
        >
          {loading && 'Loading...'}
          {!loading && 'Authorize Account'}
        </button>
      </div>
    </div>
  )
}

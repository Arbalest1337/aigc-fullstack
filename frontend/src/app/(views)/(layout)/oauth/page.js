'use client'

import useRequest from '@/hooks/useRequest'

import { useState } from 'react'
import OAuth from '@/components/OAuth/OAuth'
import usePostMessage from '@/hooks/usePostMessage'
import Loading from '@/components/Loading/Loading'
export default function OAuthPage() {
  const request = useRequest()
  const [loading, setLoading] = useState(false)

  const platforms = ['youtube', 'x', 'tiktok']

  const onMessage = async event => {
    const { type, platform, code, state } = event.data
    if (type !== 'OAUTH') return
    if (!platform || !code || !state) return
    try {
      setLoading(true)
      await handleExchangeCode({ code, state, platform })
      alert(`${platform} OAuth successfully`)
    } finally {
      setLoading(false)
    }
  }
  usePostMessage({ onMessage })

  const handleExchangeCode = async ({ code, state, platform }) => {
    const res = await request({
      url: `/oauth/${platform}/exchange-code`,
      method: 'POST',
      data: { code, state }
    })
  }

  if (loading) return <Loading isOpen={true} />

  return (
    <div className="flex-col flex gap-8">
      {platforms.map(platform => (
        <OAuth platform={platform} key={platform} />
      ))}
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useRequest from '@/hooks/useRequest'

export default function ExchangeCode({ platform }) {
  const request = useRequest()

  const [loading, setLoading] = useState(true)
  const init = async () => {
    const params = new URLSearchParams(location.search)
    const code = params.get('code')
    const state = params.get('state')
    if (!state || !code) return
    const statePlatform = state.split('_')[0]
    if (statePlatform !== platform) return
    await handleExchangeCode({ code, state })
  }

  const router = useRouter()
  const handleExchangeCode = async ({ code, state }) => {
    const res = await request({
      url: `/oauth/${platform}/exchange-code`,
      method: 'POST',
      data: {
        code,
        state
      }
    })
    alert(`${platform} Authorized successfully`)
    router.replace('/oauth')
  }

  useEffect(() => {
    init()
  }, [])

  return null
}

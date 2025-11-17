'use client'
import Unauthorized from './components/Unauthorized'
import Authorized from './components/Authorized'
import useRequest from '@/hooks/useRequest'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'
export default function XPage() {
  const request = useRequest()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(location.search)
      const code = params.get('code')
      const state = params.get('state')
      if (code && state) {
        await handleExchangeCode({ code, state })
      }
      await getXAccount()
    } finally {
      setLoading(false)
    }
  }

  const handleExchangeCode = async ({ code, state }) => {
    try {
      setLoading(true)
      const res = await request({
        url: '/x/exchange-code',
        method: 'POST',
        data: {
          code,
          state
        }
      })
      // alert('Authentication succeeded !')
      router.replace('/x')
    } finally {
      setLoading(false)
    }
  }

  const getXAccount = async () => {
    try {
      setLoading(true)
      const res = await request({
        url: '/x/me',
        method: 'GET'
      })
      setAccount(res?.account)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {loading && <div>Loading...</div>}
      {!loading && <Unauthorized />}
      {!loading && account && <Authorized account={account} />}
    </div>
  )
}

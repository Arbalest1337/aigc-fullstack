'use client'
import { useEffect } from 'react'
import Loading from '@/components/Loading/Loading'

export default function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (code && state && window.opener) {
      const platform = state.split('_')[0]
      window.opener.postMessage({ type: 'OAUTH', code, platform, state }, window.location.origin)
      window.close()
    }
  }, [])

  return <Loading isOpen={true} />
}

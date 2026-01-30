import { useCallback, useEffect } from 'react'

export default function usePostMessage({ onMessage }) {
  const receiveMessage = useCallback(
    event => {
      if (event.origin !== window.location.origin) return
      onMessage(event)
    },
    [onMessage]
  )

  useEffect(() => {
    window.addEventListener('message', receiveMessage)
    return () => {
      window.removeEventListener('message', receiveMessage)
    }
  }, [receiveMessage])
}

export const openWindow = url => {
  const width = 500
  const height = 600
  const left = window.screenX + (window.innerWidth - width) / 2
  const top = window.screenY + (window.innerHeight - height) / 2
  const popup = window.open(
    url,
    'OAuthLogin',
    `width=${width},height=${height},top=${top},left=${left}`
  )
}

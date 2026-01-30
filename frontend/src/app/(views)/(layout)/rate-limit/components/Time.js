'use client'
import { useEffect, useState } from 'react'

export default function Time() {
  const [now, setNow] = useState(new Date())
  const sec = now.getSeconds()

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <h1>{sec}</h1>
}

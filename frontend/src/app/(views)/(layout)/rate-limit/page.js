'use client'

import RateLimitTrigger from './components/trigger'
import RateLimits from './components/Limits'
import UpdateRateLimit from './components/update'
import Time from './components/Time'
import { useState } from 'react'

export default function RateLimitPage() {
  const [limits, setLimits] = useState([])

  return (
    <div>
      <RateLimits limits={limits} setLimits={setLimits} />
      <UpdateRateLimit />
      <Time />
      {limits.map(item => (
        <RateLimitTrigger key={item.key} limitKey={item.key} />
      ))}
    </div>
  )
}

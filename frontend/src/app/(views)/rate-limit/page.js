'use client'

import RateLimitTrigger from './components/trigger'
import RateLimits from './components/Limits'
import UpdateRateLimit from './components/update'

export default function RateLimitPage() {
  return (
    <div>
      <RateLimitTrigger />
      <UpdateRateLimit />
      <RateLimits />
    </div>
  )
}

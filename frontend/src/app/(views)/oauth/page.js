'use client'

import OAuth from '@/components/OAuth/OAuth'
export default function OAuthPage() {
  const platforms = ['youtube', 'x', 'tiktok']
  return (
    <div className="flex-col flex gap-8">
      {platforms.map(platform => (
        <OAuth platform={platform} key={platform} />
      ))}
    </div>
  )
}

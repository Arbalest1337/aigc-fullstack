
'use client'
import useRequest from '@/hooks/useRequest'
import { useEffect, useState } from 'react'

export default function Account({ platform }) {
  const request = useRequest()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const getAccount = async () => {
    try {
      const res = await request({
        url: `/oauth/${platform}/account`,
        method: 'GET'
      })
      setAccount(res?.account)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAccount()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-white/5 rounded w-full"></div>
        ))}
      </div>
    )
  }

  if (!account || Object.keys(account).length === 0) {
    return (
      <div className="text-gray-600 italic text-[10px] uppercase tracking-widest text-center py-4">
        NO_DATA_FOUND
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Object.entries(account).map(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        return (
          <div 
            className="group/item flex items-center justify-between border-b border-white/5 pb-2 last:border-0" 
            key={key}
          >
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider group-hover/item:text-gray-300 transition-colors shrink-0">
              {key}
            </span>
            <span 
              className="font-mono text-white text-[11px] truncate ml-4 max-w-[200px] cursor-help"
              title={displayValue}
            >
              {displayValue}
            </span>
          </div>
        )
      })}
    </div>
  )
}

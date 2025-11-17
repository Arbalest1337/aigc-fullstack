'use client'

import { RateLimitKeys } from './keys'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function UpdateRateLimit() {
  const request = useRequest()
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(null)
  const [ttlSec, setTtlSec] = useState(null)
  const [key, setKey] = useState('')
  const disabled = loading || !limit || !ttlSec || !key

  const handleSelect = e => {
    setKey(e.target.value)
  }

  const handleClick = async () => {
    try {
      setLoading(true)
      const res = await request({
        url: '/rate-limit/update',
        method: 'Post',
        data: {
          key,
          limit,
          ttlSec
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4">Update Rate Limit</h1>

      <label>limit</label>

      <input
        placeholder="Enter rate limit"
        type="number"
        className="border block mb-4"
        value={limit}
        onChange={e => setLimit(e.target.value)}
      />
      <label>ttl</label>
      <input
        placeholder="Enter rate ttl"
        type="number"
        className="border block mb-4"
        value={ttlSec}
        onChange={e => setTtlSec(e.target.value)}
      />

      <div>
        <label htmlFor="select-keys" className="mr-2">
          Select Key
        </label>
        <select className="border" id="select-keys" value={key} onChange={e => handleSelect(e)}>
          <option value="" disabled>
            Select key
          </option>
          {Object.entries(RateLimitKeys).map(([key, value]) => (
            <option value={value} key={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <button
        className="cursor-pointer border px-2 my-4"
        disabled={disabled}
        onClick={() => handleClick()}
      >
        {loading && 'Loading...'}
        {!loading && 'Submit'}
      </button>
    </div>
  )
}

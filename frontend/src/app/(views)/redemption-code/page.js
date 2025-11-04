'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'
import SerialNumberInput from './SerialNumberInput'

export default function RedemptionCodePage() {
  const request = useRequest()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const [redeemCode, setRedeemCode] = useState('')

  const generateCode = async () => {
    try {
      setLoading(true)
      const { code } = await request({
        url: '/redemption-code/generate',
        method: 'POST'
      })
      setCode(code.match(/.{1,4}/g).join('-'))
    } finally {
      setLoading(false)
    }
  }

  const onRedeemCode = async () => {
    try {
      setLoading(true)
      await request({
        url: '/redemption-code/redeem',
        method: 'POST',
        data: {
          code: redeemCode
        }
      })
      alert('ok')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className="p-4 mb-10">
        <div>{code}</div>
        <button disabled={loading} onClick={() => generateCode()}>
          {loading && 'Loading...'}
          {!loading && 'Generate'}
        </button>
      </div>

      <div className="p-4 mb-10">
        <SerialNumberInput setValue={setRedeemCode} />
        <button disabled={loading || !redeemCode} onClick={() => onRedeemCode()}>
          {loading && 'Loading...'}
          {!loading && 'Redeem'}
        </button>
      </div>
    </>
  )
}

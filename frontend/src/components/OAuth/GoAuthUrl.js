'use client'
import useRequest from '@/hooks/useRequest'
import { useCallback, useState } from 'react'
import { openWindow } from '@/hooks/usePostMessage'

export default function GoAuthUrl({ platform }) {
  const request = useRequest()
  const [loading, setLoading] = useState(false)

  const handleRedirectToAuthUrl = async () => {
    try {
      setLoading(true)
      const res = await request({ url: `/oauth/${platform}/auth-url` })
      // location.href = res.authUrl
      openWindow(res.authUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRedirectToAuthUrl}
      disabled={loading}
      className="w-full relative group h-14 overflow-hidden rounded-2xl bg-white/10 border border-white/20 text-white font-black text-[11px] tracking-[0.4em] transition-all hover:bg-white/20 active:scale-[0.98] shadow-lg flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          CONNECTING...
        </span>
      ) : (
        'AUTHORIZE_LINK'
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  )
}

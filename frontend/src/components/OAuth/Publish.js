'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function Publish({ platform }) {
  const request = useRequest()
  const [postId, setPostId] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePublish = async () => {
    try {
      setLoading(true)
      await request({
        url: `/oauth/${platform}/publish`,
        method: 'POST',
        data: { postId }
      })
      alert('Published successfully')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 group/input">
        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em] ml-2 transition-colors group-focus-within/input:text-white">
          Entry.ID
        </label>
        <input
          placeholder="ENTER_POST_ID"
          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-all font-mono text-sm shadow-inner"
          value={postId}
          onChange={e => setPostId(e.target.value)}
        />
      </div>

      <button
        className="w-full relative group h-14 overflow-hidden rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] tracking-[0.4em] transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-4"
        disabled={loading || !postId}
        onClick={() => handlePublish()}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            EXECUTING...
          </span>
        ) : (
          'PUBLISH_CONTENT'
        )}
      </button>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

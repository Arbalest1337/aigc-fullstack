'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function PostToTweet() {
  const request = useRequest()

  const [postId, setPostId] = useState('')

  const [loading, setLoading] = useState(false)

  const handlePostToTweet = async () => {
    try {
      setLoading(true)
      const res = await request({
        url: '/x/post-to-tweet',
        method: 'POST',
        data: {
          postId
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="my-4">
      <div className="mb-2">Post To Tweet</div>
      <input
        placeholder="post id"
        className="border"
        value={postId}
        onChange={e => setPostId(e.target.value)}
      />
      <button
        className="border cursor-pointer px-2"
        disabled={loading || !postId}
        onClick={() => handlePostToTweet()}
      >
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </div>
  )
}

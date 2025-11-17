'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function CreateTweet() {
  const request = useRequest()

  const [text, setText] = useState('')

  const [createPostLoading, setCreatePostLoading] = useState(false)
  const handleCreatePost = async () => {
    try {
      setCreatePostLoading(true)
      const res = await request({
        url: '/x/create-post',
        method: 'POST',
        data: {
          text
        }
      })
    } finally {
      setCreatePostLoading(false)
    }
  }

  return (
    <div className="my-4">
      <div className="mb-2">Create Post</div>
      <input
        placeholder="post text"
        className="border"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        className="border cursor-pointer px-2"
        disabled={createPostLoading || !text}
        onClick={() => handleCreatePost()}
      >
        {createPostLoading ? 'Creating...' : 'Submit'}
      </button>
    </div>
  )
}

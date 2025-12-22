'use client'
import { useEffect, useState } from 'react'
import useRequest from '@/hooks/useRequest'
import PostItem from '@/components/Post/Post'
import { useQuery } from '@/hooks/useQuery'

export default function Post() {
  const request = useRequest()
  const [input, setInput] = useState('')
  const [video, setVideo] = useState('')
  const [image, setImage] = useState('')

  const [onQuery, querying, postAndRepostList] = useQuery(
    async () => await request({ url: `/post/query-post-and-repost` })
  )
  const [handleCreatePost, creating] = useQuery(async () => {
    let media = []
    if (image) {
      media = [{ type: 'image', url: image }]
    }
    if (video) {
      media = [{ type: 'video', url: video }]
    }
    await request({
      url: '/post/create',
      method: 'POST',
      data: {
        content: input,
        media
      }
    })
    onQuery()
  })

  useEffect(() => {
    onQuery()
  }, [])

  return (
    <>
      <div className="p-4">
        <h4>Post</h4>
        <input
          className="border mr-2"
          placeholder="post content"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <input
          className="border mr-2"
          placeholder="image key"
          value={image}
          onChange={e => setImage(e.target.value)}
        />

        <input
          className="border mr-2"
          placeholder="video key"
          value={video}
          onChange={e => setVideo(e.target.value)}
        />
        <button disabled={creating || !input} onClick={() => handleCreatePost()}>
          {creating ? 'Loading' : 'Submit'}
        </button>

        <button className="block mt-8" disabled={querying} onClick={() => onQuery()}>
          {querying ? 'Loading' : 'Refresh'}
        </button>
        {postAndRepostList?.map((item, index) => (
          <PostItem post={item} key={item.id + item.repostId} />
        ))}
      </div>
    </>
  )
}

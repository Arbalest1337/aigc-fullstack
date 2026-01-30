'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function PostSchedule() {
  const request = useRequest()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [schedules, setTasks] = useState([])
  const [querying, setQuerying] = useState(false)

  const [selected, setSelected] = useState('')

  const [posts, setPosts] = useState([])
  const [queryingPost, setQueryingPost] = useState(false)

  const onSubmit = async () => {
    if (!input) return
    try {
      setLoading(true)
      const res = await request({
        url: '/post-schedule/create',
        method: 'POST',
        data: {
          keywords: input
        }
      })
      onQuery()
    } finally {
      setLoading(false)
    }
  }

  const onQuery = async () => {
    try {
      setQuerying(true)
      const res = await request({ url: `/post-schedule/query` })
      setTasks(res)
    } finally {
      setQuerying(false)
    }
  }

  const onQueryPost = async embeddingId => {
    try {
      setQueryingPost(true)
      const res = await request({
        url: `/post-schedule/similarity-post`,
        method: 'POST',
        data: {
          id: selected
        }
      })
      setPosts(res)
    } finally {
      setQueryingPost(false)
    }
  }

  const onProcess = async id => {
    const res = await request({
      url: '/post-schedule/process',
      method: 'POST',
      data: { id }
    })
  }

  return (
    <>
      <div className="p-4">
        <div></div>
        <h4>Post Schedule</h4>
        <input className="border block" value={input} onChange={e => setInput(e.target.value)} />
        <button disabled={loading} onClick={() => onSubmit()}>
          {loading ? 'Loading' : 'Submit'}
        </button>

        <button className="block mt-8 cursor-pointer" disabled={querying} onClick={() => onQuery()}>
          {querying ? 'Loading' : 'Refresh'} Task
        </button>
        {querying && 'Loading...'}
        {!querying &&
          schedules.map(item => (
            <div
              className={`p-8 ${selected === item.id && 'border border-amber-50'}`}
              key={item.id}
              onClick={() => setSelected(item.id)}
            >
              <div>{item.id}</div>
              <div>{item.keywords}</div>
            </div>
          ))}

        <button
          className="block mt-8"
          disabled={queryingPost}
          onClick={() => onQueryPost(selected)}
        >
          {queryingPost ? 'Loading' : 'Refresh'} Similarity Post
        </button>

        {queryingPost && 'Loading...'}
        {!queryingPost &&
          posts.map(item => (
            <div className="p-8" key={item.post.content}>
              <div>{item.id}</div>
              <div>{item.similarity}</div>
              <div>{item.post.id}</div>
              <div>{item.post.content}</div>
            </div>
          ))}
      </div>

      <button className="block" onClick={() => onProcess(selected)}>
        Process Job
      </button>
    </>
  )
}

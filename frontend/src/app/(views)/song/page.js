'use client'
import useRequest from '@/hooks/useRequest'

import { useEffect, useState } from 'react'

export default function Song() {
  const request = useRequest()
  const [prompt, setPrompt] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [loading, setLoading] = useState(false)
  const [songs, setSongs] = useState([])
  const [querying, setQuerying] = useState(false)

  const onGenerateSong = async () => {
    try {
      setLoading(true)
      const { id } = await request({
        url: '/song/generate',
        method: 'POST',
        data: {
          prompt,
          lyrics
        }
      })
      querySongs()
    } finally {
      setLoading(false)
    }
  }

  const querySongs = async () => {
    try {
      setQuerying(true)
      const res = await request({ url: '/song/query' })
      setSongs(res)
    } finally {
      setQuerying(false)
    }
  }

  useEffect(() => {
    querySongs()
  }, [])

  return (
    <div className="flex gap-5 h-[100dvh] overflow-hidden">
      <div className="p-2 w-[320px] shrink-0 grow-0 flex flex-col gap-4">
        <div>Prompt</div>
        <input
          className="border"
          placeholder="prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <div>Lyrics</div>
        <textarea
          className="border"
          placeholder="lyrics"
          value={lyrics}
          onChange={e => setLyrics(e.target.value)}
        />
        <button className="cursor-pointer" onClick={() => onGenerateSong()}>
          Generate Song
        </button>
      </div>
      <div className="grow shrink flex flex-col gap-4">
        {songs?.map(item => (
          <>
            <div>{item.prompt}</div>

            {item.detail.choices?.map(audio => (
              <audio src={audio.url}  controls/>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

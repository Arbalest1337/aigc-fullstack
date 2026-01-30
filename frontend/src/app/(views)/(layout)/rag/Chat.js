'use client'

import { useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function Chat({ knowledgeBaseId }) {
  const request = useRequest()

  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleChat = async () => {
    setOutput('')
    try {
      setLoading(true)
      const res = await request({
        url: '/rag/chat',
        method: 'POST',
        data: { input, knowledgeBaseId }
      })

      const decoder = new TextDecoder('utf-8')

      for await (const chunk of res.body) {
        const text = decoder.decode(chunk, { stream: true })
        const messages = text.split('\n').filter(str => str.startsWith('data: '))
        if (!messages.length) continue
        const json = messages[0].slice(5).trim()
        const obj = JSON.parse(json)
        const { message, done } = obj
        setOutput(prev => prev + message.content)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h4 className="mb-4">Chat</h4>
      <textarea
        className="border mr-2 block mt-2"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button disabled={loading || !input || !knowledgeBaseId} onClick={async () => handleChat()}>
        {loading ? 'Loading' : 'Send'}
      </button>

      <h4 className="py-4">{output}</h4>
    </div>
  )
}

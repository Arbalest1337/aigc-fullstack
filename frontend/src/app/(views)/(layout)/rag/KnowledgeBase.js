'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import useRequest from '@/hooks/useRequest'

export default function KnowledgeBase({ knowledgeBaseId, setKnowledgeBaseId }) {
  const request = useRequest()

  const [getList, loading, data] = useQuery(async () => {
    const res = await request({ url: '/rag/knowledge-base' })
    return res
  })

  const [name, setName] = useState('')
  const [handleCreate, creating] = useQuery(async () => {
    await request({
      url: '/rag/knowledge-base',
      method: 'POST',
      data: { name }
    })
  })

  useEffect(() => {
    getList()
  }, [])

  return (
    <div className="p-4">
      <h4  className="mb-4">Knowledge Base</h4>
      <input className="border mr-2" value={name} onChange={e => setName(e.target.value)} />
      <button
        disabled={creating || !name}
        onClick={async () => {
          await handleCreate()
          getList()
        }}
      >
        {creating ? 'Loading' : 'New'}
      </button>

      <div className="flex flex-col gap-4 py-4">
        {loading && 'Loading...'}

        {!loading &&
          (data ?? []).map(item => (
            <div
              className="cursor-pointer"
              key={item.id}
              onClick={() => setKnowledgeBaseId(item.id)}
            >
              {item.id === knowledgeBaseId && <div> Selected</div>}
              <div>{item.id}</div>
              <div>{item.name}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

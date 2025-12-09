'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import useRequest from '@/hooks/useRequest'

export default function Documents({ knowledgeBaseId, documentId, setDocumentId }) {
  const request = useRequest()

  const [getList, loading, data] = useQuery(async () => {
    const res = await request({ url: `/rag/documents?knowledgeBaseId=${knowledgeBaseId}` })
    return res
  })

  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [handleCreate, creating] = useQuery(async () => {
    await request({
      url: '/rag/documents',
      method: 'POST',
      data: { name, content, knowledgeBaseId }
    })
  })

  useEffect(() => {
    setDocumentId('')
    if (knowledgeBaseId) {
      getList()
    }
  }, [knowledgeBaseId])

  return (
    <div className="p-4">
      <h4  className="mb-4">Documents</h4>
      <input className="border mr-2" value={name} onChange={e => setName(e.target.value)} />
      <textarea
        className="border mr-2 block mt-2"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button
        disabled={creating || !name || !content || !knowledgeBaseId}
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
            <div className="cursor-pointer" key={item.id} onClick={() => setDocumentId(item.id)}>
              {item.id === documentId && <div> Selected</div>}
              <div>{item.id}</div>
              <div>{item.name}</div>
              <div>{item.content.slice(0, 50)}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

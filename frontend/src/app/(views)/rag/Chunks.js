'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import useRequest from '@/hooks/useRequest'

export default function Chunks({ documentId }) {
  const request = useRequest()

  const [getList, loading, data] = useQuery(async () => {
    const res = await request({ url: `/rag/chunks?documentId=${documentId}` })
    return res
  })

  useEffect(() => {
    if (documentId) {
      getList()
    }
  }, [documentId])

  return (
    <div className="p-4">
      <h4 className="mb-4">Chunks</h4>
      <div className="flex flex-col gap-4 py-4">
        {loading && 'Loading...'}
        {!loading &&
          (data ?? []).map(item => (
            <div className="cursor-pointer" key={item.id}>
              <div>{item.index}</div>
              <div>{item.text}</div>
            </div>
          ))}
      </div>
    </div>
  )
}

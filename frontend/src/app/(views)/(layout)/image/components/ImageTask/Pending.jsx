'user client'
import { useState, useEffect } from 'react'
import { Skeleton } from '@heroui/react'
import useAigcPolling from '@/hooks/useAigcPolling'
export default function Pending({ onUpdate, aspectRatio, task }) {
  useAigcPolling({
    onUpdate,
    task,
    type: 'image'
  })
  return (
    <Skeleton>
      <div style={{ aspectRatio }} className="w-full bg-white rounded-xl"></div>
    </Skeleton>
  )
}

'use client'
import Pending from './Pending'
import Success from './Success'
import Failure from './Failure'
import { useEffect, useState } from 'react'
export default function ImageTask({ children, task, onUpdate, aspectRatio = 2 / 3 }) {
  const status = task.detail.output.task_status
  const isPending = ['PENDING', 'RUNNING'].includes(status)
  const isSuccess = ['SUCCEEDED'].includes(status)
  const isFailed = !isPending && !isSuccess
  const url = isSuccess ? task.url : ''

  return (
    <div className="w-full h-auto relative">
      {isPending && <Pending task={task} aspectRatio={aspectRatio} onUpdate={onUpdate} />}
      {isSuccess && <Success aspectRatio={aspectRatio} url={url} />}
      {isFailed && <Failure aspectRatio={aspectRatio} />}
      {children}
    </div>
  )
}

'use client'
import Pending from './Pending'
import Success from './Success'
import Failure from './Failure'
import { useEffect, useState } from 'react'
export default function VideoTask({ children, task, onUpdate, aspectRatio = 2 / 3 }) {
  const status = task.detail.output.task_status
  const isPending = ['PENDING', 'RUNNING'].includes(status)
  const isSuccess = ['SUCCEEDED'].includes(status)
  const isFailed = !isPending && !isSuccess
  const url = isSuccess ? `https://pub-ac77c40fad3e4ec0a37450b86b2c5754.r2.dev/` + task.key : ''

  return (
    <div className="w-full h-auto relative">
      {isPending && <Pending task={task} aspectRatio={aspectRatio} onUpdate={onUpdate} />}
      {isSuccess && <Success aspectRatio={aspectRatio} url={url} />}
      {isFailed && <Failure aspectRatio={aspectRatio} />}
      {children}
    </div>
  )
}

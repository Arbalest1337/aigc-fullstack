import { useRef, useEffect, useCallback } from 'react'
import useRequest from '@/hooks/useRequest'

export default function useAigcPolling({ task, onUpdate, type }) {
    
  const request = useRequest()
  const taskId = task.taskId
  const status = task.detail.output.task_status
  const isPending = ['PENDING', 'RUNNING'].includes(status)

  const check = useCallback(async () => {
    const res = await request({ url: `/${type}/${taskId}` })
    const taskStatus = res?.detail?.output?.task_status
    if (taskStatus && !['PENDING', 'RUNNING'].includes(taskStatus)) {
      onUpdate?.(res)
    }
  }, [taskId, type, onUpdate])

  const timer = useRef(null)
  const clear = () => timer.current && clearInterval(timer.current)
  useEffect(() => {
    if (!taskId) return
    if (!isPending) return
    timer.current = setInterval(() => {
      check()
    }, 3000)
    return () => {
      clear()
    }
  }, [taskId, isPending, check])
}

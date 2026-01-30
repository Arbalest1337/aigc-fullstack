'use client'
import { useEffect, useState } from 'react'
import useRequest from '@/hooks/useRequest'
import VideoGallery from './components/VideoGallery'
import _VideoGallery from './_VideoGallery'
import { useDisclosure } from '@heroui/react'
import LoadingModal from '@/components/LoadingModal/LoadingModal'
import InputBar from '@/components/InputBar/InputBar'

export default function Video() {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()
  const request = useRequest()
  const [files, setFiles] = useState([])
  const [prompt, setPrompt] = useState('')
  const [tasks, setTasks] = useState([])
  const [querying, setQuerying] = useState(false)

  const handleSubmit = async () => {
    try {
      onOpen()
      if (!prompt) return
      const task = await request({
        url: '/video/text-to-video',
        method: 'POST',
        data: { prompt }
      })
      setPrompt('')
      setTasks(prev => [task, ...prev])
    } finally {
      onClose()
    }
  }

  const onQuery = async () => {
    try {
      setQuerying(true)
      const res = await request({ url: `/video/query` })
      setTasks(res)
    } finally {
      setQuerying(false)
    }
  }

  useEffect(() => {
    onQuery()
  }, [])

  return (
    <>
      <LoadingModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <div className="relative h-[calc(100vh-80px)] w-full overflow-y-auto">
        {/* <Gallery isRandom={true} images={images.filter(item => item.url)} /> */}

        <VideoGallery tasks={tasks} setTasks={setTasks} />
        {/* <_VideoGallery /> */}

        <InputBar
          num={1}
          value={prompt}
          setValue={setPrompt}
          files={files}
          setFiles={setFiles}
          onEnter={handleSubmit}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  )
}

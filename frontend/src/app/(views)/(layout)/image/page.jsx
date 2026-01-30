'use client'
import { useEffect, useState } from 'react'
import useRequest from '@/hooks/useRequest'
import InputBar from '@/components/InputBar/InputBar'
import ImageGallery from './components/ImageGallery'
import { useDisclosure } from '@heroui/react'
import LoadingModal from '@/components/LoadingModal/LoadingModal'

export default function Image() {
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure()
  const request = useRequest()
  const [prompt, setPrompt] = useState('')
  const [files, setFiles] = useState([])
  const [images, setImages] = useState([])
  const [querying, setQuerying] = useState(false)

  const onQuery = async () => {
    try {
      setQuerying(true)
      const res = await request({ url: `/image/query` })
      setImages(res)
    } finally {
      setQuerying(false)
    }
  }

  useEffect(() => {
    onQuery()
  }, [])

  const handleSubmit = async () => {
    try {
      onOpen()
      if (!prompt) return
      const task = await request({
        url: '/image/text-to-image',
        method: 'POST',
        data: { prompt }
      })
      setPrompt('')
      setImages(prev => [task, ...prev])
    } finally {
      onClose()
    }
  }

  return (
    <>
      <LoadingModal isOpen={isOpen} onOpenChange={onOpenChange} />
      <div className="relative h-[calc(100vh-80px)] w-full overflow-y-auto">
        {/* <Gallery isRandom={true} images={images.filter(item => item.url)} /> */}

        <ImageGallery tasks={images} setTasks={setImages} />
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

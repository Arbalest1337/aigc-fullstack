'use client'
import { useState, useEffect, useRef } from 'react'
import useInView from '@/hooks/useInView'
export default function VideoItem({ url, aspectRatio }) {
  const { ref, isInView } = useInView()
  const [src, setSrc] = useState()
  const videoRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  const restart = () => {
    if (!videoRef.current) return

    videoRef.current.currentTime = 0
    videoRef.current.play()
  }
  const pause = () => {
    if (!videoRef.current) return
    videoRef.current.pause()
  }

  useEffect(() => {
    if (!url || src || !isInView) return
    setSrc(url)
  }, [url, isInView, src])

  useEffect(() => {
    if (!loaded) return
    if (isInView) {
      restart()
    } else {
      pause()
    }
    return () => {
      pause()
    }
  }, [isInView, loaded])

  return (
    <div
      ref={ref}
      style={{ aspectRatio }}
      className="w-full h-auto bg-[#323232] overflow-hidden rounded-xl shadow-md relative"
    >
      {
        <video
          ref={videoRef}
          src={src}
          playsInline
          muted
          loop
          onLoadedData={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 opacity-0 ${
            loaded && 'opacity-100'
          }`}
        />
      }
    </div>
  )
}

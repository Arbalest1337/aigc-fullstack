'use client'
import { useEffect, useState } from 'react'
import videosJson from './videos.json'
import Video from './Video'

export default function VideoGallery() {
  const [videos, setVideos] = useState(
    videosJson.map(item => ({
      url: item.mediaUrl,
      aspectRatio: item.resolution.width / item.resolution.height
    }))
  )
  console.log(videos)
  return (
    <div className="h-full w-full p-4 overflow-y-auto">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 space-y-2">
        {videos.map((item, index) => (
          <Video key={index} url={item.url} aspectRatio={item.aspectRatio} />
        ))}
      </div>
    </div>
  )
}

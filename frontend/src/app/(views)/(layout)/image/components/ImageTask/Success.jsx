'user client'
import { useState } from 'react'
export default function ImageSuccess({ url, aspectRatio }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div
      style={{ aspectRatio }}
      className="w-full h-auto bg-[#323232] overflow-hidden rounded-xl shadow-md relative"
    >
      <img
        loading="lazy"
        src={url}
        alt=""
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 opacity-0 ${
          loaded && 'opacity-100'
        }`}
      />
    </div>
  )
}

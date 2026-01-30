'use client'

import { useState, useEffect } from 'react'

export default function ImgPreview({ file, ...props }) {
  const [url, setUrl] = useState()
  const isImg = file && file.type.startsWith('image/')

  useEffect(() => {
    if (!isImg) return
    const currentUrl = URL.createObjectURL(file)
    setUrl(currentUrl)
    return () => {
      URL.revokeObjectURL(currentUrl)
    }
  }, [file])

  if (!isImg) return null

  return <img src={url} alt="" {...props} />
}

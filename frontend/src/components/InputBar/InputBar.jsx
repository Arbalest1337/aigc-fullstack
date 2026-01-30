'use client'
import { useEffect, useState } from 'react'
import SendIcon from './SendIcon'
import AttachIcon from './AttachIcon'
import ImagePreview from './ImagePreview'
export default function InputBar({
  value,
  setValue,
  files = [],
  setFiles,
  accept = 'image/*',
  num = 1,
  onEnter,
  onSubmit
}) {
  const disabled = value.trim().length <= 0
  const onKeyDown = e => {
    const { key, shiftKey } = e
    if (key === 'Enter') {
      if (shiftKey) return
      e.preventDefault()
      onEnter?.()
    }
  }

  const onInputFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = e => {
      const file = e.target.files[0]
      if (num === 1) {
        setFiles([file])
      } else {
        setFiles(prev => [...prev.slice(1 - num), file])
      }
    }
    input.click()
  }

  const handleDelete = index => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="absolute bottom-0 left-0 w-full p-4 px-10 box-border z-10">
      <div className="bg-[#111111] p-2 mx-auto w-full min-h-14 rounded-[28px] max-w-[800px]">
        <div className="flex items-center gap-2">
          {files.map((file, index) => (
            <ImagePreview
              key={index}
              onClick={() => handleDelete(index)}
              file={file}
              className="w-16 h-16 object-cover cursor-pointer rounded-lg m-2"
            />
          ))}
        </div>
        <div className="flex items-end">
          <button className="p-2 cursor-pointer" onClick={onInputFile}>
            <AttachIcon size={20} color="#ffffff" />
          </button>
          <textarea
            type="text"
            value={value}
            onKeyDown={onKeyDown}
            onChange={e => setValue(e.target.value)}
            className="resize-none block min-h-10 p-2 max-h-[50vh] [field-sizing:content] bg-transparent border-none outline-none text-white placeholder:text-gray-500 h-full w-full"
            placeholder="Type your imagination..."
          />
          <button
            onClick={() => onSubmit()}
            disabled={disabled}
            className="ml-auto cursor-pointer bg-gray-700 enabled:bg-white p-2 rounded-full flex items-center justify-center transition duration-200 enabled:hover:scale-[1.1] disabled:grayscale "
          >
            <SendIcon size={22} color={disabled ? '#ffffff' : '#111111'} />
          </button>
        </div>
      </div>
    </div>
  )
}

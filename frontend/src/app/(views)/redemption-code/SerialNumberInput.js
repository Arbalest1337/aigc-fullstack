'use client'
import { useState, useRef, useEffect } from 'react'

export default function SerialNumberInput({ setValue, num = 4, maxLength = 4 }) {
  const [values, setValues] = useState(Array(num).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    setValue?.(values.join(''))
  }, [values])

  const handleChange = (index, val) => {
    const newValues = [...values]
    newValues[index] = val
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, maxLength)
    setValues(newValues)
    if (newValues[index].length === maxLength && index < num - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handlePaste = e => {
    e.preventDefault()
    const pastedValue = e.clipboardData
      .getData('text')
      .replace(/[^A-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, maxLength * num)

    const newValues = []
    for (let i = 0; i < num; i++) {
      newValues[i] = pastedValue.slice(i * maxLength, (i + 1) * maxLength)
    }
    setValues(newValues)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && values[index].length === 0 && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {values.map((v, i) => (
          <input
            key={i}
            className="border w-16 h-10 text-center mx-1 uppercase"
            value={values[i]}
            ref={el => (inputRefs.current[i] = el)}
            maxLength={maxLength}
            onChange={e => handleChange(i, e.target.value)}
            onPaste={e => handlePaste(e)}
            onKeyDown={e => handleKeyDown(e, i)}
          />
        ))}
      </div>
    </>
  )
}

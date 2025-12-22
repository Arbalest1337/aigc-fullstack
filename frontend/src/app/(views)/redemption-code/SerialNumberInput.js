'use client'
import { useState, useRef, useEffect } from 'react'

export default function SerialNumberInput({ setValue, num = 4, maxLength = 4 }) {
  const [values, setValues] = useState(Array(num).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(null)
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
    <div className="flex flex-row gap-5 w-full max-w-3xl px-4 justify-center">
      {values.map((v, i) => (
        <div key={i} className="relative flex-1">
          {/* Refined Glow Effect - Focused or Completed */}
          <div
            className={`absolute -inset-0.5 bg-gradient-to-b from-[#00ffcc] to-[#3b82f6] rounded-2xl blur-md transition-all duration-500 ${
              focusedIndex === i || values[i].length === maxLength
                ? 'opacity-40 scale-[1.02]'
                : 'opacity-0 scale-100'
            }`}
          ></div>

          <div className="relative">
            <input
              className={`relative w-full h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-2 rounded-2xl text-center uppercase font-mono text-xl font-black tracking-[0.1em] transition-all duration-300 focus:outline-none z-10 p-1 ${
                focusedIndex === i || values[i].length === maxLength
                  ? 'border-[#00ffcc] text-white shadow-[0_0_20px_rgba(0,255,204,0.2)]'
                  : 'border-white/10 text-gray-500'
              }`}
              value={values[i]}
              ref={el => (inputRefs.current[i] = el)}
              maxLength={maxLength}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              onChange={e => handleChange(i, e.target.value)}
              onPaste={e => handlePaste(e)}
              onKeyDown={e => handleKeyDown(e, i)}
              placeholder="0000"
            />

            {/* Horizontal flow/scanline within the tube */}
            {focusedIndex === i && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 rounded-2xl">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00ffcc]/5 to-transparent animate-scan-h"></div>
              </div>
            )}

            {/* Status marker */}
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                focusedIndex === i ? 'opacity-100 scale-110' : 'opacity-0 scale-50'
              }`}
            >
              <div className="w-1 h-1 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]"></div>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes scan-h {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-scan-h {
          animation: scan-h 1.5s linear infinite;
        }
      `}</style>
    </div>
  )
}

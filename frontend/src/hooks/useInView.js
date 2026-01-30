import { useEffect, useState, useRef } from 'react'

export default function useInView() {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)
  const rootRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        root: rootRef.current ?? null,
        rootMargin: '0px 0px 540px 0px',
        threshold: 0
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
        observer.disconnect()
      }
    }
  }, [])

  return { ref, isInView, rootRef }
}

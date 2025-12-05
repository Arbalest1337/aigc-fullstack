import { useState } from 'react'

export const useQuery = <T>(asyncFunc: () => Promise<T>) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<T>()
  const trigger = async () => {
    try {
      setLoading(true)
      const res = await asyncFunc()
      setData(res)
      return res
    } finally {
      setLoading(false)
    }
  }

  return [trigger, loading, data]
}

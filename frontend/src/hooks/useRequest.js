import { getJwt, clearJwt } from '@/utils/jwt'
import { useRouter } from 'next/navigation'

const BASE_URL = 'http://localhost:4004'

export default function useRequest() {
  const router = useRouter()
  const request = async ({ url, headers, data, ...rest }) => {
    if (data) {
      rest.body = JSON.stringify(data)
    }
    const res = await fetch(`${BASE_URL}${url}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Authorization: getJwt(),
        ...headers
      }
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText || 'request error')
      alert(errText)
      if ([401].includes(res.status)) {
        clearJwt()
        router.push('/sign-in')
      }
      throw new Error(errText)
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    // json
    const isJson = contentType.includes('application/json')
    if (isJson) {
      const result = await res.json()
      return result.data
    }
    // other
    return res
  }

  return request
}

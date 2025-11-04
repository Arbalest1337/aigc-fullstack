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
    const result = await res.json()

    if (!res.ok) {
      alert(result.message)
      if ([401].includes(res.status)) {
        clearJwt()
        router.push('/sign-in')
      }
      throw new Error(result.message)
    }
    return result.data
  }

  return request
}

import { InternalServerErrorException } from '@nestjs/common'

const BASE_URL = `https://dashscope.aliyuncs.com`

export enum WanTaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  UNKNOWN = 'UNKNOWN'
}

const headers = {
  'Content-Type': 'application/json',
  'X-DashScope-Async': 'enable',
  Authorization: `Bearer ${process.env.WAN_API_KEY}`
}

export const WanText2Image = async (prompt: string) => {
  const url = `${BASE_URL}/api/v1/services/aigc/text2image/image-synthesis`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'wanx2.1-t2i-turbo',
      input: { prompt },
      parameters: {
        n: 1
      }
    })
  })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

export const WanText2Video = async (prompt: string) => {
  const url = `${BASE_URL}/api/v1/services/aigc/video-generation/video-synthesis`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'wanx2.1-t2v-turbo',
      input: { prompt }
    })
  })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

export const WanImage2Video = async ({ prompt, imgUrl: img_url }) => {
  const url = `${BASE_URL}/api/v1/services/aigc/video-generation/video-synthesis`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'wan2.2-i2v-flash',
      input: { prompt, img_url },
      parameters: {
        resolution: '480P'
      }
    })
  })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

export const queryWanTask = async (taskId: string) => {
  const url = `${BASE_URL}/api/v1/tasks/${taskId}`
  const res = await fetch(url, { method: 'GET', headers })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

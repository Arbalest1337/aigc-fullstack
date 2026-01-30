import { InternalServerErrorException } from '@nestjs/common'
const BASE_URL = 'https://api.mureka.ai'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.MUREKA_API_KEY}`
}

export enum MurekaTaskStatus {
  PREPARING = 'preparing',
  QUEUED = 'queued',
  RUNNING = 'running',
  STREAMING = 'streaming',
  REVIEWING = 'reviewing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  TIMEOUTED = 'timeouted',
  CANCELLED = 'cancelled'
}

export const MurekaTaskInPending = [
  MurekaTaskStatus.PREPARING,
  MurekaTaskStatus.QUEUED,
  MurekaTaskStatus.RUNNING,
  MurekaTaskStatus.STREAMING,
  MurekaTaskStatus.REVIEWING
]

export const generateMurekaSong = async ({ lyrics, prompt = '' }) => {
  const url = `${BASE_URL}/v1/song/generate`
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      lyrics,
      prompt,
      model: 'mureka-7'
    })
  })
  const data = await res.json()
  console.log(data)
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

export const queryMurekaTask = async taskId => {
  const url = `${BASE_URL}/v1/song/query/${taskId}`
  const res = await fetch(url, { method: 'GET', headers })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

export const checkBilling = async () => {
  const url = `${BASE_URL}/v1/account/billing`
  const res = await fetch(url, { method: 'GET', headers })
  const data = await res.json()
  if (!res.ok) throw new InternalServerErrorException(data)
  return data
}

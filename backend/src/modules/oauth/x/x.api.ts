export const refreshToken = async (refresh_token: string) => {
  const credentials = Buffer.from(
    `${process.env.OAUTH_X_CLIENT_ID}:${process.env.OAUTH_X_CLIENT_SECRET}`
  ).toString('base64')
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${credentials}`
  }
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token
  })
  const url = `https://api.x.com/2/oauth2/token`
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: params.toString()
  })
  if (!response.ok) {
    throw new Error(`Refresh X tokens error! status: ${response.status}, ${response.statusText}`)
  }
  const tokens = await response.json()
  return tokens
}

export const createPost = async ({ accessToken, text, mediaIds = [] }) => {
  const url = `https://api.x.com/2/tweets`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 140),
      media: { media_ids: mediaIds }
    })
  }
  const res = await fetch(url, options)
  const data = await res.json()
  return data
}

// upload
export const uploadInit = async ({ media_type, media_category, total_bytes, accessToken }) => {
  const url = `https://api.x.com/2/media/upload/initialize`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_category,
      media_type,
      total_bytes
    })
  }
  const res = await fetch(url, options)
  const data = await res.json()
  return data as { data: { id: string } }
}

export const uploadAppend = async ({ mediaId, media, segmentIndex, accessToken }) => {
  const url = `https://api.x.com/2/media/upload/${mediaId}/append`
  const form = new FormData()
  const blob = new Blob([media], { type: 'application/octet-stream' })
  form.append('media', blob, `segment-${segmentIndex}.bin`)
  form.append('segment_index', segmentIndex.toString())
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form
  }
  const res = await fetch(url, options)
  const data = await res.json()
  return data
}

export const uploadFinalize = async ({ mediaId, accessToken }) => {
  const url = `https://api.x.com/2/media/upload/${mediaId}/finalize`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: undefined
  }
  const res = await fetch(url, options)
  const data = await res.json()
  return data
}

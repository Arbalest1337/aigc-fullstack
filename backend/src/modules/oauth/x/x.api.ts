const client_id = process.env.OAUTH_X_CLIENT_ID
const client_secret = process.env.OAUTH_X_CLIENT_SECRET
const redirect_uri = process.env.OAUTH_REDIRECT_URI
const scope = 'tweet.read tweet.write media.write users.read offline.access'

interface Token {
  access_token: string
  refresh_token: string
  expires_in: number
}

export const generateAuthUrl = async ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const url = `https://x.com/i/oauth2/authorize`
  const params = new URLSearchParams({
    response_type: 'code',
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })
  return `${url}?${params.toString()}`
}

export const codeToToken = async ({
  code,
  codeVerifier
}: {
  code: string
  codeVerifier: string
}) => {
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${credentials}`
  }
  const url = `https://api.x.com/2/oauth2/token`
  const params = new URLSearchParams({
    redirect_uri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
    code
  })
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: params.toString()
  })

  if (!res.ok) {
    throw new Error(`X code to token error ${res.status}: ${res.statusText}`)
  }
  const tokens = await res.json()
  return tokens as Token
}

export const refreshToken = async (refresh_token: string) => {
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
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
  return tokens as Token
}

export const getAccountInfo = async (access_token: string) => {
  const url = `https://api.x.com/2/users/me`
  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`X get account info error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return data.data as { id: string; name: string; username: string }
}

export const createPost = async ({
  access_token,
  text,
  mediaIds = []
}: {
  access_token: string
  text: string
  mediaIds?: string[]
}) => {
  const url = `https://api.x.com/2/tweets`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 140),
      media: { media_ids: mediaIds.slice(0, 4) }
    })
  }
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`X create post error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return data
}

// upload
export const uploadInit = async ({
  media_type,
  media_category,
  total_bytes,
  access_token
}: {
  media_type: string
  media_category: string
  total_bytes: number
  access_token: string
}) => {
  const url = `https://api.x.com/2/media/upload/initialize`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_category,
      media_type,
      total_bytes
    })
  }
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`X init upload error ${res.status}: ${res.statusText}`)
  }
  const data = (await res.json()) as { data: { id: string } }
  return data.data.id
}

export const uploadAppend = async ({
  mediaId,
  media,
  segmentIndex,
  access_token
}: {
  mediaId: string
  media: Buffer
  segmentIndex: number
  access_token: string
}) => {
  const url = `https://api.x.com/2/media/upload/${mediaId}/append`
  const form = new FormData()
  const blob = new Blob([media], { type: 'application/octet-stream' })
  form.append('media', blob, `segment-${segmentIndex}.bin`)
  form.append('segment_index', segmentIndex.toString())
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
    body: form
  }
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`X append upload error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return data
}

export const uploadFinalize = async ({ mediaId, access_token }) => {
  const url = `https://api.x.com/2/media/upload/${mediaId}/finalize`
  const options = {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}` },
    body: undefined
  }
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`X finalize upload error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return data
}

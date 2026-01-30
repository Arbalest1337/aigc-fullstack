const client_id = process.env.OAUTH_YOUTUBE_CLIENT_ID
const client_secret = process.env.OAUTH_YOUTUBE_CLIENT_SECRET
const redirect_uri = process.env.OAUTH_REDIRECT_URI
const scope =
  'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload'

interface Token {
  access_token: string
  refresh_token: string
  expires_in: number
}

export const generateAuthUrl = ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth`
  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
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
  const url = `https://oauth2.googleapis.com/token`
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const params = new URLSearchParams({
    client_id,
    client_secret,
    redirect_uri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
    code
  })
  const res = await fetch(url, { method: 'POST', headers, body: params.toString() })
  if (!res.ok) {
    throw new Error(`Youtube code to token error ${res.status}: ${res.statusText}`)
  }
  const data = (await res.json()) as Token
  return data
}

export const refreshToken = async (refresh_token: string) => {
  const url = `https://oauth2.googleapis.com/token`
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const params = new URLSearchParams({
    client_id,
    client_secret,
    grant_type: 'refresh_token',
    refresh_token
  })
  const res = await fetch(url, { method: 'POST', body: params.toString(), headers })
  if (!res.ok) {
    throw new Error(`Youtube refresh token error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return { refresh_token, ...data }
}

export const getAccountInfo = async (access_token: string) => {
  const url = `https://www.googleapis.com/youtube/v3/channels?mine=true&part=snippet`
  const headers = {
    Authorization: `Bearer ${access_token}`
  }
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`Youtube get channel info error ${res.status}: ${res.statusText}`)
  }
  const data = (await res.json()) as Token

  return data
}

export const initUploadUrl = async ({ title, ContentType, access_token, ContentLength }) => {
  const url = `https://www.googleapis.com/upload/youtube/v3/videos`
  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
    'X-Upload-Content-Length': ContentLength,
    'X-Upload-Content-Type': ContentType
  }
  const params = new URLSearchParams({
    uploadType: 'resumable',
    part: 'snippet,status'
  })
  const data = {
    snippet: {
      title: title.slice(0, 50),
      description: '',
      categoryId: '22'
    },
    status: {
      privacyStatus: 'private'
    }
  }

  const res = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    throw new Error(`Youtube upload url init error ${res.status} ${res.statusText}`)
  }
  const uploadUrl = res.headers.get('location')
  if (!uploadUrl) {
    throw new Error(`Can not get youtube upload url`)
  }
  return uploadUrl
}

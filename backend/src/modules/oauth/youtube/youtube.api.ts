export const generateAuthUrl = ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth`

  const params = new URLSearchParams({
    client_id: process.env.OAUTH_YOUTUBE_CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: `https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload`
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
    client_id: process.env.OAUTH_YOUTUBE_CLIENT_ID,
    client_secret: process.env.OAUTH_YOUTUBE_CLIENT_SECRET,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
    code
  })
  const res = await fetch(url, { method: 'POST', headers, body: params.toString() })
  if (!res.ok) {
    throw new Error(`Youtube code to token error ${res.status}: ${res.statusText}`)
  }
  return await res.json()
}

export const refreshToken = async (refresh_token: string) => {
  const url = `https://oauth2.googleapis.com/token`
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_YOUTUBE_CLIENT_ID,
    client_secret: process.env.OAUTH_YOUTUBE_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token
  })
  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' })
  if (!res.ok) {
    throw new Error(`Youtube refresh token error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  return data
}

export const getAccountInfo = async (access_token: string) => {
  const url = `https://www.googleapis.com/youtube/v3/channels?mine=true`
  const headers = {
    Authorization: `Bearer ${access_token}`
  }
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`Youtube get channel info error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()

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

  const initRes = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  if (!initRes.ok) {
    throw new Error(`Youtube upload url init error ${initRes.status} ${initRes.statusText}`)
  }
  const uploadUrl = initRes.headers.get('location')
  return uploadUrl
}

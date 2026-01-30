const client_key = process.env.OAUTH_TIKTOK_CLIENT_KEY
const client_secret = process.env.OAUTH_TIKTOK_CLIENT_SECRET
const redirect_uri = process.env.OAUTH_REDIRECT_URI;
// const redirect_uri = 'https://funs-ai.vercel.app/settings/social'

const privacy_level = 'SELF_ONLY'
// const privacy_level = 'PUBLIC_TO_EVERYONE'
const scope = 'video.upload,video.publish,user.info.basic,user.info.profile'

interface Token {
  access_token: string
  expires_in: number
  open_id: string
  refresh_expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

interface Code2TokenError {
  error: string
  error_description: string
  log_id: string
}

interface RefreshTokenError {
  captcha: string
  desc_url: string
  description: string
  error_code: number
}

interface ResponseError {
  code: string
  message: string
  logid: string
}

interface TikTokResponse<T> {
  data: T
  error: ResponseError
}

type AccountInfoResponse = TikTokResponse<{
  user: {
    open_id: string
    union_id: string
    username: string
    display_name: string
  }
}>

type PublishResponse = TikTokResponse<{ publish_id: string }>

export const generateAuthUrl = ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const params = new URLSearchParams({
    client_key,
    redirect_uri,
    scope,
    response_type: 'code',
    disable_auto_auth: '1',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })
  const searchParams = params.toString()
  const url = `https://www.tiktok.com/v2/auth/authorize`
  const authUrl = `${url}?${searchParams}`
  return authUrl
}

export const codeToToken = async ({
  code,
  codeVerifier
}: {
  code: string
  codeVerifier: string
}) => {
  const url = `https://open.tiktokapis.com/v2/oauth/token/`
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const params = new URLSearchParams({
    client_key,
    client_secret,
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
    throw new Error(`Tiktok code to token error ${res.status}: ${res.statusText}`)
  }
  const data = (await res.json()) as Token | Code2TokenError
  if (!('access_token' in data)) {
    throw new Error(`Tiktok refresh token error:${JSON.stringify(data.error_description)}`)
  }
  return data
}

export const refreshToken = async (refresh_token: string) => {
  const url = `https://open-api.tiktok.com/oauth/refresh_token/`
  const params = new URLSearchParams({
    client_key,
    grant_type: 'refresh_token',
    refresh_token
  })
  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' })
  if (!res.ok) {
    throw new Error(`Tiktok refresh token error ${res.status}: ${res.statusText}`)
  }
  const { data } = (await res.json()) as { data: Token | RefreshTokenError }
  if (!('access_token' in data)) {
    throw new Error(`Tiktok refresh token error: ${data.description}`)
  }
  return data
}

export const getAccountInfo = async (access_token: string) => {
  const url = `https://open.tiktokapis.com/v2/user/info/?fields=display_name,username,open_id,union_id,avatar_url`
  const headers = {
    Authorization: `Bearer ${access_token}`
  }
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`Tiktok get userinfo error ${res.status}: ${res.statusText}`)
  }
  const { data, error } = (await res.json()) as AccountInfoResponse
  if (error.code !== 'ok') {
    throw new Error(`Tiktok get userinfo error ${JSON.stringify(error)}`)
  }
  return data.user
}

export const publishVideo = async ({
  access_token,
  videoUrl,
  title
}: {
  access_token: string
  videoUrl: string
  title: string
}) => {
  const url = `https://open.tiktokapis.com/v2/post/publish/video/init/`
  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json; charset=UTF-8'
  }

  const params = {
    source_info: {
      source: 'PULL_FROM_URL',
      video_url: videoUrl
    },
    post_info: {
      title: title.slice(0, 1000),
      privacy_level
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    console.log(await res.text())
    throw new Error(`Tiktok publish video error ${res.status}: ${res.statusText}`)
  }
  const { data, error } = (await res.json()) as PublishResponse
  if (error.code !== 'ok') {
    throw new Error(`Tiktok publish video error ${JSON.stringify(error)}`)
  }
  return data
}

export const publishImage = async ({
  access_token,
  title,
  imageUrls
}: {
  access_token: string
  title: string
  imageUrls: string[]
}) => {
  const url = `https://open.tiktokapis.com/v2/post/publish/content/init/`

  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  }

  const params = {
    source_info: {
      source: 'PULL_FROM_URL',
      photo_cover_index: 0,
      photo_images: imageUrls.slice(0, 35)
    },
    post_info: {
      title: title.slice(0, 45),
      privacy_level
    },
    post_mode: 'DIRECT_POST',
    media_type: 'PHOTO'
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  if (!res.ok) {
    throw new Error(`Tiktok publish image error ${res.status}: ${res.statusText}`)
  }
  const { data, error } = (await res.json()) as PublishResponse
  if (error.code !== 'ok') {
    throw new Error(`Tiktok publish image error ${JSON.stringify(error)}`)
  }
  return data
}

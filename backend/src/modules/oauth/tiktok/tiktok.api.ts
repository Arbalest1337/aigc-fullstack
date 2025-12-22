export const generateAuthUrl = ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const params = new URLSearchParams({
    client_key: process.env.OAUTH_TIKTOK_CLIENT_KEY,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    scope: 'video.upload,video.publish,user.info.basic,user.info.profile',
    response_type: 'code',
    disable_auto_auth: '1',
    state,
    code_challenge: codeChallenge
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
    client_key: process.env.OAUTH_TIKTOK_CLIENT_KEY,
    client_secret: process.env.OAUTH_TIKTOK_CLIENT_SECRET,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
    code
  })
  const res = await fetch(url, { method: 'POST', headers, body: params.toString() })
  if (!res.ok) {
    throw new Error(`Tiktok code to token error ${res.status}: ${res.statusText}`)
  }
  return await res.json()
}

export const refreshToken = async (refresh_token: string) => {
  const url = `https://open-api.tiktok.com/oauth/refresh_token/`
  const params = new URLSearchParams({
    client_key: process.env.OAUTH_TIKTOK_CLIENT_KEY,
    grant_type: 'refresh_token',
    refresh_token
  })
  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' })
  if (!res.ok) {
    throw new Error(`Tiktok refresh token error ${res.status}: ${res.statusText}`)
  }
  const { data } = await res.json()
  if (!data?.open_id) {
    throw new Error(`Tiktok refresh token error`, data)
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
  const { data, error } = await res.json()
  if (error.code !== 'ok') {
    throw new Error(`Tiktok get userinfo error`, error)
  }
  return data.user
}

export const publishVideo = async ({ access_token, videoUrl, title }) => {
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
      title: title.slice(0, 1100),
      privacy_level: 'SELF_ONLY'
    }
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
  if (!res.ok) {
    throw new Error(`Tiktok publish video error ${res.status}: ${res.statusText}`)
  }
  const { data, error } = await res.json()
  if (error.code !== 'ok') {
    throw new Error(`Tiktok publish video error`, error)
  }
  return data
}

export const publishImage = async ({ access_token, title, imageUrls }) => {
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
      privacy_level: 'SELF_ONLY'
    },
    post_mode: 'DIRECT_POST',
    media_type: 'PHOTO'
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(params) })
  if (!res.ok) {
    throw new Error(`Tiktok publish image error ${res.status}: ${res.statusText}`)
  }
  const { data, error } = await res.json()
  if (error.code !== 'ok') {
    throw new Error(`Tiktok publish image error`, error)
  }
  return data
}

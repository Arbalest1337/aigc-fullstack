export const generateAuthUrl = ({
  state,
  codeChallenge
}: {
  state: string
  codeChallenge: string
}) => {
  const params = new URLSearchParams({
    client_id: process.env.OAUTH_INSTAGRAM_CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    scope: 'instagram_basic,instagram_business_basic',
    response_type: 'code',
    disable_auto_auth: '1',
    state,
    code_challenge: codeChallenge
  })
  const searchParams = params.toString()
  const url = `https://api.instagram.com/oauth/authorize`
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
  const url = `https://graph.instagram.com/access_token`
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const params = new URLSearchParams({
    client_secret: process.env.OAUTH_TIKTOK_CLIENT_SECRET,
    redirect_uri: process.env.OAUTH_REDIRECT_URI,
    grant_type: 'ig_exchange_token',
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
  const url = `https://graph.instagram.com/refresh_access_token`
  const params = new URLSearchParams({
    client_key: process.env.OAUTH_TIKTOK_CLIENT_KEY,
    grant_type: 'ig_refresh_token',
    refresh_token
  })
  const res = await fetch(`${url}?${params.toString()}`, { method: 'POST' })
  if (!res.ok) {
    throw new Error(`Tiktok refresh token error ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  if (!data.open_id) {
    throw new Error(`Tiktok refresh token error`, data)
  }
  return data
}
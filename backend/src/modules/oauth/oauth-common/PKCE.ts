import { randomBytes, createHash } from 'crypto'

export const generateState = () => {
  return randomBytes(32).toString('hex')
}

export const generateCodeVerifier = (): string => {
  const codeVerifier = base64UrlEncode(randomBytes(128)).slice(0, 128)
  return codeVerifier
}

export const generateCodeChallenge = (codeVerifier: string): string => {
  const hash = createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = base64UrlEncode(hash)
  return codeChallenge
}

export const generatePKCE = () => {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  return {
    state,
    codeVerifier,
    codeChallenge
  }
}

export const base64UrlEncode = (buffer: Buffer) => {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

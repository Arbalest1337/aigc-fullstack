import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto'

const ENV_KEY = process.env.TOKEN_ENC_KEY
const KEY = createHash('sha256').update(ENV_KEY, 'utf8').digest()

const IV_LEN = 12
const TAG_LEN = 16

export const encrypt = (data: any): string => {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv('aes-256-gcm', KEY, iv)
  const text = typeof data === 'string' ? data : JSON.stringify(data)
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const out = Buffer.concat([iv, tag, ciphertext])
  return out.toString('base64')
}

export function decrypt(encoded: string): any {
  const buf = Buffer.from(encoded, 'base64')
  if (buf.length < IV_LEN + TAG_LEN) throw new Error('invalid payload')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN)
  const dec = createDecipheriv('aes-256-gcm', KEY, iv)
  dec.setAuthTag(tag)
  const plain = Buffer.concat([dec.update(ciphertext), dec.final()]).toString('utf8')
  try {
    return JSON.parse(plain)
  } catch {
    return plain
  }
}

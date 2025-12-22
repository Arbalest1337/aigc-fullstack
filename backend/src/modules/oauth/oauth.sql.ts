import { db } from 'src/db'
import { eq, and, sql } from 'drizzle-orm'
import { OauthTokensTable } from 'src/db/schema/oauth-tokens'
import { encrypt, decrypt } from './token-crypto'
import { OauthAccountsTable } from 'src/db/schema/oauth-accounts'

export interface OAuth2Token {
  access_token: string
  refresh_token: string
  expires_in: number
}

export const insertOrUpdateToken = async ({ userId, tokens, platform }) => {
  const encryptedTokens = encrypt(tokens)
  const params = { userId, tokens: encryptedTokens, platform }
  const [res] = await db
    .insert(OauthTokensTable)
    .values(params)
    .onConflictDoUpdate({
      target: [OauthTokensTable.userId, OauthTokensTable.platform],
      set: { tokens: encryptedTokens }
    })
    .returning()
  return res
}

export const getTokenByUserId = async (userId: string, platform: string) => {
  const [res] = await db
    .select()
    .from(OauthTokensTable)
    .where(and(eq(OauthTokensTable.userId, userId), eq(OauthTokensTable.platform, platform)))
    .limit(1)

  if (!res) return undefined
  return {
    ...res,
    tokens: decrypt(res.tokens as string) as OAuth2Token
  }
}

export const insertOrUpdateAccount = async ({ userId, account, platform }) => {
  const [res] = await db
    .insert(OauthAccountsTable)
    .values({
      userId,
      account,
      platform
    })
    .onConflictDoUpdate({
      target: [OauthAccountsTable.userId, OauthAccountsTable.platform],
      set: { account }
    })
    .returning()
  return res
}

export const getAccountByUserId = async (userId: string, platform: string) => {
  const [res] = await db
    .select()
    .from(OauthAccountsTable)
    .where(and(eq(OauthAccountsTable.userId, userId), eq(OauthAccountsTable.platform, platform)))
    .limit(1)
  return res
}

export const getAccounts = async (userId?: string, platform?: string) => {
  const res = await db
    .select()
    .from(OauthAccountsTable)
    .where(
      and(
        userId ? eq(OauthAccountsTable.userId, userId) : undefined,
        platform ? eq(OauthAccountsTable.platform, platform) : undefined
      )
    )
  return res
}

export const getCurrentDbTime = async () => {
  const result = await db.select({ now: sql`now()`.as('now') })
  return result[0].now
}

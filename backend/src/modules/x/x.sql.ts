import { db } from 'src/db'
import { eq, and } from 'drizzle-orm'
import { OauthTokensTable } from 'src/db/schema/oauth-tokens'
import { encrypt, decrypt } from './token-crypto'
import { OauthAccountsTable } from 'src/db/schema/oauth-accounts'

const OAUTH_TYPE = 'x-oauth2'

export const insertOrUpdateXTokens = async ({ userId, tokens }) => {
  const encryptedTokens = encrypt(tokens)
  const params = { userId, tokens: encryptedTokens, type: OAUTH_TYPE }
  const [res] = await db
    .insert(OauthTokensTable)
    .values(params)
    .onConflictDoUpdate({
      target: [OauthTokensTable.userId, OauthTokensTable.type],
      set: { tokens: encryptedTokens }
    })
    .returning()
  return res
}

export const getXTokensByUserId = async (userId: string) => {
  const [res] = await db
    .select()
    .from(OauthTokensTable)
    .where(and(eq(OauthTokensTable.userId, userId), eq(OauthTokensTable.type, OAUTH_TYPE)))
    .limit(1)
  if (res) {
    res.tokens = decrypt(res.tokens as string)
  }
  return res
}

export const insertOrUpdateXAccount = async ({ userId, account }) => {
  const [res] = await db
    .insert(OauthAccountsTable)
    .values({
      userId,
      account,
      type: OAUTH_TYPE
    })
    .onConflictDoUpdate({
      target: [OauthAccountsTable.userId, OauthAccountsTable.type],
      set: { account }
    })
    .returning()
  return res
}

export const getXAccountByUserId = async (userId: string) => {
  const [res] = await db
    .select()
    .from(OauthAccountsTable)
    .where(and(eq(OauthAccountsTable.userId, userId), eq(OauthAccountsTable.type, OAUTH_TYPE)))
    .limit(1)
  return res
}

import { db } from 'src/db'
import { eq } from 'drizzle-orm'
import { RateLimitTable } from 'src/db/schema/rate-limit'
import { RateLimitKeys } from 'src/db/schema/rate-limit'
export const getRateLimitByKey = async (key: string) => {
  const [res] = await db.select().from(RateLimitTable).where(eq(RateLimitTable.key, key)).limit(1)
  return res
}

export const getRateLimits = async () => {
  const res = await db.select().from(RateLimitTable)
  return res
}

export const insertOrUpdateRateLimitByKey = async (
  key: RateLimitKeys,
  { ttlSec, limit }: { ttlSec: number; limit: number }
) => {
  const [res] = await db
    .insert(RateLimitTable)
    .values({
      key,
      limit,
      ttlSec
    })
    .onConflictDoUpdate({
      target: [RateLimitTable.key],
      set: { ttlSec, limit }
    })
    .returning()
  return res
}

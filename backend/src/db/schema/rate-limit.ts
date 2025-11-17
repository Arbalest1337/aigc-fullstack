import { pgTable, check, text, integer } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt } from '../custom'
import { sql } from 'drizzle-orm'

export enum RateLimitKeys {
  POST_CREATE = 'post_create',
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  REPOST = 'repost',
  FOLLOW = 'follow'
}

export const RateLimitTable = pgTable(
  'rate_limit',
  {
    id: primaryId(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    key: text().notNull().unique(),
    limit: integer().notNull(),
    ttlSec: integer().notNull().default(60)
  },
  t => [
    check('rate_limit_check', sql`${t.limit} > 0`),
    check('rate_ttl_check', sql`${t.ttlSec} > 0`)
  ]
)

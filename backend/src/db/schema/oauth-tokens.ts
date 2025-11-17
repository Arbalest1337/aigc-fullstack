import { pgTable, text, jsonb, unique, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt, ulid } from '../custom'
import { UserTable } from './user'

export const OauthTokensTable = pgTable(
  'oauth_tokens',
  {
    id: primaryId(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    userId: ulid().references(() => UserTable.id, { onDelete: 'cascade' }),
    type: text().notNull(),
    tokens: jsonb().notNull()
  },
  t => [unique().on(t.userId, t.type)]
)

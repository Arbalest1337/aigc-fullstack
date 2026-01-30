import { pgTable, text, jsonb, unique } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt, ulid } from '../custom'
import { UserTable } from './user'

export const OAuthAccountsTable = pgTable(
  'oauth_accounts',
  {
    id: primaryId(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    userId: ulid().references(() => UserTable.id, { onDelete: 'cascade' }),
    platform: text().notNull(),
    account: jsonb().notNull()
  },
  t => [unique().on(t.userId, t.platform)]
)

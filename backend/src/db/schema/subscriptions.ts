import { pgTable, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt, ulid } from '../custom'
import { UserTable } from './user'

export const SubscriptionsTable = pgTable('subscriptions', {
  id: primaryId(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  userId: ulid().references(() => UserTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp({
    withTimezone: true,
    mode: 'string'
  }).notNull()
})

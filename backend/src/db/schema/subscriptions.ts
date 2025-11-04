import { pgTable, timestamp } from 'drizzle-orm/pg-core'
import { primaryId, createTime, updateTime, ulid } from '../custom'
import { UserTable } from './user'

export const SubscriptionsTable = pgTable('subscriptions', {
  id: primaryId(),
  createTime: createTime(),
  updateTime: updateTime(),
  userId: ulid().references(() => UserTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp({
    withTimezone: true,
    mode: 'string'
  }).notNull()
})

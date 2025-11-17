import { pgTable, text, jsonb } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt, ulid } from '../custom'
import { UserTable } from './user'

export const SubscriptionPaymentsTable = pgTable('subscription_payments', {
  id: primaryId(),
  userId: ulid().references(() => UserTable.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  paymentIntent: jsonb().notNull(),
  paymentIntentId: text().notNull().unique(),
  status: text().notNull().default('pending')
})

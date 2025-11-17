import { pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, ulid } from '../custom'
import { UserTable } from './user'

export const UserPasswordTable = pgTable('user_password', {
  id: primaryId(),
  username: text().notNull().unique(),
  password: text().notNull(),
  createdAt: createdAt(),
  userId: ulid()
    .notNull()
    .references(() => UserTable.id, { onDelete: 'cascade' })
})

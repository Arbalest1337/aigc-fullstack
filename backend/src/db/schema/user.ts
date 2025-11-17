import { pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, createdAt } from '../custom'

export const UserTable = pgTable('user', {
  id: primaryId(),
  nickname: text(),
  createdAt: createdAt()
})

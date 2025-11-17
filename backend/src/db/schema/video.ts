import { pgTable, jsonb, text } from 'drizzle-orm/pg-core'
import { primaryId, createdAt } from '../custom'
import { creatorId } from '../custom/user'

export const VideoTable = pgTable('video', {
  id: primaryId(),
  taskId: text().notNull(),
  imgUrl: text(),
  key: text(),
  detail: jsonb(),
  prompt: text().notNull(),
  creatorId: creatorId(),
  createdAt: createdAt()
})

import { pgTable, text, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { ulid, primaryId, createdAt } from '../custom'
import { PostScheduleTable } from './post-schedule'
import { creatorId } from '../custom/user'

export const PostTable = pgTable('post', {
  id: primaryId(),
  content: text().notNull(),
  scheduleId: ulid().references(() => PostScheduleTable.id),
  creatorId: creatorId(),
  createdAt: createdAt(),
  media: jsonb().array()
})

import { pgTable } from 'drizzle-orm/pg-core'
import { PostTable } from './post'
import { ulid, primaryId, createdAt } from '../custom'
import { PostScheduleTable } from './post-schedule'
import { creatorId } from '../custom/user'

export const RepostTable = pgTable('repost', {
  id: primaryId(),
  postId: ulid()
    .notNull()
    .references(() => PostTable.id, { onDelete: 'cascade' }),
  scheduleId: ulid().references(() => PostScheduleTable.id),
  creatorId: creatorId(),
  createdAt: createdAt()
})

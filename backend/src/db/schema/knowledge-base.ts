import { pgTable, text } from 'drizzle-orm/pg-core'
import { primaryId, createdAt, updatedAt } from '../custom'
import { creatorId } from '../custom/user'

export const KnowledgeBaseTable = pgTable('knowledge_base', {
  id: primaryId(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  creatorId: creatorId(),
  name: text().notNull()
})

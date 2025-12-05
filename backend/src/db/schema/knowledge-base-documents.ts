import { pgTable, text, integer } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt, updatedAt } from '../custom'
import { KnowledgeBaseTable } from './knowledge-base'
import { creatorId } from '../custom/user'

export enum KnowledgeBaseDocumentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed'
}

export const KnowledgeBaseDocumentsTable = pgTable('knowledge_base_documents', {
  id: primaryId(),
  creatorId: creatorId(),
  knowledgeBaseId: ulid()
    .notNull()
    .references(() => KnowledgeBaseTable.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  name: text().notNull(),
  content: text().notNull(),
  status: text().notNull().default(KnowledgeBaseDocumentStatus.Pending)
})

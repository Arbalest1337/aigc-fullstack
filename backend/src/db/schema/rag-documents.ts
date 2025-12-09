import { pgTable, text } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt, updatedAt } from '../custom'
import { RagKnowledgeBaseTable } from './rag-knowledge-base'
import { creatorId } from '../custom/user'

export enum RagDocumentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed'
}

export const RagDocumentsTable = pgTable('rag_documents', {
  id: primaryId(),
  creatorId: creatorId(),
  knowledgeBaseId: ulid()
    .notNull()
    .references(() => RagKnowledgeBaseTable.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  name: text().notNull(),
  content: text().notNull(),
  status: text().notNull().default(RagDocumentStatus.Pending),
})

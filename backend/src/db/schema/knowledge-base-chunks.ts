import { pgTable, integer, text } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt } from '../custom'
import { KnowledgeBaseDocumentsTable } from './knowledge-base-documents'

export enum KnowledgeBaseChunkStatus {
  Succeeded = 'succeeded',
  Failed = 'failed'
}

export const KnowledgeBaseChunksTable = pgTable('knowledge_base_chunks', {
  id: primaryId(),
  knowledgeBaseDocumentId: ulid()
    .notNull()
    .references(() => KnowledgeBaseDocumentsTable.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  text: text().notNull(),
  index: integer().notNull()
})

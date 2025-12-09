import { pgTable, integer, text } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt } from '../custom'
import { RagDocumentsTable } from './rag-documents'

export enum RagChunkStatus {
  Succeeded = 'succeeded',
  Failed = 'failed'
}

export const RagChunksTable = pgTable('rag_chunks', {
  id: primaryId(),
  documentId: ulid()
    .notNull()
    .references(() => RagDocumentsTable.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  text: text().notNull(),
  index: integer().notNull()
})

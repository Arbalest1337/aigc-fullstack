import { pgTable, vector, index, text } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt } from '../custom'
import { KnowledgeBaseChunksTable } from './knowledge-base-chunks'

export const KnowledgeBaseEmbeddingsTable = pgTable(
  'knowledge_base_embeddings',
  {
    id: primaryId(),
    knowledgeBaseChunkId: ulid()
      .notNull()
      .references(() => KnowledgeBaseChunksTable.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    embedding: vector({ dimensions: 1536 })
  },
  t => [index('embeddingIndex').using('hnsw', t.embedding.op('vector_cosine_ops'))]
)

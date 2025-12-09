import { pgTable, vector, index } from 'drizzle-orm/pg-core'
import { ulid, primaryId, createdAt } from '../custom'
import { RagChunksTable } from './rag-chunks'

export const RagEmbeddingsTable = pgTable(
  'rag_embeddings',
  {
    id: primaryId(),
    chunkId: ulid()
      .notNull()
      .references(() => RagChunksTable.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
    embedding: vector({ dimensions: 1536 })
  },
  t => [index('rag_embedding_index').using('hnsw', t.embedding.op('vector_cosine_ops'))]
)

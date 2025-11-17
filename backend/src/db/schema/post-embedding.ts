import { pgTable, vector, index } from 'drizzle-orm/pg-core'
import { PostTable } from './post'
import { ulid, primaryId, createdAt } from '../custom'

export const PostEmbeddingTable = pgTable(
  'post_embedding',
  {
    id: primaryId(),
    createdAt: createdAt(),
    embedding: vector({ dimensions: 1536 }),
    postId: ulid()
      .notNull()
      .references(() => PostTable.id, { onDelete: 'cascade' })
  },
  table => [index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))]
)

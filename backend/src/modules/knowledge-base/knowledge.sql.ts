import { db } from 'src/db'
import { eq, cosineDistance, sql, desc, and } from 'drizzle-orm'
import { KnowledgeBaseTable } from 'src/db/schema/knowledge-base'
import { KnowledgeBaseDocumentsTable } from 'src/db/schema/knowledge-base-documents'
import { KnowledgeBaseChunksTable } from 'src/db/schema/knowledge-base-chunks'
import { KnowledgeBaseEmbeddingsTable } from 'src/db/schema/knowledge-base-embeddings'
import { InsertKnowledgeBaseDto } from './knowledge-base.schema'

// Base
export const insertKnowledgeBase = async ({
  name,
  creatorId
}: {
  name: string
  creatorId: string
}) => {
  const [res] = await db
    .insert(KnowledgeBaseTable)
    .values({
      creatorId,
      name
    })
    .returning()
  return res
}

export const getKnowledgeBase = async () => {
  const res = await db.select().from(KnowledgeBaseTable)
  return res
}

// documents

export const getKnowledgeBaseDocuments = async (params: { knowledgeBaseId?: string } = {}) => {
  const { knowledgeBaseId } = params
  const res = await db
    .select()
    .from(KnowledgeBaseDocumentsTable)
    .where(
      and(
        knowledgeBaseId
          ? eq(KnowledgeBaseDocumentsTable.knowledgeBaseId, knowledgeBaseId)
          : undefined
      )
    )
  return res
}

export const insertKnowledgeBaseDocument = async ({
  knowledgeBaseId,
  name,
  content,
  creatorId
}: {
  knowledgeBaseId: string
  name: string
  content: string
  creatorId: string
}) => {
  const [res] = await db
    .insert(KnowledgeBaseDocumentsTable)
    .values({
      knowledgeBaseId,
      name,
      content,
      creatorId
    })
    .returning()
  return res
}

// chunks & embeddings
export const getKnowledgeBaseChunks = async (params: { knowledgeBaseDocumentId?: string } = {}) => {
  const { knowledgeBaseDocumentId } = params
  const res = await db
    .select()
    .from(KnowledgeBaseChunksTable)
    .where(
      and(
        knowledgeBaseDocumentId
          ? eq(KnowledgeBaseChunksTable.knowledgeBaseDocumentId, knowledgeBaseDocumentId)
          : undefined
      )
    )
  return res
}

export const insertKnowledgeBaseChunk = async ({
  knowledgeBaseDocumentId,
  text,
  index
}: {
  knowledgeBaseDocumentId: string
  text: string
  index: number
}) => {
  const [res] = await db
    .insert(KnowledgeBaseChunksTable)
    .values({
      knowledgeBaseDocumentId,
      text,
      index
    })
    .returning()
  return res
}

export const insertKnowledgeBaseEmbedding = async ({
  embedding,
  knowledgeBaseChunkId
}: {
  embedding: number[]
  knowledgeBaseChunkId: string
}) => {
  const [res] = await db
    .insert(KnowledgeBaseEmbeddingsTable)
    .values({
      knowledgeBaseChunkId,
      embedding
    })
    .returning()
  return res
}

export const getSimilarityChunkTextsByKnowledgeBase = async ({
  embedding,
  knowledgeBaseId
}: {
  embedding: number[]
  knowledgeBaseId: string
}) => {
  const similarity = sql`1 - (${cosineDistance(KnowledgeBaseEmbeddingsTable.embedding, embedding)})`
  const res = db
    .select({
      similarity,
      text: KnowledgeBaseChunksTable.text
    })
    .from(KnowledgeBaseEmbeddingsTable)
    .innerJoin(
      KnowledgeBaseChunksTable,
      eq(KnowledgeBaseChunksTable.id, KnowledgeBaseEmbeddingsTable.knowledgeBaseChunkId)
    )
    .innerJoin(
      KnowledgeBaseDocumentsTable,
      eq(KnowledgeBaseDocumentsTable.id, KnowledgeBaseChunksTable.knowledgeBaseDocumentId)
    )
    .innerJoin(
      KnowledgeBaseTable,
      eq(KnowledgeBaseTable.id, KnowledgeBaseDocumentsTable.knowledgeBaseId)
    )
    .where(eq(KnowledgeBaseTable.id, knowledgeBaseId))
    .orderBy(t => desc(t.similarity))
    .limit(3)
  return res
}

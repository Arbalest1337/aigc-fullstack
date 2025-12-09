import { db } from 'src/db'
import { eq, cosineDistance, sql, desc, and } from 'drizzle-orm'
import { RagKnowledgeBaseTable } from 'src/db/schema/rag-knowledge-base'
import { RagDocumentsTable } from 'src/db/schema/rag-documents'
import { RagChunksTable } from 'src/db/schema/rag-chunks'
import { RagEmbeddingsTable } from 'src/db/schema/rag-embeddings'

// Base
export const insertKnowledgeBase = async ({
  name,
  creatorId
}: {
  name: string
  creatorId: string
}) => {
  const [res] = await db
    .insert(RagKnowledgeBaseTable)
    .values({
      creatorId,
      name
    })
    .returning()
  return res
}

export const getKnowledgeBase = async () => {
  const res = await db.select().from(RagKnowledgeBaseTable)
  return res
}

// documents
export const getDocuments = async (params: { knowledgeBaseId?: string } = {}) => {
  const { knowledgeBaseId } = params
  const res = await db
    .select()
    .from(RagDocumentsTable)
    .where(
      and(knowledgeBaseId ? eq(RagDocumentsTable.knowledgeBaseId, knowledgeBaseId) : undefined)
    )
  return res
}

export const getDocumentById = async (id: string) => {
  const [res] = await db
    .select()
    .from(RagDocumentsTable)
    .where(eq(RagDocumentsTable.id, id))
    .limit(1)
  return res
}

export const insertDocument = async ({
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
    .insert(RagDocumentsTable)
    .values({
      knowledgeBaseId,
      name,
      content,
      creatorId
    })
    .returning()
  return res
}

export const updateDocument = async (id: string, { status }: { status: string }) => {
  const [res] = await db
    .update(RagDocumentsTable)
    .set({
      status
    })
    .where(eq(RagDocumentsTable.id, id))
    .returning()
  return res
}

// chunks & embeddings
export const getChunks = async (params: { documentId?: string } = {}) => {
  const { documentId } = params
  const res = await db
    .select()
    .from(RagChunksTable)
    .where(and(documentId ? eq(RagChunksTable.documentId, documentId) : undefined))
  return res
}

export const insertChunk = async ({
  documentId,
  text,
  index
}: {
  documentId: string
  text: string
  index: number
}) => {
  const [res] = await db
    .insert(RagChunksTable)
    .values({
      documentId,
      text,
      index
    })
    .returning()
  return res
}

export const insertEmbedding = async ({
  embedding,
  chunkId
}: {
  embedding: number[]
  chunkId: string
}) => {
  const res = await db
    .insert(RagEmbeddingsTable)
    .values({
      chunkId,
      embedding
    })
    .returning()
  console.log(chunkId)
  console.log(embedding)

  console.log(res)
  return res
}

export const getSimilarityChunkTextsByKnowledgeBase = async ({
  embedding,
  knowledgeBaseId
}: {
  embedding: number[]
  knowledgeBaseId: string
}) => {
  const similarity = sql`1 - (${cosineDistance(RagEmbeddingsTable.embedding, embedding)})`
  const res = db
    .select({
      similarity,
      text: RagChunksTable.text
    })
    .from(RagEmbeddingsTable)
    .innerJoin(RagChunksTable, eq(RagChunksTable.id, RagEmbeddingsTable.chunkId))
    .innerJoin(RagDocumentsTable, eq(RagDocumentsTable.id, RagChunksTable.documentId))
    .innerJoin(
      RagKnowledgeBaseTable,
      eq(RagKnowledgeBaseTable.id, RagDocumentsTable.knowledgeBaseId)
    )
    .where(eq(RagKnowledgeBaseTable.id, knowledgeBaseId))
    .orderBy(t => desc(t.similarity))
    .limit(3)
  return res
}

import { db } from 'src/db'
import { PostTable } from 'src/db/schema/post'
import { RepostTable } from 'src/db/schema/repost'
import { PostEmbeddingTable } from 'src/db/schema/post-embedding'
import { eq, getTableColumns, sql, desc } from 'drizzle-orm'
import { unionAll } from 'drizzle-orm/pg-core'

export const createPostEmbedding = async ({ postId, embedding }) => {
  const [res] = await db
    .insert(PostEmbeddingTable)
    .values({
      postId,
      embedding
    })
    .returning()
  return res
}

export const createPost = async post => {
  const [res] = await db.insert(PostTable).values(post).returning()
  return res
}

export const getPosts = async params => {
  const res = await db.select().from(PostTable)
  return res
}

export const getPostById = async id => {
  const [res] = await db.select().from(PostTable).where(eq(PostTable.id, id)).limit(1)
  return res
}

export const createRepost = async repost => {
  const [res] = await db.insert(RepostTable).values(repost).returning()
  return res
}

export const getRepost = async params => {
  const res = await db.select().from(RepostTable)
  return res
}

export const getPostAndRepost = async params => {
  const postSubQuery = db
    .select({
      ...getTableColumns(PostTable),
      repostId: sql`null`.as(`repostId`),
      repostCreatorId: sql`null`.as(`repostCreatorId`)
    })
    .from(PostTable)
  const repostSubQuery = db
    .select({
      ...getTableColumns(PostTable),
      repostId: RepostTable.id,
      repostCreatorId: RepostTable.creatorId,
      createdAt: RepostTable.createdAt
    })
    .from(RepostTable)
    .innerJoin(PostTable, eq(RepostTable.postId, PostTable.id))
  const combine = unionAll(postSubQuery, repostSubQuery).as('combine')
  const res = await db.select().from(combine).orderBy(desc(combine.createdAt))
  return res
}

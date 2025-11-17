import { db } from 'src/db'
import { cosineDistance, desc, getTableColumns, gt, sql, eq, and, ne, isNull } from 'drizzle-orm'
import { PostScheduleTable } from 'src/db/schema/post-schedule'
import { PostEmbeddingTable } from 'src/db/schema/post-embedding'
import { PostTable } from 'src/db/schema/post'
import { RepostTable } from 'src/db/schema/repost'

const excludeEmbedding = () => {
  const { embedding, ...rest } = getTableColumns(PostScheduleTable)
  return rest
}

export const createPostSchedule = async postSchedule => {
  const [res] = await db.insert(PostScheduleTable).values(postSchedule).returning()
  const { embedding, ...rest } = res
  return rest
}

export const getPostSchedules = async params => {
  const res = await db.select(excludeEmbedding()).from(PostScheduleTable)
  return res
}

export const getPostScheduleById = async id => {
  const [res] = await db
    .select(excludeEmbedding())
    .from(PostScheduleTable)
    .where(eq(PostScheduleTable.id, id))
    .limit(1)
  return res
}

export const getPostScheduleByIdWithEmbedding = async id => {
  const [res] = await db
    .select()
    .from(PostScheduleTable)
    .where(eq(PostScheduleTable.id, id))
    .limit(1)
  return res
}

export const getSimilarityPostBySchedule = async schedule => {
  const { creatorId, embedding } = schedule
  const similarity = sql`1 - (${cosineDistance(PostEmbeddingTable.embedding, embedding)})`
  const res = await db
    .select({
      similarity,
      post: getTableColumns(PostTable)
    })
    .from(PostEmbeddingTable)
    .leftJoin(PostTable, eq(PostTable.id, PostEmbeddingTable.postId))
    .leftJoin(
      RepostTable,
      and(eq(RepostTable.creatorId, creatorId), eq(RepostTable.postId, PostTable.id))
    )
    .where(
      and(
        isNull(RepostTable.postId),
        gt(similarity, 0.5),
        ne(PostTable.creatorId, creatorId),
        gt(PostEmbeddingTable.createdAt, sql`now() - interval '3 day'`)
      )
    )
    .orderBy(t => desc(t.similarity))
    .limit(1)
  return res
}

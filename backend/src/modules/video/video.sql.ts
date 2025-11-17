import { db } from 'src/db'
import { VideoTable } from 'src/db/schema/video'
import { eq, desc } from 'drizzle-orm'

export const createVideo = async ({ prompt, imgUrl, detail, creatorId }) => {
  const { task_id } = detail.output
  const newVideo = { prompt, imgUrl, taskId: task_id, detail, creatorId }
  const [res] = await db.insert(VideoTable).values(newVideo).returning()
  return res
}

export const updateVideo = async ({ detail, key = null }) => {
  const { task_id } = detail.output
  await db.update(VideoTable).set({ detail, key }).where(eq(VideoTable.taskId, task_id))
}

export const getVideoByTaskId = async taskId => {
  const [res] = await db.select().from(VideoTable).where(eq(VideoTable.taskId, taskId))
  return res
}

export const queryVideos = async params => {
  const res = await db.select().from(VideoTable).orderBy(desc(VideoTable.createdAt))
  return res
}

import { db } from 'src/db'
import { ImageTable } from 'src/db/schema/image'
import { eq, desc } from 'drizzle-orm'

export const createImage = async ({ prompt, detail, creatorId }) => {
  const { task_id } = detail.output
  const newImage = { prompt, taskId: task_id, detail, creatorId }
  const [res] = await db.insert(ImageTable).values(newImage).returning()
  return res
}

export const updateImage = async ({ detail, key = null }) => {
  const { task_id } = detail.output
  await db.update(ImageTable).set({ detail, key }).where(eq(ImageTable.taskId, task_id))
}

export const getImageByTaskId = async taskId => {
  const [res] = await db.select().from(ImageTable).where(eq(ImageTable.taskId, taskId))
  return key2Url(res)
}

export const queryImages = async params => {
  const res = await db.select().from(ImageTable).orderBy(desc(ImageTable.createdAt))
  return res.map(key2Url)
}

const key2Url = item => {
  return {
    ...item,
    url: item.key ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${item.key}` : ''
  }
}

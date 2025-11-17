import { db } from 'src/db'
import { SongTable } from 'src/db/schema/song'
import { eq, desc } from 'drizzle-orm'

export const createSong = async ({ prompt, lyrics, creatorId, detail, taskId }) => {
  const newSong = { prompt, lyrics, creatorId, detail, taskId }
  const [res] = await db.insert(SongTable).values(newSong).returning()
  return res
}

export const updateSong = async (taskId, updated) => {
  await db.update(SongTable).set(updated).where(eq(SongTable.taskId, taskId))
}

export const getSongByTaskId = async taskId => {
  const [res] = await db.select().from(SongTable).where(eq(SongTable.taskId, taskId))
  return res
}

export const querySongs = async params => {
  const res = await db.select().from(SongTable).orderBy(desc(SongTable.createdAt))
  return res
}

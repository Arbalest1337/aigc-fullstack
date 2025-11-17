import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'

export const db = drizzle({
  connection: process.env.DB_URL,
  casing: 'snake_case'
})

export const getCurrentDbTime = async () => {
  const result = await db.execute(sql`SELECT NOW() as "dbNow"`)
  return result?.rows?.[0]?.dbNow as string
}

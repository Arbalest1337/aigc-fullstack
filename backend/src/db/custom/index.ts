import { customType, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const ulid = (name?: string) =>
  customType<{ data: string; driverData: string }>({
    dataType: () => 'ulid',
    fromDriver: value => value.toString()
  })(name)

export const primaryId = (name?: string) =>
  ulid(name)
    .primaryKey()
    .default(sql`gen_ulid()`)

export const createdAt = (name?: string) =>
  timestamp(name, { withTimezone: true })
    .notNull()
    .default(sql`now()`)

export const updatedAt = (name?: string) =>
  timestamp(name, { mode: 'string', withTimezone: true })
    .notNull()
    .$onUpdate(() => sql`now()`)

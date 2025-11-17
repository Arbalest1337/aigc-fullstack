import { UserTable } from '../schema/user'
import { ulid } from './index'

export const creatorId = (name?: string) =>
  ulid(name)
    .notNull()
    .references(() => UserTable.id, { onDelete: 'cascade' })

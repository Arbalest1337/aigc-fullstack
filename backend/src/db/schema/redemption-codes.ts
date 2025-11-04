import { pgTable, text, pgEnum } from 'drizzle-orm/pg-core'
import { primaryId, createTime, updateTime, ulid } from '../custom'
import { creatorId } from '../custom/user'
import { UserTable } from './user'

export enum RedemptionCodeStatus {
  Unused = 'unused',
  Redeemed = 'redeemed'
}

export const RedemptionCodeStatusEnum = pgEnum('redemption_code_status', [
  RedemptionCodeStatus.Unused,
  RedemptionCodeStatus.Redeemed
])

export const RedemptionCodeTable = pgTable('redemption_code', {
  id: primaryId(),
  creatorId: creatorId(),
  createTime: createTime(),
  updateTime: updateTime(),
  redeemerId: ulid().references(() => UserTable.id, { onDelete: 'set null' }),
  hashedCode: text().notNull().unique(),
  status: RedemptionCodeStatusEnum().notNull().default(RedemptionCodeStatus.Unused)
})

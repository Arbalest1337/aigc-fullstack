import { pgTable, integer, jsonb, boolean, check,text } from 'drizzle-orm/pg-core'
import { primaryId, createTime, updateTime } from '../custom'
import { sql } from 'drizzle-orm'

export const SubscriptionPlansTable = pgTable(
  'subscription_plans',
  {
    id: primaryId(),
    createTime: createTime(),
    updateTime: updateTime(),
    detail: jsonb(),
    price: integer().notNull(),
    duration: integer().notNull(),
    enabled: boolean().notNull().default(true),
    key: text().unique()
  },
  t => [
    check('subscription_plan_price_check', sql`${t.price} > 0`),
    check('subscription_plan_duration_check', sql`${t.duration} > 0`)
  ]
)

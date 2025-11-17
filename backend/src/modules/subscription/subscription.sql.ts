import { eq, sql, and, gt } from 'drizzle-orm'
import { db } from 'src/db'
import { SubscriptionPaymentsTable } from 'src/db/schema/subscription-payments'
import { SubscriptionPlansTable } from 'src/db/schema/subscription-plans'
import { SubscriptionsTable } from 'src/db/schema/subscriptions'

export const insertSubscription = async ({ userId, expiresAt }) => {
  const [res] = await db
    .insert(SubscriptionsTable)
    .values({
      userId,
      expiresAt
    })
    .returning()
  return res
}

export const updateSubscription = async (id, updated) => {
  const [res] = await db
    .update(SubscriptionsTable)
    .set(updated)
    .where(eq(SubscriptionsTable.id, id))
    .returning()
  return res
}

export const getSubscriptionByUserId = async (userId: string) => {
  const [res] = await db
    .select()
    .from(SubscriptionsTable)
    .where(eq(SubscriptionsTable.userId, userId))
    .limit(1)
  return res
}

export const insertSubscriptionPayment = async newPayment => {
  const [res] = await db.insert(SubscriptionPaymentsTable).values(newPayment).returning()
  return res
}

export const updateSubscriptionPayment = async (paymentIntentId: string, updated) => {
  const { status } = updated
  const [res] = await db
    .update(SubscriptionPaymentsTable)
    .set(updated)
    .where(
      and(
        eq(SubscriptionPaymentsTable.paymentIntentId, paymentIntentId),
        status ? eq(SubscriptionPaymentsTable.status, 'pending') : undefined
      )
    )
    .returning()
  return res
}

export const querySubscriptionPaymentByPaymentIntentId = async (paymentIntentId: string) => {
  const [res] = await db
    .select()
    .from(SubscriptionPaymentsTable)
    .where(eq(SubscriptionPaymentsTable.paymentIntentId, paymentIntentId))
    .limit(1)
  return res
}

export const querySubscriptionPlans = async (params?: { id: string }) => {
  const { id } = params ?? {}
  const res = await db
    .select()
    .from(SubscriptionPlansTable)
    .where(and(id ? eq(SubscriptionPlansTable.id, id) : undefined))
  return res
}

export const querySubscriptionByUserId = async ({
  userId,
  isActive
}: {
  userId: string
  isActive?: Boolean
}) => {
  const [res] = await db
    .select()
    .from(SubscriptionsTable)
    .where(
      and(
        eq(SubscriptionsTable.userId, userId),
        isActive ? gt(SubscriptionsTable.expiresAt, sql`now()`) : undefined
      )
    )
    .limit(1)
  return res
}

export const insertSubscriptionPlans=async (plans)=>{
   const res = await db.insert(SubscriptionPlansTable).values(plans).onConflictDoNothing().returning()
   return res
}

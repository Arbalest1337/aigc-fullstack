import { Injectable } from '@nestjs/common'
import { db } from 'src/db'
import { RedemptionCodeStatus, RedemptionCodeTable } from 'src/db/schema/redemption-codes'
import { createHmac, randomBytes } from 'crypto'

import { eq, and } from 'drizzle-orm'
@Injectable()
export class RedemptionCodeService {
  constructor() {}

  generateCode() {
    return randomBytes(8).toString('hex').toUpperCase()
  }

  hashCode(code: string) {
    const secret = 'arbalest1337'
    return createHmac('sha256', secret).update(code.toUpperCase()).digest('hex')
  }

  async generateRedemptionCode(creatorId: string) {
    const code = this.generateCode()
    const hashedCode = this.hashCode(code)
    await db.insert(RedemptionCodeTable).values({
      creatorId,
      hashedCode
    })
    return {
      code
    }
  }

  async redeemCode(code: string, redeemerId: string) {
    const hashedCode = this.hashCode(code)
    const [row] = await db
      .update(RedemptionCodeTable)
      .set({
        redeemerId,
        status: RedemptionCodeStatus.Redeemed
      })
      .where(
        and(
          eq(RedemptionCodeTable.hashedCode, hashedCode),
          eq(RedemptionCodeTable.status, RedemptionCodeStatus.Unused)
        )
      )
      .returning()
    if (!row) {
      throw new Error('No valid redemption code or this code has already been redeemed')
    }
    return { success: true }
  }
}

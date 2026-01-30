import { Injectable } from '@nestjs/common'
import { Client } from '@upstash/qstash'

const QSTASH_TOKEN = process.env.QSTASH_TOKEN

@Injectable()
export class QStashService {
  public readonly client: Client

  constructor() {
    this.client = new Client({ token: QSTASH_TOKEN })
  }
}

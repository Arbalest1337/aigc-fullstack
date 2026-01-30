import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { QStashService } from '../upstash/qstash/qstash.service'
import { WanTaskStatus, queryWanTask } from 'src/apis/wan.api'
import { S3Service } from '../s3/s3.service'
import * as ImageSql from './image.sql'
import { blue, red } from 'chalk'

const QSTASH_CALLBACK_URL = process.env.QSTASH_CALLBACK_URL

export const QSTASH_QUEUE = {
  queueName: 'aigc.image',
  url: `${QSTASH_CALLBACK_URL}/image/qstash`,
  failureCallback: `${QSTASH_CALLBACK_URL}/image/qstash/dlq`,
  parallelism: 2,
  retries: 3,
  delay: 10,
  retryDelay: '30000'
} as const

@Injectable()
export class ImageQStash implements OnModuleInit {
  private readonly logger = new Logger(ImageQStash.name)

  constructor(
    private readonly qstashService: QStashService,
    private readonly s3Service: S3Service
  ) {}

  async onModuleInit() {
    const { queueName, parallelism } = QSTASH_QUEUE
    await this.qstashService.client.queue({ queueName }).upsert({ parallelism })
  }

  async publish(taskId: string) {
    return await this.qstashService.client.publishJSON({
      ...QSTASH_QUEUE,
      failureCallback: `${QSTASH_QUEUE.failureCallback}/${taskId}`,
      body: { taskId }
    })
  }

  async handle(data: { taskId: string }) {
    const { taskId } = data
    const image = await queryWanTask(taskId)
    const { task_status: status } = image.output
    this.logger.log(`${blue(status)} ${taskId}`)

    if ([WanTaskStatus.PENDING, WanTaskStatus.RUNNING].includes(status)) {
      throw new Error(`Task ${taskId} is still processing (${status})`)
    }

    if (status === WanTaskStatus.SUCCEEDED) {
      await this.onImageSucceed(image)
      return { success: true, status, taskId }
    }

    await this.onImageFailed(image)
    return { success: false, status, taskId }
  }

  async handleDLQ(taskId: string) {
    this.logger.warn(`${red('DLQ')} ${taskId}`)
    return { dlq: true, taskId, success: false }
  }

  async onImageSucceed(detail) {
    const { url } = detail.output.results[0]
    const { key } = await this.s3Service.putUrl(url, 'image')
    await ImageSql.updateImage({ detail, key })
  }

  async onImageFailed(detail) {
    await ImageSql.updateImage({ detail })
  }
}

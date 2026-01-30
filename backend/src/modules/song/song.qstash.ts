import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { QStashService } from '../upstash/qstash/qstash.service'
import { blue, red } from 'chalk'
import { SongService } from './song.service'
import { queryMurekaTask, MurekaTaskInPending, MurekaTaskStatus } from 'src/apis/mureka.api'

const QSTASH_CALLBACK_URL = process.env.QSTASH_CALLBACK_URL

export const QSTASH_QUEUE = {
  queueName: 'aigc.song',
  url: `${QSTASH_CALLBACK_URL}/song/qstash`,
  failureCallback: `${QSTASH_CALLBACK_URL}/song/qstash/dlq`,
  parallelism: 2,
  retries: 3,
  delay: 15,
  retryDelay: '30000'
} as const

@Injectable()
export class SongQStash implements OnModuleInit {
  private readonly logger = new Logger(SongQStash.name)

  constructor(
    private readonly qstashService: QStashService,
    private readonly songService: SongService
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

  async handle({ taskId }: { taskId: string }) {
    const songTask = await queryMurekaTask(taskId)
    const { status } = songTask
    this.logger.log(`${blue(status)} ${taskId}`)
    if (MurekaTaskInPending.includes(status)) {
      throw new Error(`Task ${taskId} is still processing (${status})`)
    }
    if (status === MurekaTaskStatus.SUCCEEDED) {
      await this.songService.onSongTaskSucceed(taskId, songTask)
      return { success: true, status }
    }

    await this.songService.onSongTaskFailed(taskId, songTask)
    return { success: false, status }
  }

  async handleDLQ(taskId: string) {
    this.logger.warn(`${red('DLQ')} ${taskId}`)
    return { dlq: true, taskId, success: false }
  }
}

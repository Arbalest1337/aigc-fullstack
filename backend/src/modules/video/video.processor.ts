import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, DelayedError } from 'bullmq'
import { blue, red } from 'chalk'
import { WanTaskStatus, queryWanTask } from 'src/apis/wan.api'
import { VideoService } from './video.service'
import { QUEUE_TASK } from 'src/utils/queue'

@Processor(QUEUE_TASK.VIDEO, { concurrency: 10, autorun: false, drainDelay: 15 })
@Injectable()
export class VideoProcessor extends WorkerHost {
  constructor(private readonly videoService: VideoService) {
    super()
  }
  private readonly logger = new Logger(QUEUE_TASK.VIDEO)

  async process(job: Job<any, any, string>) {
    try {
      const { taskId } = job.data
      const video = await queryWanTask(taskId)
      const { task_status: status } = video.output
      if ([WanTaskStatus.PENDING, WanTaskStatus.RUNNING].includes(status)) {
        await job.moveToDelayed(Date.now() + 15_000)
        throw new DelayedError()
      } else if (
        [WanTaskStatus.FAILED, WanTaskStatus.CANCELED, WanTaskStatus.UNKNOWN].includes(status)
      ) {
        await this.videoService.onVideoFailed(video)
        this.logger.log(`${red(status)} ${taskId}`)
      } else if (status === WanTaskStatus.SUCCEEDED) {
        await this.videoService.onVideoSucceed(video)
        this.logger.log(`${blue(status)} ${taskId}`)
      }
    } catch (err) {
      this.logger.log(`${red('ERROR')} ${err}`)
      throw err
    }
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, DelayedError } from 'bullmq'
import { blue, red } from 'chalk'
import { WanTaskStatus, queryWanTask } from 'src/apis/wan.api'
import { ImageService } from 'src/modules/image/image.service'
import { QUEUE_TASK } from 'src/utils/queue'

@Processor(QUEUE_TASK.IMAGE, { concurrency: 10, autorun: false, drainDelay: 15 })
@Injectable()
export class ImageProcessor extends WorkerHost {
  constructor(private readonly imageService: ImageService) {
    super()
  }
  private readonly logger = new Logger(QUEUE_TASK.IMAGE)

  async process(job: Job, token?: string) {
    try {
      const { taskId } = job.data
      const image = await queryWanTask(taskId)
      const { task_status } = image.output
      if ([WanTaskStatus.PENDING, WanTaskStatus.RUNNING].includes(task_status)) {
        this.logger.log(`${blue(task_status)} ${taskId}`)
        await job.moveToDelayed(Date.now() + 6_000, token)
        throw new DelayedError()
      } else if (task_status === WanTaskStatus.SUCCEEDED) {
        await this.imageService.onImageSucceed(image)
        this.logger.log(`${blue(task_status)} ${taskId}`)
      } else if (
        [WanTaskStatus.UNKNOWN, WanTaskStatus.FAILED, WanTaskStatus.CANCELED].includes(task_status)
      ) {
        await this.imageService.onImageFailed(image)
        this.logger.log(`${red(task_status)} ${taskId}`)
      }
    } catch (err) {
      this.logger.log(`${red('ERROR')} ${err}`)
      throw err
    }
  }
}

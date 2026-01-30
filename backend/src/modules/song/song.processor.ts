import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, DelayedError } from 'bullmq'
import { blue, red } from 'chalk'
import { queryMurekaTask, MurekaTaskStatus } from 'src/apis/mureka.api'
import { SongService } from './song.service'
import { QUEUE_TASK } from 'src/utils/queue'

@Processor(QUEUE_TASK.SONG, { concurrency: 10, autorun: false, drainDelay: 15 })
@Injectable()
export class SongProcessor extends WorkerHost {
  constructor(private readonly songService: SongService) {
    super()
  }
  private readonly logger = new Logger(QUEUE_TASK.SONG)

  async process(job: Job<any, any, string>) {
    try {
      const { taskId } = job.data
      const songTask = await queryMurekaTask(taskId)
      const { status } = songTask

      if (
        [
          MurekaTaskStatus.PREPARING,
          MurekaTaskStatus.QUEUED,
          MurekaTaskStatus.RUNNING,
          MurekaTaskStatus.STREAMING,
          MurekaTaskStatus.REVIEWING
        ].includes(status)
      ) {
        await job.moveToDelayed(Date.now() + 15_000)
        throw new DelayedError()
      } else if (
        [MurekaTaskStatus.FAILED, MurekaTaskStatus.CANCELLED, MurekaTaskStatus.TIMEOUTED].includes(
          status
        )
      ) {
        await this.songService.onSongTaskFailed(taskId, songTask)
        this.logger.log(`${red(status)} ${taskId}`)
      } else if (status === MurekaTaskStatus.SUCCEEDED) {
        await this.songService.onSongTaskSucceed(taskId, songTask)
        this.logger.log(`${blue(status)} ${taskId}`)
      }
    } catch (err) {
      this.logger.error(`${red('ERROR')} ${err}`)
      throw err
    }
  }
}

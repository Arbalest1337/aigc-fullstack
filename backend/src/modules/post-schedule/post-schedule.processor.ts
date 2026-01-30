import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { getPostScheduleByIdWithEmbedding, getSimilarityPostBySchedule } from './post-schedule.sql'
import { red, blue } from 'chalk'
import { PostService } from '../post/post.service'
import { generatePost } from 'src/apis/openai/openai.api'
import { S3Service } from '../s3/s3.service'
import { QUEUE_TASK } from 'src/utils/queue'

@Processor(QUEUE_TASK.POST_SCHEDULE, { concurrency: 10, autorun: false, drainDelay: 15 })
@Injectable()
export class PostScheduleProcessor extends WorkerHost {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service
  ) {
    super()
  }
  private readonly logger = new Logger(QUEUE_TASK.POST_SCHEDULE)

  async process(job: Job<any, any, string>) {
    try {
      const { id } = job.data
      const schedule = await getPostScheduleByIdWithEmbedding(id)
      if (!schedule.enable) {
        this.logger.log(`${red('SCHEDULE DISABLED')} ${id}`)
        return
      }
      const [mostSimilarPost] = await getSimilarityPostBySchedule(schedule)
      if (mostSimilarPost) {
        // repost
        const newRepost = await this.postService.createRepost({
          postId: mostSimilarPost.post.id,
          scheduleId: id,
          creatorId: schedule.creatorId
        })
        this.logger.log(`${blue('REPOST')} ${newRepost.id}`)
      } else {
        // new post
        const { content, base64Img } = await generatePost({ prompt: schedule.keywords })
        const params = { content, creatorId: schedule.creatorId, media: [], scheduleId: id }
        if (base64Img) {
          const { key } = await this.s3Service.putBase64(base64Img, 'video')
          params.media = [{ type: 'image', url: key }]
        }
        const newPost = await this.postService.createPost(params)
        this.logger.log(`${blue('NEW POST')} ${newPost.id}`)
      }
    } catch (err) {
      this.logger.log(`${red('ERROR')} ${err}`)
      throw err
    }
  }
}

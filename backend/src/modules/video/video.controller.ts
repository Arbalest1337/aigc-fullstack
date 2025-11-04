import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { VideoService } from './video.service'
import {
  imageToVideoSchema,
  textToVideoSchema,
  TextToVideoDto,
  ImageToVideoDto
} from './video.schema'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { RequireSubscription } from '../subscription/subscription.decorator'

@Auth()
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @RequireSubscription()
  @Post('text-to-video')
  async textToVideo(@ZodBody(textToVideoSchema) params: TextToVideoDto, @CurrentUser() user) {
    const res = await this.videoService.textToVideo({ ...params, creatorId: user.id })
    return res
  }

  @RequireSubscription()
  @Post('image-to-video')
  async imageToVideo(@ZodBody(imageToVideoSchema) params: ImageToVideoDto, @CurrentUser() user) {
    const res = await this.videoService.imageToVideo({ ...params, creatorId: user.id })
    return res
  }

  @Get('query')
  async queryVideos(@Query() params) {
    const res = await this.videoService.queryVideos(params)
    return res
  }

  @Get('/:taskId')
  async getVideoByTaskId(@Param('taskId') taskId: string) {
    const res = await this.videoService.getVideoByTaskId(taskId)
    return res
  }
}

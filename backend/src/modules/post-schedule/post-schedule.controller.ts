import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import {
  createPostScheduleSchema,
  CreatePostScheduleDto,
  getSimilarityPostSchema,
  GetSimilarityPostDto
} from './post-schedule.schema'
import { PostScheduleService } from './post-schedule.service'
import { PostScheduleProducer } from './post-schedule.producer'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { RequireSubscription } from '../subscription/subscription.decorator'

@Auth()
@Controller('post-schedule')
export class PostScheduleController {
  constructor(
    private readonly postScheduleService: PostScheduleService,
    private readonly postScheduleProducer: PostScheduleProducer
  ) {}

  @RequireSubscription()
  @Post('create')
  async createPostSchedule(
    @ZodBody(createPostScheduleSchema) body: CreatePostScheduleDto,
    @CurrentUser() user
  ) {
    const res = await this.postScheduleService.createPostSchedule({ ...body, creatorId: user.id })
    return res
  }

  @Get('query')
  async getPostSchedules(@Query() query) {
    const res = await this.postScheduleService.getPostSchedules(query)
    return res
  }

  @Post('similarity-post')
  async getSimilarityPost(@ZodBody(getSimilarityPostSchema) body: GetSimilarityPostDto) {
    const res = await this.postScheduleService.getSimilarityPost(body)
    return res
  }

  @RequireSubscription()
  @Post('process')
  async add(@Body() body) {
    const { id } = body
    this.postScheduleProducer.addToQueue(id)
    return true
  }
}

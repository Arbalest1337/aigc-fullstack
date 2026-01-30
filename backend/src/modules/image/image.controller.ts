import { Controller, Get, Param, Post, Query, UseGuards, Body } from '@nestjs/common'
import { ImageService } from 'src/modules/image/image.service'
import { GenerateImageDto, generateImageSchema } from 'src/modules/image/image.schema'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { RequireSubscription } from '../subscription/subscription.decorator'
import { QStashGuard } from '../upstash/qstash/qstash.guard'
import { ImageQStash } from './image.qstash'
@Auth()
@Controller('image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly imageQStash: ImageQStash
  ) {}

  @RequireSubscription()
  @Post('text-to-image')
  async textToImage(
    @ZodBody(generateImageSchema) body: GenerateImageDto,
    @CurrentUser('id') creatorId
  ) {
    const res = await this.imageService.textToImage({ ...body, creatorId })
    return res
  }

  @Get('query')
  async queryImages(@Query() params) {
    const res = await this.imageService.queryImages(params)
    return res
  }

  @Get(':taskId')
  async getImageByTaskId(@Param('taskId') taskId: string) {
    const res = await this.imageService.getImageByTaskId(taskId)
    return res
  }

  @Post('qstash')
  @Public()
  @UseGuards(QStashGuard)
  async handleQStash(@Body() body: any) {
    return await this.imageQStash.handle(body)
  }

  @Post('qstash/dlq/:taskId')
  @Public()
  @UseGuards(QStashGuard)
  async handleQStashDLQ(@Param('taskId') taskId: string) {
    return await this.imageQStash.handleDLQ(taskId)
  }
}

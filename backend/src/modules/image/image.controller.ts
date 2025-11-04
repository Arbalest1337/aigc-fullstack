import { Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ImageService } from 'src/modules/image/image.service'
import { GenerateImageDto, generateImageSchema } from 'src/modules/image/image.schema'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { Auth } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { RequireSubscription } from '../subscription/subscription.decorator'

@Auth()
@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

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
}

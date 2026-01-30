import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common'
import { SongService } from './song.service'
import { Auth, Public } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { generateSongSchema, GenerateSongDto } from './song.schema'
import { RequireSubscription } from '../subscription/subscription.decorator'
import { SongQStash } from './song.qstash'
import { QStashGuard } from '../upstash/qstash/qstash.guard'

@Auth()
@Controller('song')
export class SongController {
  constructor(
    private readonly songService: SongService,
    private readonly songQStash: SongQStash
  ) {}

  @RequireSubscription()
  @Post('generate')
  async generateSong(
    @ZodBody(generateSongSchema) body: GenerateSongDto,
    @CurrentUser('id') creatorId
  ) {
    const res = await this.songService.generateSong({ ...body, creatorId })
    await this.songQStash.publish(res.taskId)
    return res
  }

  @Get('query')
  async querySongs(@Query() params) {
    const res = await this.songService.querySongs(params)
    return res
  }

  @Get(':taskId')
  async getSongByTaskId(@Param('taskId') taskId: string) {
    const res = await this.songService.getSongByTaskId(taskId)
    return res
  }

  @Post('qstash')
  @Public()
  @UseGuards(QStashGuard)
  async handleQStash(@Body() body: any) {
    return await this.songQStash.handle(body)
  }

  @Post('qstash/dlq/:taskId')
  @Public()
  @UseGuards(QStashGuard)
  async handleQStashDLQ(@Param('taskId') taskId: string) {
    return await this.songQStash.handleDLQ(taskId)
  }
}

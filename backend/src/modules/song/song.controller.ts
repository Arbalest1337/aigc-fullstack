import { Controller, Get, Post, Param, Query } from '@nestjs/common'
import { SongService } from './song.service'
import { Auth } from 'src/decorators/auth.decorator'
import { ZodBody } from 'src/decorators/zod-body.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { generateSongSchema, GenerateSongDto } from './song.schema'
import { RequireSubscription } from '../subscription/subscription.decorator'


@Auth()
@Controller('song')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @RequireSubscription()
  @Post('generate')
  async generateSong(
    @ZodBody(generateSongSchema) body: GenerateSongDto,
    @CurrentUser('id') creatorId
  ) {
    const res = await this.songService.generateSong({ ...body, creatorId })
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
}

import { Injectable } from '@nestjs/common'
import { S3Service } from '../s3/s3.service'
import { generateMurekaSong } from 'src/apis/mureka.api'
import * as SongSql from './song.sql'
@Injectable()
export class SongService {
  constructor(private readonly s3Service: S3Service) {}

  async generateSong(params) {
    const { prompt = '', lyrics = '', creatorId } = params
    const detail = await generateMurekaSong({ prompt, lyrics })
    const taskId = detail.id
    const result = await SongSql.createSong({
      prompt,
      lyrics,
      detail,
      creatorId,
      taskId
    })
    return result
  }

  async onSongTaskSucceed(taskId, detail) {
    const processed = await Promise.all(
      detail.choices.map(async song => ({
        ...song,
        key: (await this.s3Service.putUrl(song.url, 'song')).key
      }))
    )
    await SongSql.updateSong(taskId, {
      detail: {
        ...detail,
        choices: processed
      }
    })
  }

  async onSongTaskFailed(taskId, detail) {
    await SongSql.updateSong(taskId, { detail })
  }

  async getSongByTaskId(taskId) {
    const res = await SongSql.getSongByTaskId(taskId)
    return res
  }

  async querySongs(params) {
    const res = await SongSql.querySongs(params)
    return res
  }
}

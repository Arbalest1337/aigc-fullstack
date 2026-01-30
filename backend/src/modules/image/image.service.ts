import { Injectable } from '@nestjs/common'
import { WanText2Image } from 'src/apis/wan.api'
import * as ImageSql from './image.sql'
import { S3Service } from '../s3/s3.service'
import { ImageQStash } from './image.qstash'

@Injectable()
export class ImageService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly imageQStash: ImageQStash
  ) {}

  async textToImage(params) {
    const { prompt, creatorId } = params
    const res = await WanText2Image(prompt)
    const result = await ImageSql.createImage({ prompt, detail: res, creatorId })
    await this.imageQStash.publish(result.taskId)
    return result

    // await this.imageQStash.publish(crypto.randomUUID())
    // return prompt
  }

  async getImageByTaskId(taskId) {
    const res = await ImageSql.getImageByTaskId(taskId)
    return res
  }

  async queryImages(params) {
    const res = await ImageSql.queryImages(params)
    return res
  }

  async onImageSucceed(detail) {
    const { url } = detail.output.results[0]
    const { key } = await this.s3Service.putUrl(url, 'image')
    await ImageSql.updateImage({ detail, key })
  }

  async onImageFailed(detail) {
    await ImageSql.updateImage({ detail })
  }
}

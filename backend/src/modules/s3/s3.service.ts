import { BadRequestException, Injectable } from '@nestjs/common'
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { v4 as uuidV4 } from 'uuid'
import { fromBuffer } from 'file-type'

@Injectable()
export class S3Service {
  private readonly client: S3Client
  private readonly bucket: string
  constructor() {
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY
      }
    })
  }

  async put(buffer, folder = 'uploads') {
    const { ext, mime } = await fromBuffer(buffer)
    const key = `arbalest-ai/${folder}/${uuidV4()}.${ext}`
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mime
    })
    await this.client.send(command)
    return {
      key
    }
  }

  async putBase64(base64, folder) {
    const buffer = Buffer.from(base64, 'base64')
    return await this.put(buffer, folder)
  }

  async putUrl(url, folder = 'uploads') {
    const res = await fetch(url)
    if (!res.ok || !res.body)
      throw new BadRequestException(`Failed to fetch file: ${res.statusText}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const result = await this.put(buffer, folder)
    return result
  }

  async del(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    })
    await this.client.send(command)
  }

  async get(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    })
    const res = await this.client.send(command)
    return res
  }
}

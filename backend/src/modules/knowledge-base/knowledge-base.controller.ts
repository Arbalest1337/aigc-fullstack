import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { Auth } from 'src/decorators/auth.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import * as Sql from './knowledge.sql'
import { KnowledgeBaseService } from './knowledge-base.service'

@Auth()
@Controller('knowledge-base')
export class PostScheduleController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  async getKnowledgeBase() {
    const res = await Sql.getKnowledgeBase()
    return res
  }

  @Post()
  async createKnowledge(@Body() body, @CurrentUser('id') creatorId: string) {
    const res = await Sql.insertKnowledgeBase({ creatorId, ...body })
    return res
  }

  @Get('documents')
  async getDocuments(@Query() query: { knowledgeBaseId?: string }) {
    const res = await Sql.getKnowledgeBaseDocuments(query)
    return res
  }

  @Post('documents')
  async createDocument(
    @Body()
    body: {
      knowledgeBaseId: string
      name: string
      content: string
    },
    @CurrentUser('id') creatorId: string
  ) {
    const res = await Sql.insertKnowledgeBaseDocument({ creatorId, ...body })
    return res
  }

  @Get('chunks')
  async getChunks(@Query() query: { knowledgeBaseDocumentId?: string }) {
    const res = await Sql.getKnowledgeBaseChunks(query)
    return res
  }

  @Post('chat')
  async chat(@Body() body: { input: string; knowledgeBaseId: string }) {
    const res = await this.knowledgeBaseService.chat({ body })
    return res
  }
}

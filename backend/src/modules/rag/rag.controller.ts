import { Controller, Get, Post, Body, Query, Sse } from '@nestjs/common'
import { Auth } from 'src/decorators/auth.decorator'
import { CurrentUser } from 'src/decorators/currentUser.decorator'
import { RagService } from './rag.service'

@Auth()
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('knowledge-base')
  async getKnowledgeBase() {
    const res = await this.ragService.getKnowledgeBase()
    return res
  }

  @Post('knowledge-base')
  async createKnowledgeBase(@Body() body, @CurrentUser('id') creatorId: string) {
    const res = await this.ragService.createKnowledgeBase({ creatorId, ...body })
    return res
  }

  @Get('documents')
  async getDocuments(@Query() query: { knowledgeBaseId?: string }) {
    const res = await this.ragService.getDocuments(query)
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
    const document = await this.ragService.createDocument({ creatorId, ...body })
    await this.ragService.handleProcessDocument(document.id)
    return document
  }

  @Get('chunks')
  async getChunks(@Query() query: { documentId?: string }) {
    const res = await this.ragService.getChunks(query)
    return res
  }

  @Post('chat')
  @Sse()
  async chat(@Body() body: { input: string; knowledgeBaseId: string }) {
    const res = await this.ragService.chat(body)
    return res
  }
}

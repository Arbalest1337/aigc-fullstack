import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import * as Sql from './knowledge.sql'
import { getEmbeddings, chat } from 'src/apis/gemini.api'
@Injectable()
export class KnowledgeBaseService {
  constructor() {}

  async getTextChunks(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100
    })
    const chunks = await splitter.splitText(text)
    return chunks
  }

  async getKnowledgeBase() {}

  async createKnowledgeBase() {}

  async getKnowledgeBaseDocuments() {}

  async addKnowledgeBaseDocument() {}

  async deleteKnowledgeBaseDocument() {}

  async getKnowledgeBaseChunks() {}

  async chatWithKnowledgeBase() {}

  async chunkToEmbedding(chunk) {}

  async chat({ input, knowledgeBaseId }: { input: string; knowledgeBaseId: string }) {
    const [embedding] = await getEmbeddings([input])
    const chunks = await Sql.getSimilarityChunkTextsByKnowledgeBase({
      embedding,
      knowledgeBaseId
    })
    console.log(chunks)
    const systemInstruction = `
    对于用户的提问:(${input})
    请根据以下括号内的内容进行回答:(${chunks.map(item => item.text).join(' ')})
    如果以上内容没有答案，切勿胡编乱造，直接回答用户你不知道`
    const res = await chat({ input, systemInstruction })
    console.log(res)
  }
}

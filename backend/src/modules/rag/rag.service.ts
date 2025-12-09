import { Injectable } from '@nestjs/common'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import * as Sql from './rag.sql'
import { getEmbeddings, generateResponse } from 'src/apis/gemini.api'
import { chatWithQwen3 } from 'src/apis/ollama.api'
import { RagDocumentStatus } from 'src/db/schema/rag-documents'
import { from, map, tap } from 'rxjs'
@Injectable()
export class RagService {
  constructor() {}

  async handleProcessDocument(documentId: string) {
    await Sql.updateDocument(documentId, { status: RagDocumentStatus.Processing })
    try {
      await this.processDocument(documentId)
      await Sql.updateDocument(documentId, { status: RagDocumentStatus.Completed })
    } catch (err) {
      console.log(err)
      await Sql.updateDocument(documentId, { status: RagDocumentStatus.Failed })
    }
  }

  async processDocument(documentId: string) {
    const document = await Sql.getDocumentById(documentId)
    const textChunks = await this.splitText(document.content)
    const embeddings = await getEmbeddings(textChunks)

    for (const [index, text] of textChunks.entries()) {
      const chunk = await Sql.insertChunk({
        text,
        index,
        documentId
      })
      await Sql.insertEmbedding({
        embedding: embeddings[index],
        chunkId: chunk.id
      })
    }
  }

  async splitText(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 20
    })
    const chunks = await splitter.splitText(text)
    return chunks
  }

  async getKnowledgeBase() {
    const res = await Sql.getKnowledgeBase()
    return res
  }

  async createKnowledgeBase(payload) {
    const res = await Sql.insertKnowledgeBase(payload)
    return res
  }

  async getDocuments(payload) {
    const res = await Sql.getDocuments(payload)
    return res
  }

  async createDocument(payload) {
    const res = await Sql.insertDocument(payload)
    return res
  }

  async getChunks(payload) {
    const res = await Sql.getChunks(payload)
    return res
  }

  async chat({ input, knowledgeBaseId }: { input: string; knowledgeBaseId: string }) {
    const [embedding] = await getEmbeddings([input])
    const chunks = await Sql.getSimilarityChunkTextsByKnowledgeBase({
      embedding,
      knowledgeBaseId
    })
    const systemInstruction = `
    - 对于用户的提问:(${input})
    - 请根据以下括号内的内容进行回答:(${chunks.map(item => item.text).join(' ')})
    - 如果这些内容里有答案，就用它们回答问题
    - 如果没有，你可以尝试基于通用知识和常识回答 — 但请明确说明你是在根据通用知识回答
    - 如果确实不知道，请如实回答用户不知道，切勿胡编乱造
    - 回答不要出现诸如“根据提供的内容…”之类的系统相关词语，不要让用户感知事先给你提供了内容，只专注于回答问题
    `
    const stream = await chatWithQwen3({ input, systemInstruction })
    const decoder = new TextDecoder('utf-8')

    const observable = from(stream.body).pipe(
      map(chunk => {
        const data = decoder.decode(chunk, { stream: true })
        return data
      })
    )

    return observable
  }
}

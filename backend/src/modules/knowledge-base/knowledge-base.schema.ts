import { z } from 'zod'

export const insertKnowledgeBaseSchema = z.object({
  name: z.string()
})
export type InsertKnowledgeBaseDto = z.infer<typeof insertKnowledgeBaseSchema>

export const insertKnowledgeBaseDocumentSchema = z.object({
  name: z.string()
})
export type InsertKnowledgeBaseDto = z.infer<typeof insertKnowledgeBaseSchema>

import { GoogleGenAI } from '@google/genai'

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export const getEmbeddings = async (texts: string[]) => {
  const resp = await client.models.embedContent({
    model: 'gemini-embedding-001',
    contents: texts,
    config: {
      outputDimensionality: 1536
    }
  })
  const res = resp.embeddings.map(item => item.values)
  return res
}

export const generateResponse = async ({ input, systemInstruction }) => {
  const response = await client.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: input }]
      }
    ],
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 2000
    }
  })
  return response
}



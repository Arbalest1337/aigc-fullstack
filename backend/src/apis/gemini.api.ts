import { GoogleGenAI } from '@google/genai'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

setGlobalDispatcher(new ProxyAgent(process.env.HTTP_PROXY))
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export const getEmbeddings = async (texts: string[]) => {
  const resp = await client.models.embedContent({
    model: 'gemini-embedding-001',
    contents: texts
  })
  return resp.embeddings.map(item => item.values)
}

export const chat = async ({ input, systemInstruction }) => {
  const response = await ai.models.generateContent({
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
      maxOutputTokens: 200
    }
  })

  return response.text()
}

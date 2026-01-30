import OpenAI from 'openai'

export const openai = new OpenAI()

export const chat = async prompt => {
  const res = await openai.responses.create({
    model: 'gpt-5-nano',
    input: [
      {
        role: 'system',
        content: ''
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: prompt }]
      }
    ]
  })
  return res.output_text
}

export const getEmbedding = async content => {
  const input = content.replaceAll('\n', ' ')
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input
  })
  return res.data[0].embedding
}

export const generatePost = async ({ prompt }) => {
  const res = await openai.responses.create({
    model: 'gpt-4.1-mini',
    tools: [
      { type: 'web_search' } as any,
      {
        type: 'image_generation',
        output_format: 'jpeg',
        output_compression: 25,
        quality: 'auto',
        size: '1024x1024'
      }
    ],
    input: [
      {
        role: 'system',
        content: `基于用户输入，调用web_search搜索相关新闻时事,务必保证搜索的内容是当前时间一个月内发生的，写一篇300字左右的社交博文，需带表情和#标签,除此之外不要附带任何内容`
      },
      {
        role: 'user',
        content: prompt
      },
      {
        role: 'system',
        content: '根据上一步生成的博文，使用image_generation生成一张封面图'
      }
    ]
  })

  const content = res.output_text
  const image = res.output.find(
    item => item.type === 'image_generation_call' && item.status === 'completed'
  )

  return {
    content,
    base64Img: (image as any)?.result
  }
}

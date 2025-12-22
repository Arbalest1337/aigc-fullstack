import { z } from 'zod'

export const createPostSchema = z
  .object({
    content: z.string(),
    media: z.array(
      z.object({
        type: z.string(),
        url: z.string()
      })
    )
  })
  .required()

export type CreatePostDto = z.infer<typeof createPostSchema>

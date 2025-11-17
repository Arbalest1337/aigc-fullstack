'use client'
import markdownit from 'markdown-it'

export default function Post({ post }) {
  const md = markdownit()
  const mdContent = md.render(post.content)

  return (
    <div className="p-8">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 w-[240px] shrink-0 ">
          {post.media?.map(m => (
            <img
              className="block"
              key={m.url}
              src={process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL + m.url}
              alt=""
            />
          ))}

          <div className="text-[14px]">
            <div className="text-gray-400 mr-2">ID</div>
            <div>{post.id}</div>
            <div className="text-gray-400 mr-2">Creator</div>
            <div>{post.creatorId}</div>
            {post.repostId && (
              <>
                <div className="text-gray-400 mr-2">Repost ID</div>
                <div>{post.repostId}</div>
                <div className="text-gray-400 mr-2">Repost Creator</div>
                <div>{post.repostCreatorId}</div>
              </>
            )}
            <div className="text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: mdContent }}></div>
      </div>
    </div>
  )
}

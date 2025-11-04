import Link from 'next/link'

export default function Home() {
  const menu = [
    {
      name: 'Song',
      path: '/song'
    },
    {
      name: 'Image',
      path: '/image'
    },
    {
      name: 'Video',
      path: '/video'
    },
    {
      name: 'Post',
      path: '/post'
    },
    {
      name: 'Post Schedule',
      path: '/post-schedule'
    },
    {
      name: 'Stripe',
      path: '/stripe'
    },
    {
      name: 'Redemption Code',
      path: '/redemption-code'
    }
  ]

  return (
    <div className="flex gap-5">
      {menu.map(({ name, path }) => (
        <Link key={path} href={path} className="font-[20px] cursor-pointer bold">
          {name}
        </Link>
      ))}
    </div>
  )
}

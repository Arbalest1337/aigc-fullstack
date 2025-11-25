'use client'

export default function AccountInfo({ account }) {
  const { id, name, username } = account ?? {}

  return (
    <div className="flex flex-col gap-4">
      <div> Authorized </div>
      <div className="text-gray-400">
        id <b className="text-white">{id}</b>
      </div>
      <div className="text-gray-400">
        name <b className="text-white">{name}</b>
      </div>
      <div className="text-gray-400">
        username <b className="text-white">{username}</b>
      </div>
    </div>
  )
}

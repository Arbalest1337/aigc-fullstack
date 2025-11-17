'use client'
import { useState } from 'react'
import CreateTweet from './CreateTweet'
import PostToTweet from './PostToTweet'
export default function Authorized({ account }) {
  return (
    <div className="flex flex-col gap-4">
      <div> Authorized </div>
      <div className="text-gray-400">
        id <b className="text-white">{account.id}</b>
      </div>
      <div className="text-gray-400">
        name <b className="text-white">{account.name}</b>
      </div>
      <div className="text-gray-400">
        username <b className="text-white">{account.username}</b>
      </div>

      <CreateTweet />
      <PostToTweet />
    </div>
  )
}

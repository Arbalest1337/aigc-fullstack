'use client'
import { useEffect, useState } from 'react'
import useRequest from '@/hooks/useRequest'

export default function Home() {
  const request = useRequest()
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const onGetUserInfo = async () => {
    setUserInfo(null)
    try {
      setLoading(true)
      const res = await request({ url: '/user/info' })
      setUserInfo(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    onGetUserInfo()
  }, [])

  return (
    <>
      <button className="block my-4" disabled={loading} onClick={() => onGetUserInfo()}>
        {loading ? 'Loading...' : 'Get UserInfo'}
      </button>

      {!loading && userInfo?.id && (
        <>
          <h4>UserId: {userInfo.id}</h4>
          <h4>Nickname: {userInfo.nickname}</h4>
          <h4>CreatedAt: {userInfo.createdAt}</h4>
        </>
      )}
    </>
  )
}

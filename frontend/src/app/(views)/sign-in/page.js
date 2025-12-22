'use client'
import { useEffect, useState } from 'react'
import { setJwt } from '@/utils/jwt'
import { useRouter } from 'next/navigation'
import useRequest from '@/hooks/useRequest'

export default function SignIn() {
  const request = useRequest()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const onSignIn = async () => {
    try {
      setLoading(true)
      const data = await request({
        url: '/auth/sign-in',
        method: 'POST',
        data: {
          username,
          password
        }
      })
      if (data?.accessToken) {
        setJwt(data.accessToken)
        router.push('/home')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setConfirmPassword('')
    setNickname('')
  }, [isSignUp])

  const onSignUp = async () => {
    if (password !== confirmPassword) {
      alert(`Passwords don't match`)
      return
    }
    try {
      setLoading(true)
      await request({
        url: '/auth/sign-up',
        method: 'POST',
        data: {
          username,
          password,
          nickname
        }
      })
      alert('Sign Up successfully')
      setIsSignUp(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      <style jsx global>{`
        @keyframes drift {
          0% { transform: translate(-10%, -10%) scale(1); opacity: 0.2; }
          50% { transform: translate(10%, 10%) scale(1.3); opacity: 0.5; }
          100% { transform: translate(-10%, -10%) scale(1); opacity: 0.2; }
        }
        @keyframes drift-reverse {
          0% { transform: translate(10%, 10%) scale(1.3); opacity: 0.4; }
          50% { transform: translate(-10%, -10%) scale(1); opacity: 0.2; }
          100% { transform: translate(10%, 10%) scale(1.3); opacity: 0.4; }
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-drift {
          animation: drift 12s ease-in-out infinite;
        }
        .animate-drift-reverse {
          animation: drift-reverse 15s ease-in-out infinite;
        }
        .bg-silver-flow {
          background: linear-gradient(-45deg, #050505, #151515, #333333, #151515, #050505);
          background-size: 300% 300%;
          animation: gradient-move 10s ease infinite;
        }
      `}</style>

      {/* High-Visible Silver Flow Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-silver-flow">
        {/* Bright Silver/White Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/[0.12] blur-[150px] rounded-full animate-drift"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-white/[0.08] blur-[150px] rounded-full animate-drift-reverse"></div>
        
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.3] brightness-75 contrast-125 mix-blend-screen"></div>
        
        {/* Decorative Light Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[size:100%_4px] pointer-events-none"></div>

        {/* Visible Dark Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full px-6">
        {/* Card separation light */}
        <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full -z-10 opacity-40 animate-pulse"></div>

        <div className="bg-[#111111]/90 backdrop-blur-[50px] border border-white/20 rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_100px_rgba(0,0,0,1)] space-y-10 relative overflow-hidden ring-1 ring-white/10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 border border-white/20 rounded-full shadow-inner">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse shadow-[0_0_8px_white]"></div>
              <span className="text-[10px] font-mono tracking-[0.4em] text-white uppercase font-bold">Secure Access Portal</span>
            </div>
            
            <div className="space-y-1 pt-2">
              <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                {isSignUp ? 'INIT' : 'CORE'}
              </h1>
              <p className="text-[11px] font-mono tracking-[0.4em] text-gray-300 uppercase font-medium">
                {isSignUp ? 'Establish Identity' : 'Authorized Personnel Only'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2 group/input">
              <label className="block text-[10px] font-mono text-gray-200 uppercase tracking-[0.3em] ml-2 transition-colors group-focus-within/input:text-white font-bold">Serial.ID</label>
              <input
                className="w-full bg-black border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 focus:bg-[#050505] transition-all font-mono text-sm ring-1 ring-white/10 shadow-inner"
                placeholder="ENTER_ID"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-[10px] font-mono text-gray-200 uppercase tracking-[0.3em] ml-2 transition-colors group-focus-within/input:text-white font-bold">Access.Key</label>
              <input
                className="w-full bg-black border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 focus:bg-[#050505] transition-all font-mono text-sm ring-1 ring-white/10 shadow-inner"
                type="password"
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2 group/input">
                  <label className="block text-[10px] font-mono text-gray-200 uppercase tracking-[0.3em] ml-2">Confirm.Key</label>
                  <input
                    className="w-full bg-black border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-all font-mono text-sm ring-1 ring-white/10 shadow-inner"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2 group/input">
                  <label className="block text-[10px] font-mono text-gray-200 uppercase tracking-[0.3em] ml-2">Alias.Handle</label>
                  <input
                    className="w-full bg-black border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/50 transition-all font-mono text-sm ring-1 ring-white/10 shadow-inner"
                    placeholder="NICKNAME"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              className="w-full relative group mt-8 h-16 overflow-hidden rounded-2xl bg-white text-black font-black text-[11px] tracking-[0.5em] transition-all hover:bg-white/90 active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              disabled={loading}
              onClick={() => (isSignUp ? onSignUp() : onSignIn())}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              {loading ? (
                <span className="flex items-center justify-center font-mono font-bold">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  VALIDATING...
                </span>
              ) : (
                <span className="relative z-10 uppercase">{isSignUp ? 'Initialize_ID' : 'Authorize_Link'}</span>
              )}
            </button>
          </div>

          <div className="pt-8 text-center border-t border-white/10">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="group text-[11px] font-mono text-gray-300 uppercase tracking-[0.4em] hover:text-white transition-all font-bold"
            >
              {isSignUp ? '[ REGISTERED_ENTITY? ]' : '[ ACCESS_DENIED?_SIGN_UP ]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import useRequest from '@/hooks/useRequest'
import SerialNumberInput from './SerialNumberInput'

export default function RedemptionCodePage() {
  const request = useRequest()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  const generateCode = async () => {
    try {
      setLoading(true)
      const { code } = await request({
        url: '/redemption-code/generate',
        method: 'POST'
      })
      setCode(code.match(/.{1,4}/g).join('-'))
    } finally {
      setLoading(false)
    }
  }

  const onRedeemCode = async () => {
    try {
      setLoading(true)
      await request({
        url: '/redemption-code/redeem',
        method: 'POST',
        data: {
          code: redeemCode
        }
      })
      alert('REDEEM_SUCCESS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full py-12 px-4 relative overflow-hidden flex flex-col items-center">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Cyberpunk Title */}
      <div className="relative inline-block mb-16 self-start xl:self-center">
        <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase relative group">
          <span className="relative z-10">REDEMPTION</span>
          <span className="absolute -inset-1 bg-red-600/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <div className="text-[10px] font-mono tracking-[0.6em] text-[#00ffcc] mt-2 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-[#00ffcc] animate-pulse rounded-full"></span>
            NEURAL_LINK_RECOVERY_UNIT_V3.0
          </div>
        </h1>
        <div className="absolute -left-10 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[#00ffcc] to-transparent shadow-[0_0_15px_#00ffcc]"></div>
      </div>

      <div className="flex flex-col gap-12 w-full max-w-4xl">
        {/* Generate Card */}
        <div className="group relative w-full">
          <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[2.5rem] blur-sm"></div>
          <div className="relative bg-[#050505]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tight">GENERATE_PROTO</h2>
                <p className="text-[9px] font-mono text-gray-500 tracking-[0.3em] uppercase mt-1">Status: Encrypted_Session</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#ff0055] font-mono text-[10px] animate-pulse">
                SYS
              </div>
            </div>

            <div className="relative h-24 bg-black/80 border-2 border-white/5 rounded-full flex items-center justify-center overflow-hidden group/code">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.02)_50%,transparent)] bg-[size:200%_200%] animate-shimmer-fast"></div>
              {code ? (
                <>
                  <div className="text-4xl font-mono font-black text-white tracking-[0.2em] [text-shadow:0_0_15px_rgba(255,255,255,0.3)] animate-in fade-in zoom-in duration-500 select-text cursor-text">
                    {code}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-6 p-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/code:opacity-100 backdrop-blur-sm"
                  >
                    {copied ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-xs font-mono text-gray-700 uppercase tracking-[1.5em] animate-pulse">Awaiting_Gen</div>
              )}
            </div>

            <button
              disabled={loading}
              onClick={generateCode}
              className="w-full relative group/btn h-16 overflow-hidden rounded-full border-2 border-[#ff0055] bg-[#ff0055]/5 text-[#ff0055] font-black text-xs tracking-[0.6em] transition-all hover:bg-[#ff0055] hover:text-white hover:shadow-[0_0_50px_rgba(255,0,85,0.6)]"
            >
              <div className="absolute inset-x-0 h-full w-full bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
              {loading ? 'PROCESSING...' : 'INIT_GEN_PROTOCOL'}
            </button>
          </div>
        </div>

        {/* Redeem Card */}
        <div className="group relative w-full">
           <div className="absolute -inset-[1px] bg-gradient-to-br from-[#00ffcc]/10 via-transparent to-transparent rounded-[2.5rem] blur-sm"></div>
           <div className="relative bg-[#050505]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tight text-[#00ffcc] [text-shadow:0_0_10px_rgba(0,255,204,0.3)]">REDEEM_LINK</h2>
                <p className="text-[9px] font-mono text-gray-500 tracking-[0.3em] uppercase mt-1">Ready_For_Injection</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00ffcc] shadow-[0_0_10px_#00ffcc] animate-pulse"></div>
            </div>

            <div className="flex justify-center">
              <SerialNumberInput setValue={setRedeemCode} />
            </div>

            <button
              disabled={loading || !redeemCode}
              onClick={onRedeemCode}
              className={`w-full h-20 relative overflow-hidden rounded-full border-2 font-black text-xs tracking-[0.6em] transition-all flex items-center justify-center ${
                !redeemCode 
                ? 'border-white/5 text-white/5 cursor-not-allowed' 
                : 'border-[#00ffcc] bg-[#00ffcc]/5 text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black hover:shadow-[0_0_60px_rgba(0,255,204,0.7)]'
              }`}
            >
               {loading ? (
                 <span className="flex items-center gap-3">
                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   VALIDATING...
                 </span>
               ) : 'EXECUTE_RECOVERY'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer-fast {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

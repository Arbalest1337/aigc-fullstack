'use client'
import GoAuthUrl from './GoAuthUrl'
import Account from './Account'
import ExchangeCode from './ExchangeCode'
import Publish from './Publish'

export default function OAuth({ platform }) {
  return (
    <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-white/30">
      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Cool Cyberpunk Title Area */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative">
          <div className="relative">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic relative inline-block group-hover:animate-glitch">
              {platform}
              <span className="absolute top-0 left-0 -translate-x-[2px] text-red-500/50 mix-blend-screen opacity-0 group-hover:opacity-100 group-hover:animate-glitch-1 pointer-events-none">{platform}</span>
              <span className="absolute top-0 left-0 translate-x-[2px] text-blue-500/50 mix-blend-screen opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2 pointer-events-none">{platform}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
              <p className="text-[8px] font-mono tracking-[0.4em] text-red-500/70 uppercase font-bold">Signal_Distorted</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-600 uppercase">Buffer_Status</div>
            <div className="text-[12px] font-mono text-white/80">[ CRITICAL ]</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">
                <span>Auth_Protocol</span>
                <span className="group-hover:text-red-500 transition-colors">ERR_0X44</span>
              </div>
              <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
                <GoAuthUrl platform={platform} />
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-1 flex items-center gap-2">
                <span className="w-1 h-3 bg-white/20"></span> DATA_STREAM
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl font-mono text-xs relative overflow-hidden">
                {/* Horizontal scanline */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 animate-scanline pointer-events-none"></div>
                <Account platform={platform} />
              </div>
            </section>
          </div>

          <section className="space-y-3">
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">Command_Injection</div>
            <div className="p-6 bg-black/60 border border-white/10 rounded-[2rem] relative">
              <div className="absolute -top-1 right-4 px-2 bg-[#0a0a0a] text-[8px] font-mono text-gray-500">ROOT@CORE_LINK:</div>
              <Publish platform={platform} />
            </div>
          </section>
        </div>
      </div>

      <ExchangeCode platform={platform} />
      
      <style jsx global>{`
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(3px, -3px); }
          40% { transform: translate(3px, 3px); }
          60% { transform: translate(-3px, -3px); }
          80% { transform: translate(-3px, 3px); }
          100% { transform: translate(0); }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-glitch-1 {
          animation: glitch-1 0.2s infinite;
        }
        .animate-glitch-2 {
          animation: glitch-2 0.2s reversed infinite;
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>
    </div>
  )
}

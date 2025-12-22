'use client'

import Menu from '@/components/Menu/Menu'
import { usePathname } from 'next/navigation'

export default function HomeLayout({ children }) {
  const pathname = usePathname()
  
  // Pages that don't use the main layout with menu
  const isAuthPage = pathname === '/sign-in'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden relative">
      {/* Background elements to match sign-in page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(-45deg,#050505,#151515,#333333,#151515,#050505)] bg-[size:300%_300%] opacity-40 animate-[gradient-move_10s_ease_infinite]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/[0.05] blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Sidebar Menu */}
      <div className="relative z-10 shrink-0 h-full">
        <Menu />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 shrink-0 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-8">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-mono tracking-[0.4em] text-gray-400 uppercase font-bold">System.Status</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
              <span className="text-[11px] font-mono text-white uppercase tracking-wider">Operational / Linked</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Terminal.ID</span>
              <span className="text-xs font-mono text-white font-bold">ARBALEST_NODE_01</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Custom scrollbar for main content */
        main::-webkit-scrollbar {
          width: 6px;
        }
        main::-webkit-scrollbar-track {
          background: transparent;
        }
        main::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

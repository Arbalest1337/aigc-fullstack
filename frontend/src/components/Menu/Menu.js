'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Menu() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { name: 'HOME', path: '/home', icon: '🏠' },
    { name: 'SONG', path: '/song', icon: '🎵' },
    { name: 'IMAGE', path: '/image', icon: '🖼️' },
    { name: 'VIDEO', path: '/video', icon: '🎬' },
    { name: 'POST', path: '/post', icon: '📝' },
    { name: 'SCHEDULE', path: '/post-schedule', icon: '📅' },
    { name: 'STRIPE', path: '/stripe', icon: '💳' },
    { name: 'REDEMPTION', path: '/redemption-code', icon: '🎫' },
    { name: 'RATE LIMIT', path: '/rate-limit', icon: '⏳' },
    { name: 'RAG', path: '/rag', icon: '🧠' },
    { name: 'OAUTH', path: '/oauth', icon: '🔐' },
  ]

  return (
    <div 
      className={`relative flex flex-col h-full bg-[#111111]/90 backdrop-blur-[50px] border-r border-white/10 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Menu Header / Logo Area */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white">ARBALEST</span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-gray-400">DASHBOARD</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden ${isCollapsed ? 'justify-center' : ''} ${
                isActive 
                ? 'bg-white/10 text-white font-bold ring-1 ring-white/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
              )}
              <span className="text-xl shrink-0 relative z-10">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-xs font-mono tracking-widest truncate uppercase relative z-10">
                  {item.name}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] relative z-10"></div>
              )}
            </Link>
          )
        })}
      </div>

      {!isCollapsed && (
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-white truncate font-bold uppercase">USER.ENTITY</span>
              <span className="text-[8px] font-mono text-gray-500 truncate uppercase">ID:7749-X</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

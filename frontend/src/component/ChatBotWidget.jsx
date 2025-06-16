import React, { useState } from 'react'
import { Button } from '../../components/ui/button'
import { X, Bot } from 'lucide-react'
import FinBot from './FinBot'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card"

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-[90vw] md:w-[900px] h-[80vh] md:h-[500px] bg-white dark:bg-zinc-900 border rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center px-4 py-2 border-b dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
            <h2 className="font-semibold text-sm">🤖 FinChat Assistant</h2>
            <button onClick={() => setIsOpen(false)} className="text-zinc-600 dark:text-zinc-300">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FinBot embedded />
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50">
  <HoverCard openDelay={100}>
    <HoverCardTrigger>
      <div className="cursor-pointer animate-bounce-slow">
        <Bot
          className="text-white size-10 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full shadow-lg hover:scale-110 transition"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
    </HoverCardTrigger>

    <HoverCardContent className="bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md shadow-xl text-sm px-3 py-2">
      <p className="font-medium text-blue-600 dark:text-blue-300">Ask AI</p>
      <p className="text-zinc-600 dark:text-zinc-400">Your finance assistant</p>
    </HoverCardContent>
  </HoverCard>
</div>
      

    
    </div>
  )
}

export default ChatBotWidget

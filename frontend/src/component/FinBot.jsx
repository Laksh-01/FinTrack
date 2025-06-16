import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

const FinBot = () => {
  const { accountId } = useParams()
  const { user } = useUser()
  const clerkUserId = user?.id

  const [messages, setMessages] = useState(() => {
  const stored = localStorage.getItem(`chat_history_${clerkUserId}_${accountId}`);
  if (stored) return JSON.parse(stored);

  // Default fallback
  return [
    {
      type: 'bot',
      text: 'Hi! I’m your investment assistant. You can ask me anything related to finance or click the button below to analyze your investments.',
    },
  ];
});

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef(null)

 

  const sendMessage = async (text, isInvestmentAnalysis = false) => {
    setLoading(true)
    setMessages(prev => [...prev, { type: 'user', text }])


      // Load messages on mount
        


    try {
      const res = await fetch(`http://localhost:3000/api/investments/${isInvestmentAnalysis ? 'askAi' : 'chat'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId,
          accountId,
          question: isInvestmentAnalysis ? null : text,
          history: messages.slice(-20),
        }),
      })

      const data = await res.json()
      const reply = data.suggestions || data.reply || 'Sorry, I couldn’t process that.'
      const parsed = isInvestmentAnalysis ? reply.split(/\d\.\s+/).filter(Boolean) : reply

      setMessages(prev => [...prev, { type: 'bot', text: parsed }])
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: '⚠️ Error reaching AI backend.' }])
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!clerkUserId || !accountId) return;
    const key = `chat_history_${clerkUserId}_${accountId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
        setMessages(JSON.parse(stored));
    }
    }, [clerkUserId, accountId]);
    
        useEffect(() => {
        if (!clerkUserId || !accountId) return;
        const key = `chat_history_${clerkUserId}_${accountId}`;
        localStorage.setItem(key, JSON.stringify(messages));
        }, [messages, clerkUserId, accountId]);


  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  const handleInvestmentAnalysis = () => {
    sendMessage('Analyze my investments', true)
  }



 useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])


  return (
    <div className="flex flex-col h-[100%] p-2 md:p-4 bg-white dark:bg-zinc-900">
      <h2 className="text-xl font-semibold mb-2">
        🤖 FinBot – Your Investment Chat Assistant
      </h2>

      {/* Chat Window */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            {Array.isArray(msg.text) ? (
              <div className="grid gap-4">
                {msg.text.map((point, i) => (
                  <div
                    key={i}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-4 rounded-lg shadow"
                  >
                    <h3 className="font-semibold mb-1">
                      {['Summary Insight', 'Alternative Strategy', 'Expected Benefit', 'Relevant Market Data'][i] ||
                        `Insight ${i + 1}`}
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">{point.trim()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-3 rounded-lg text-sm whitespace-pre-wrap max-w-[90%] ${
                  msg.type === 'bot'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 self-start'
                    : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 self-end text-right ml-auto'
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input & Buttons */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask something like 'Should I invest in gold?'"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading}>
            📤
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleInvestmentAnalysis}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            📊 Analyze Investments
          </Button>

          <Button
            onClick={() => {
              localStorage.removeItem('chat_history')
              setMessages([])
            }}
            className="w-full"
          >
            🧹 Clear
          </Button>

          
        </div>
      </div>
    </div>
  )
}

export default FinBot

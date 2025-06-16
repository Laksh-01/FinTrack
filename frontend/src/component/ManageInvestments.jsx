// import React, { useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { Input } from '../../components/ui/input'
// import { Button } from '../../components/ui/button'
// import { Textarea } from '../../components/ui/textarea'
// import { useUser } from '@clerk/clerk-react'

// const InvestmentChat = () => {
//   const { accountId } = useParams()
//   const { user } = useUser()
//   const clerkUserId = user?.id

//   const [messages, setMessages] = useState([
//     {
//       type: 'bot',
//       text:
//         'Hi! I’ll review your investments and suggest better strategies based on current market trends. Click below to analyze.',
//     },
//   ])
//   const [loading, setLoading] = useState(false)

//   const handleAskAI = async () => {
//     setLoading(true)
//     setMessages(prev => [...prev, { type: 'user', text: 'Analyze my investments' }])

//     try {
//       const res = await fetch(`http://localhost:3000/api/investments/askAi`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           clerkUserId,
//           accountId,
//         }),
//       })

//       const data = await res.json()

//       if (data.suggestions) {
//         setMessages(prev => [...prev, { type: 'bot', text: data.suggestions }])
//       } else {
//         setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, something went wrong.' }])
//       }
//     } catch (err) {
//       setMessages(prev => [...prev, { type: 'bot', text: 'Error connecting to the AI backend.' }])
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="max-w-2xl mx-auto border rounded-xl p-4 shadow-xl mt-6 bg-white dark:bg-zinc-900 space-y-4">
//       <h2 className="text-xl font-semibold">📊 Investment Strategy Assistant</h2>

//       <div className="space-y-2 max-h-[400px] overflow-y-auto bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
//               msg.type === 'bot'
//                 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 self-start'
//                 : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 self-end text-right'
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       <Button onClick={handleAskAI} disabled={loading} className="w-full">
//         {loading ? 'Analyzing...' : '🔍 Analyze My Investments'}
//       </Button>
//     </div>
//   )
// }

// export default InvestmentChat


import React from 'react'
import CurrentlyUnderProgress from './CurrentlyUnderProgress'

const ManageInvestments = () => {
  return (
   <CurrentlyUnderProgress></CurrentlyUnderProgress>
  )
}

export default ManageInvestments
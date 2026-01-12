'use client'

import { useState, useRef, useEffect } from 'react'

// Input Component
function Input({ onQuestionSubmit }) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (question.trim()) {
      console.log('Submitting question:', question)
      onQuestionSubmit(question)
      setQuestion('')
    } else {
      console.log('Question is empty')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything about my experience or resume..."
          className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          onClick={(e) => {
            console.log('Button clicked, question:', question)
            // Let form handle submit
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ask
        </button>
      </div>
    </form>
  )
}

// Chat Window Component
function Window({ onClose, initialQuestion = '', onHighlights }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const hasInitialized = useRef(false)
  const previousInitialQuestion = useRef('')

  // Reset when initialQuestion changes (new chat session)
  useEffect(() => {
    if (previousInitialQuestion.current !== initialQuestion) {
      console.log('Resetting chat window - new initialQuestion:', initialQuestion)
      previousInitialQuestion.current = initialQuestion
      hasInitialized.current = false
      setMessages([])
    }
  }, [initialQuestion])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (message) => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      // Log the full response for debugging
      console.log('API Response:', JSON.stringify(data, null, 2))
      
      // Check for API errors
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Handle new response format with answer and highlights
      const assistantMessage = {
        role: 'assistant',
        content: data.answer || data.message || 'Sorry, I encountered an error.',
        highlights: data.highlights || []
      }
      
      console.log('Highlights received:', assistantMessage.highlights)

      setMessages((prev) => [...prev, assistantMessage])
      
      // Trigger highlight functionality if highlights are provided
      if (data.highlights && data.highlights.length > 0 && onHighlights) {
        console.log('Highlighting elements:', data.highlights)
        // Small delay to ensure message is rendered
        setTimeout(() => {
          onHighlights(data.highlights)
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Send initial question when chat opens
  useEffect(() => {
    console.log('Window useEffect - initialQuestion:', initialQuestion, 'hasInitialized:', hasInitialized.current)
    if (initialQuestion && !hasInitialized.current) {
      console.log('Sending initial question:', initialQuestion)
      hasInitialized.current = true
      sendMessage(initialQuestion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  console.log('Rendering Window component, initialQuestion:', initialQuestion, 'messages:', messages.length)
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl flex flex-col h-screen animate-slide-in border-l border-gray-200 z-50" style={{ display: 'flex' }}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation by asking a question!</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

// Export both components
const AIChat = {
  Input,
  Window,
}

export default AIChat


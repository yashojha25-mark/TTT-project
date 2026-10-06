import { useState } from 'react'
import './App.css'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'

const API_BASE = 'http://localhost:5000'

function App() {

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function clearChat() {
    if (loading) return
    setMessages([])
    setError('')
  }

  async function sendMessage() {
 
    if (loading) return
    if (message.trim() === '') return

    const text = message.trim()
    setMessage('')
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
      
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('The server returned an unreadable response.')
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to generate AI response')
      }

      const aiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
     
      console.error('[chat] request failed:', err)

      const isNetworkFailure =
        err instanceof TypeError || /failed to fetch|networkerror/i.test(err.message)

      setError(
        isNetworkFailure
          ? 'Could not reach the server. Is the backend running on port 5000?'
          : err.message
      )
    } finally {
     
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-identity">
        
          <div className="brand-badge" aria-hidden="true">
            ⚡
          </div>
          <div>
            <h1>
              Omega AI
              <span className="brand-tag" aria-hidden="true">
                beta
              </span>
            </h1>
            <p className="subtitle">Your intelligent assistant, powered by AI</p>
          </div>
        </div>

        <div className="header-actions">
          <span className="status-pill">
            <span className="status-dot" aria-hidden="true" />
            Online
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={clearChat}
            disabled={messages.length === 0 || loading}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </header>

      <ChatWindow
        messages={messages}
        loading={loading}
        onSuggestion={(text) => {
          setMessage(text)
        }}
      />

      {error && (
        <div className="error-banner" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

  
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSend={sendMessage}
        loading={loading}
      />
    </div>
  )
}

export default App

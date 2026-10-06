
import { useEffect, useRef } from 'react';
import Message from './Message';

function ThinkingBubble() {
  return (
    <div className="message-row assistant">
      <div className="avatar" aria-hidden="true">
        ⚡
      </div>

      <div className="bubble-group">
        <div className="meta">
          <span className="sender">Omega AI</span>
        </div>

        <div className="bubble thinking" role="status" aria-live="polite">
          <span className="sr-only">Omega AI is thinking</span>
          <span className="dots" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="thinking-label" aria-hidden="true">
            Thinking…
          </span>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { icon: '🧠', text: 'Explain JavaScript closures with an example' },
  { icon: '🐛', text: 'Why is my Express req.body undefined?' },
  { icon: '🗄️', text: 'Write a SQL query to find duplicate rows' },
  {
    icon: '⚡',
    text: 'What are the differences between let, const and var?',
  },
];

function ChatWindow({ messages, loading, onSuggestion }) {

  const isEmpty = messages.length === 0 && !loading;

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  return (
    <main className="chat-window">
      {isEmpty && (
        <div className="empty-state">
          <div className="empty-orb" aria-hidden="true">
            ⚡
          </div>

          <h2>Ask Omega AI anything</h2>
          <p>
            Ask a question, paste an error, or request a code example —
            Omega AI replies in seconds.
          </p>

          <p className="suggestions-label">Try one of these</p>
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
          
              <button
                type="button"
                className="suggestion-chip"
                key={s.text}
                onClick={() => onSuggestion?.(s.text)}
              >
                <span className="suggestion-icon" aria-hidden="true">
                  {s.icon}
                </span>
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <Message
          key={msg.id}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}

      {loading && <ThinkingBubble />}
      <div ref={endRef} />
    </main>
  );
}

export default ChatWindow;
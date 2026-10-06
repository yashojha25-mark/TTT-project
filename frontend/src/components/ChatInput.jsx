
function ChatInput({ message, setMessage, onSend, loading }) {

  function handleSubmit(e) {
    e.preventDefault()
    onSend()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const canSend = message.trim() !== '' && !loading

  return (
    <footer className="chat-footer">
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          className="chat-input"
          type="text"
          value={message}
      
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            loading ? 'Omega AI is thinking...' : 'Ask Omega AI anything...'
          }
          disabled={loading}
  
          maxLength={4000}
          autoFocus
        />

        <button className="send-button" type="submit" disabled={!canSend}>
         
          <span aria-hidden="true">{loading ? '⏳' : '➤'}</span>
          <span className="send-label">
            {loading ? 'Thinking…' : 'Send'}
          </span>
        </button>
      </form>

      <p className="input-hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd> + <kbd>Enter</kbd> for
        a new line
      </p>
    </footer>
  );
}

export default ChatInput;
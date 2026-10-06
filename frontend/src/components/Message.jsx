
function Message({ role, content, timestamp }) {

  const isUser = role === 'user';
  const rowClass = `message-row ${isUser ? 'user' : 'assistant'}`;

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={rowClass}>
      <div className="avatar" aria-hidden="true">
        {isUser ? '🧑' : '⚡'}
      </div>

      <div className="bubble-group">
        <div className="meta">
          <span className="sender">{isUser ? 'You' : 'Omega AI'}</span>
          {time && <span className="timestamp">{time}</span>}
        </div>

        <div className="bubble">
          {content}
        </div>
      </div>
    </div>
  );
}

export default Message;
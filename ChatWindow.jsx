import React from 'react';
import DocumentationBotMessage from './DocumentationBotMessage';

function ChatWindow({ messages, webhookUrl }) {
  return (
    <div>
      {messages.map((msg, idx) =>
        msg.isBot ? (
          <DocumentationBotMessage key={idx} answer={msg.text} webhookUrl={webhookUrl} />
        ) : (
          <div key={idx}>{msg.text}</div>
        )
      )}
    </div>
  );
}

export default ChatWindow;

import React, { useState } from 'react';
import DocumentationBotMessage from './DocumentationBotMessage';

const webhookUrl = 'DEINE_WEBHOOK_URL_HIER';

function App() {
  const [messages, setMessages] = useState([
    { text: 'Hallo, wie kann ich helfen?', isBot: true },
    { text: 'Ich brauche Hilfe mit React.', isBot: false },
    { text: 'Hier ist ein Beispiel für React.', isBot: true },
  ]);

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

export default App;

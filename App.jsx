import React, { useState } from 'react';
import DocumentationBotMessage from './DocumentationBotMessage';

const webhookUrl = 'DEINE_WEBHOOK_URL_HIER';

function App() {
  const [messages, setMessages] = useState([
    { text: 'Hallo, wie kann ich helfen?', isBot: true },
    { text: 'Ich brauche Hilfe mit React.', isBot: false },
    { text: 'Hier ist ein Beispiel für React.', isBot: true },
  ]);
  const [input, setInput] = useState('');

  // Beispiel: Nachricht absenden und Bot-Antwort hinzufügen
  const handleSend = () => {
    if (input.trim() === '') return;
    // Nur eigene Nachricht hinzufügen
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput('');
    // Simuliere Bot-Antwort nach kurzer Zeit
    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Bot-Antwort zu: ' + input, isBot: true }]);
    }, 1000);
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} style={{fontSize:'1.2rem'}} />
      <button onClick={handleSend} style={{background:'green',color:'white',fontSize:'1.2rem'}}>Senden</button>
      {messages.map((msg, idx) =>
        msg.isBot ? (
          <DocumentationBotMessage key={idx} answer={msg.text} webhookUrl={webhookUrl} />
        ) : (
          <div key={idx} style={{background:'#448aff',color:'white',padding:'15px',margin:'10px 0',borderRadius:'15px',fontSize:'1.1rem'}}>{msg.text}</div>
        )
      )}
    </div>
  );
}

export default App;

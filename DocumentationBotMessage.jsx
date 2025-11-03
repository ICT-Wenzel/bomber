import React from 'react';

function DocumentationBotMessage({ answer, webhookUrl }) {
  const handleAddToDocumentation = async () => {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bottype: 'add_to_doku',
        content: answer,
      }),
    });
    alert('Antwort zur Dokumentation hinzugefügt!');
  };

  return (
    <div style={{ marginBottom: '30px', padding: '20px', background: '#222', borderRadius: '12px', color: 'white', position: 'relative' }}>
      <div style={{ marginBottom: '20px' }}>{answer}</div>
      <button
        onClick={handleAddToDocumentation}
        style={{
          backgroundColor: 'red',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '2rem',
          border: 'none',
          borderRadius: '10px',
          padding: '10px 30px',
          cursor: 'pointer',
          display: 'block',
          margin: '0 auto',
        }}
      >
        ADD
      </button>
    </div>
  );
}

export default DocumentationBotMessage;

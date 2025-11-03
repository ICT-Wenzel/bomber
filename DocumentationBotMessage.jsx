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
    <div>
      <div>{answer}</div>
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
          marginTop: '20px',
          cursor: 'pointer',
        }}
      >
        ADD
      </button>
    </div>
  );
}

export default DocumentationBotMessage;

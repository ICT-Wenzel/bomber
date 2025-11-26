import React from 'react';

function DocumentationBotMessage({ answer = 'Test-Antwort', webhookUrl }) {
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
    <div style={{ border: '2px solid red', padding: '20px', margin: '20px 0', background: '#fff', color: '#000' }}>
      <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>{answer}</div>
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
      <button style={{background:'blue',color:'white',fontSize:'1.5rem',marginTop:'10px'}}>Test-Button im Antwortfeld</button>
    </div>
  );
}

export default DocumentationBotMessage;

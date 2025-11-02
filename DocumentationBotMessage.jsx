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
      <button onClick={handleAddToDocumentation}>Add to Documentation</button>
    </div>
  );
}

export default DocumentationBotMessage;

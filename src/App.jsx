import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FileText, Book, Send, Trash2, Download, Moon, Sun, Settings, Loader2 } from 'lucide-react';

// ENV Configuration - Hardcoded n8n Webhook
const ENV_CONFIG = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
  N8N_API_KEY: ''
};

// Runtime Check
if (!ENV_CONFIG.N8N_WEBHOOK_URL) {
  console.error('❌ N8N Webhook URL nicht konfiguriert!');
}

const AI_COCKPIT_CONFIG = {
  bots: {
    documentation: {
      id: 'documentation',
      name: 'Dokumentations-Bot',
      icon: FileText,
      color: 'blue',
      botType: 'documentation',
      description: 'Erstellt und analysiert Dokumentationen'
    },
    wiki: {
      id: 'wiki',
      name: 'Internal-Wiki-Bot',
      icon: Book,
      color: 'green',
      botType: 'wiki',
      description: 'Greift auf internes Wissen zu'
    },
    basic: {
      id: 'basic',
      name: 'Basic-AI-Bot',
      icon: MessageSquare,
      color: 'gray',
      botType: 'basic',
      description: 'Allgemeine KI-Aufgaben'
    }
  }
};

const AICockpit = () => {
  const [activeBot, setActiveBot] = useState('documentation');
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    webhookUrl: ENV_CONFIG.N8N_WEBHOOK_URL,
    apiKey: ENV_CONFIG.N8N_API_KEY
  });
  const messagesEndRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiCockpitMessages');
    if (saved) setMessages(JSON.parse(saved));
    
    const savedConfig = localStorage.getItem('aiCockpitConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setApiConfig({
        webhookUrl: parsed.webhookUrl || ENV_CONFIG.N8N_WEBHOOK_URL,
        apiKey: parsed.apiKey || ENV_CONFIG.N8N_API_KEY
      });
    }
    
    const savedTheme = localStorage.getItem('aiCockpitTheme');
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aiCockpitMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('aiCockpitConfig', JSON.stringify(apiConfig));
  }, [apiConfig]);

  useEffect(() => {
    localStorage.setItem('aiCockpitTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeBot]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const currentMessages = messages[activeBot] || [];
    setMessages(prev => ({
      ...prev,
      [activeBot]: [...currentMessages, userMessage]
    }));
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      const bot = AI_COCKPIT_CONFIG.bots[activeBot];
      
      // Payload für n8n Webhook
      const payload = {
        botType: bot.botType,
        message: messageToSend,
        context: currentMessages.slice(-5).map(m => ({
          role: m.role,
          content: m.content
        })),
        timestamp: new Date().toISOString()
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      // API Key nur hinzufügen wenn vorhanden
      if (apiConfig.apiKey && apiConfig.apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      }

      const response = await fetch(apiConfig.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      const botMessage = {
        role: 'assistant',
        content: data.response || data.message || data.output || 'Keine Antwort erhalten',
        metadata: data.metadata,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => ({
        ...prev,
        [activeBot]: [...(prev[activeBot] || []), userMessage, botMessage]
      }));
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Fehler: ${error.message}. Bitte überprüfe die Webhook-URL und API-Konfiguration.`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => ({
        ...prev,
        [activeBot]: [...(prev[activeBot] || []), userMessage, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Möchtest du den Verlauf wirklich löschen?')) {
      setMessages(prev => ({ ...prev, [activeBot]: [] }));
    }
  };

  const exportHistory = () => {
    const data = messages[activeBot] || [];
    const exportData = {
      bot: activeBot,
      botName: AI_COCKPIT_CONFIG.bots[activeBot].name,
      exportDate: new Date().toISOString(),
      messages: data
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeBot}-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const resetConfig = () => {
    if (confirm('Möchtest du die Konfiguration auf die Standard-Werte zurücksetzen?')) {
      setApiConfig({
        webhookUrl: ENV_CONFIG.N8N_WEBHOOK_URL,
        apiKey: ENV_CONFIG.N8N_API_KEY
      });
    }
  };

  const currentMessages = messages[activeBot] || [];
  const currentBot = AI_COCKPIT_CONFIG.bots[activeBot];
  const BotIcon = currentBot.icon;

  const colorClasses = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', hover: 'hover:bg-blue-600' },
    green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500', hover: 'hover:bg-green-600' },
    gray: { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500', hover: 'hover:bg-gray-600' }
  };

  const colors = colorClasses[currentBot.color];

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center py-6 gap-4`}>
        <div className="text-2xl font-bold mb-4">🤖</div>
        
        {Object.values(AI_COCKPIT_CONFIG.bots).map(bot => {
          const Icon = bot.icon;
          const isActive = activeBot === bot.id;
          const botColors = colorClasses[bot.color];
          
          return (
            <button
              key={bot.id}
              onClick={() => setActiveBot(bot.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isActive 
                  ? `${botColors.bg} text-white shadow-lg scale-110` 
                  : `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} hover:scale-105`
              }`}
              title={bot.name}
            >
              <Icon size={24} />
            </button>
          );
        })}

        <div className="flex-1" />
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          title="Einstellungen"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`h-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between px-6`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center text-white`}>
              <BotIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{currentBot.name}</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentBot.description}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportHistory}
              disabled={currentMessages.length === 0}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Verlauf exportieren"
            >
              <Download size={20} />
            </button>
            <button
              onClick={clearHistory}
              disabled={currentMessages.length === 0}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              title="Verlauf löschen"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 ${colors.bg} rounded-2xl flex items-center justify-center text-white mb-4`}>
                <BotIcon size={40} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">{currentBot.name}</h2>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {currentBot.description}
              </p>
              <p className={`mt-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Starte eine Konversation...
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {currentMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 ${msg.isError ? 'bg-red-500' : colors.bg} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                      <BotIcon size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? `${colors.bg} text-white`
                        : msg.isError
                        ? 'bg-red-500/10 border border-red-500/20'
                        : darkMode
                        ? 'bg-gray-800'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                      {msg.content}
                    </div>
                    {msg.metadata && (
                      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {msg.metadata.source && `📚 Quelle: ${msg.metadata.source}`}
                        {msg.metadata.confidence && ` • Confidence: ${msg.metadata.confidence}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                    <BotIcon size={16} />
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Verarbeitung...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Nachricht an ${currentBot.name}...`}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-xl ${
                darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 ${colors.border} disabled:opacity-50 transition-all`}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`${colors.bg} ${colors.hover} text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[60px]`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">⚙️ Webhook-Konfiguration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">n8n Webhook URL</label>
                <input
                  type="text"
                  value={apiConfig.webhookUrl}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-n8n-instance.com/webhook/ai-cockpit"
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Alle Bots nutzen diesen Webhook
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key (Optional)</label>
                <input
                  type="password"
                  value={apiConfig.apiKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Dein API-Key"
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Wird als Bearer Token gesendet
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-xs font-medium mb-1">Payload Format:</p>
                <pre className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} overflow-x-auto`}>
{`{
  "botType": "documentation",
  "message": "User message",
  "context": [...],
  "timestamp": "ISO date"
}`}
                </pre>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={resetConfig}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICockpit;
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FileText, Book, Send, Trash2, Download, Moon, Sun, Settings, Loader2, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Supabase Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase Credentials nicht gefunden!');
  console.info('Bitte setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in deinen Vercel Environment Variables');
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ENV Configuration - Hardcoded n8n Webhook
const ENV_CONFIG = {
  N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
  N8N_API_KEY: ''
};

// Runtime Check
if (!ENV_CONFIG.N8N_WEBHOOK_URL) {
  console.error('❌ N8N Webhook URL nicht konfiguriert!');
}


// Auth Component
const AuthComponent = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? '🚀 Registrieren' : '🔐 Anmelden'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Lädt...' : (isSignUp ? 'Registrieren' : 'Anmelden')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isSignUp ? 'Bereits registriert? Anmelden' : 'Noch kein Account? Registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente mit Auth-Check
const AppWithAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check aktuelle Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent onAuthSuccess={setUser} />;
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

// Markdown Parser Component
const MarkdownRenderer = ({ content, darkMode }) => {
  const parseMarkdown = (text) => {
    const elements = [];
    const lines = text.split('\n');
    let i = 0;
    let codeBlock = null;
    let codeLanguage = '';
    let listItems = [];
    let listType = null;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          listType === 'ul' ? (
            <ul key={elements.length} className="list-disc list-inside my-2 space-y-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{parseInline(item)}</li>
              ))}
            </ul>
          ) : (
            <ol key={elements.length} className="list-decimal list-inside my-2 space-y-1">
              {listItems.map((item, idx) => (
                <li key={idx}>{parseInline(item)}</li>
              ))}
            </ol>
          )
        );
        listItems = [];
        listType = null;
      }
    };

    const parseInline = (text) => {
      const parts = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Bold **text**
        if (remaining.match(/^\*\*(.+?)\*\*/)) {
          const match = remaining.match(/^\*\*(.+?)\*\*/);
          parts.push(<strong key={key++}>{match[1]}</strong>);
          remaining = remaining.slice(match[0].length);
        }
        // Italic *text*
        else if (remaining.match(/^\*(.+?)\*/)) {
          const match = remaining.match(/^\*(.+?)\*/);
          parts.push(<em key={key++}>{match[1]}</em>);
          remaining = remaining.slice(match[0].length);
        }
        // Inline code `code`
        else if (remaining.match(/^`(.+?)`/)) {
          const match = remaining.match(/^`(.+?)`/);
          parts.push(
            <code key={key++} className={`px-1.5 py-0.5 rounded text-sm font-mono ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {match[1]}
            </code>
          );
          remaining = remaining.slice(match[0].length);
        }
        // Links [text](url)
        else if (remaining.match(/^\[(.+?)\]\((.+?)\)/)) {
          const match = remaining.match(/^\[(.+?)\]\((.+?)\)/);
          parts.push(
            <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {match[1]}
            </a>
          );
          remaining = remaining.slice(match[0].length);
        }
        // Regular text
        else {
          const nextSpecial = remaining.search(/[\*`\[]/);
          const chunk = nextSpecial === -1 ? remaining : remaining.slice(0, nextSpecial);
          if (chunk) parts.push(<span key={key++}>{chunk}</span>);
          remaining = remaining.slice(chunk.length);
        }
      }

      return parts.length > 0 ? parts : text;
    };

    while (i < lines.length) {
      const line = lines[i];

      // Code block start
      if (line.match(/^```(\w*)/)) {
        flushList();
        codeLanguage = line.match(/^```(\w*)/)[1] || '';
        codeBlock = [];
        i++;
        continue;
      }

      // Code block end
      if (codeBlock && line.match(/^```$/)) {
        elements.push(
          <div key={elements.length} className={`my-3 rounded-lg overflow-hidden ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
            {codeLanguage && (
              <div className={`px-3 py-1 text-xs font-semibold ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                {codeLanguage}
              </div>
            )}
            <pre className={`p-3 overflow-x-auto text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              <code className="font-mono">{codeBlock.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlock = null;
        codeLanguage = '';
        i++;
        continue;
      }

      // Inside code block
      if (codeBlock) {
        codeBlock.push(line);
        i++;
        continue;
      }

      // Headers
      if (line.match(/^(#{1,6})\s+(.+)/)) {
        flushList();
        const match = line.match(/^(#{1,6})\s+(.+)/);
        const level = match[1].length;
        const text = match[2];
        const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm'];
        elements.push(
          <div key={elements.length} className={`${sizes[level - 1]} font-bold my-2`}>
            {parseInline(text)}
          </div>
        );
        i++;
        continue;
      }

      // Unordered list
      if (line.match(/^[\*\-]\s+(.+)/)) {
        const match = line.match(/^[\*\-]\s+(.+)/);
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(match[1]);
        i++;
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\.\s+(.+)/)) {
        const match = line.match(/^\d+\.\s+(.+)/);
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(match[1]);
        i++;
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        flushList();
        elements.push(<hr key={elements.length} className={`my-3 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} />);
        i++;
        continue;
      }

      // Blockquote
      if (line.match(/^>\s+(.+)/)) {
        flushList();
        const match = line.match(/^>\s+(.+)/);
        elements.push(
          <blockquote key={elements.length} className={`border-l-4 pl-3 my-2 italic ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
            {parseInline(match[1])}
          </blockquote>
        );
        i++;
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        elements.push(<div key={elements.length} className="h-2" />);
        i++;
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={elements.length} className="my-1">
          {parseInline(line)}
        </p>
      );
      i++;
    }

    flushList();
    return elements;
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
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
  const [addToDokuStatus, setAddToDokuStatus] = useState({});
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
    const messagesToSend = [...currentMessages, userMessage];
    
    // Sofort User-Message anzeigen
    setMessages(prev => ({
      ...prev,
      [activeBot]: messagesToSend
    }));
    
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      const bot = AI_COCKPIT_CONFIG.bots[activeBot];
      
      // Payload für n8n Webhook - NUR die aktuelle Nachricht
      const payload = {
        botType: bot.botType,
        message: messageToSend,
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

      // Prüfe Content-Type um Text oder JSON zu parsen
      const contentType = response.headers.get('content-type');
      let botContent;
      let metadata = null;

      if (contentType && contentType.includes('application/json')) {
        // JSON Response von n8n
        const data = await response.json();
        
        // n8n sendet oft ein Array: [{ "output": "..." }]
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          botContent = firstItem.output || firstItem.response || firstItem.message || firstItem.text || JSON.stringify(firstItem);
          metadata = firstItem.metadata;
        } else {
          // Normales Objekt: { "response": "..." }
          botContent = data.response || data.message || data.output || data.text || JSON.stringify(data);
          metadata = data.metadata;
        }
      } else {
        // Plain Text Response von n8n
        botContent = await response.text();
      }
      
      const botMessage = {
        role: 'assistant',
        content: botContent,
        metadata: metadata,
        timestamp: new Date().toISOString()
      };

      // Bot-Message zur bereits gespeicherten Liste hinzufügen
      setMessages(prev => ({
        ...prev,
        [activeBot]: [...messagesToSend, botMessage]
      }));
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Fehler: ${error.message}. Bitte überprüfe die Webhook-URL und API-Konfiguration.`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      // Error-Message zur bereits gespeicherten Liste hinzufügen
      setMessages(prev => ({
        ...prev,
        [activeBot]: [...messagesToSend, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToDoku = async (message, messageId) => {
    if (!message?.content || addToDokuStatus[messageId] === 'loading') return;

    setAddToDokuStatus(prev => ({ ...prev, [messageId]: 'loading' }));

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (apiConfig.apiKey && apiConfig.apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      }

      const payload = {
        botType: 'add-to-doku',
        content: message.content,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(apiConfig.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Add to Doku Error: ${response.status} ${response.statusText}`);
      }

      setAddToDokuStatus(prev => ({ ...prev, [messageId]: 'success' }));
    } catch (error) {
      console.error('Add to Doku failed:', error);
      setAddToDokuStatus(prev => ({ ...prev, [messageId]: 'error' }));
    } finally {
      setTimeout(() => {
        setAddToDokuStatus(prev => {
          const updated = { ...prev };
          delete updated[messageId];
          return updated;
        });
      }, 3000);
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
                      {msg.role === 'assistant' ? (
                        <MarkdownRenderer content={msg.content} darkMode={darkMode} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.metadata && (
                      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {msg.metadata.source && `📚 Quelle: ${msg.metadata.source}`}
                        {msg.metadata.confidence && ` • Confidence: ${msg.metadata.confidence}`}
                      </div>
                    )}
                    {activeBot === 'documentation' && msg.role === 'assistant' && !msg.isError && msg.content && (
                      <div className="mt-3 flex items-center gap-2">
                        {(() => {
                          const messageId = msg.timestamp || `${activeBot}-${idx}`;
                          const status = addToDokuStatus[messageId];
                          return (
                            <>
                              <button
                                onClick={() => handleAddToDoku(msg, messageId)}
                                disabled={status === 'loading'}
                                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                                  darkMode
                                    ? 'border-gray-600 hover:bg-gray-700 disabled:hover:bg-gray-800'
                                    : 'border-gray-300 hover:bg-gray-100'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                              >
                                {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                <span>Add to Doku</span>
                              </button>
                              {status === 'success' && (
                                <span className={`inline-flex items-center gap-1 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                  <Check size={14} />
                                  Gespeichert
                                </span>
                              )}
                              {status === 'error' && (
                                <span className={`inline-flex items-center gap-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                  <AlertCircle size={14} />
                                  Fehler beim Speichern
                                </span>
                              )}
                            </>
                          );
                        })()}
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
                <p className="text-xs font-medium mb-2">📤 Request Format:</p>
                <pre className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} overflow-x-auto`}>
{`{
  "botType": "documentation",
  "message": "User message",
  "timestamp": "ISO date"
}`}
                </pre>
                
                <p className="text-xs font-medium mb-2 mt-3">📥 Response Format:</p>
                <pre className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} overflow-x-auto`}>
{`n8n Array (Standard):
[{
  "output": "Bot Antwort",
  "metadata": {...}
}]

Oder JSON Objekt:
{
  "response": "Bot Antwort"
}

Oder Plain Text:
"Bot Antwort"`}
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
};

// Exportiere die Hauptkomponente als App
const App = AppWithAuth;
export default App;
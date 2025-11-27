import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, FileText, Book, Send, Trash2, Download, Moon, Sun, Loader2, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtiles Hintergrund-Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-500/30 blur-3xl rounded-full animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
      </div>

      <div className="relative bg-slate-900/70 border border-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isSignUp ? '🚀 Registrieren' : '🔐 Anmelden'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-Mail
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/30 to-cyan-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="relative w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 outline-none border border-slate-700/80 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/60 transition-all duration-200"
                placeholder="deine@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Passwort
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="relative w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 outline-none border border-slate-700/80 focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-500/60 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="text-red-400" size={16} />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:from-blue-500 hover:via-indigo-400 hover:to-cyan-300 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_45px_rgba(79,70,229,0.8)] active:scale-[0.98]"
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // Wenn eingeloggt, zeige das eigentliche Cockpit
  return <AICockpit />;
};
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
  const [addToDokuStatus, setAddToDokuStatus] = useState({});
  const messagesEndRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiCockpitMessages');
    if (saved) setMessages(JSON.parse(saved));
    
    const savedTheme = localStorage.getItem('aiCockpitTheme');
    if (savedTheme) setDarkMode(savedTheme === 'dark');
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aiCockpitMessages', JSON.stringify(messages));
  }, [messages]);

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

      // Aktuelle Supabase-Session holen, um JWT an n8n zu senden
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) {
        throw new Error('Keine gültige Supabase-Session gefunden. Bitte neu einloggen.');
      }

      const jwt = sessionData.session.access_token;

      const headers = {
        'Content-Type': 'application/json',
        // JWT der aktuellen Supabase-Session an n8n senden
        'Authorization': `Bearer ${jwt}`
      };

      // Optionalen eigenen API-Key zusätzlich senden (separater Header aus ENV)
      if (ENV_CONFIG.N8N_API_KEY && ENV_CONFIG.N8N_API_KEY.trim()) {
        headers['x-api-key'] = ENV_CONFIG.N8N_API_KEY.trim();
      }

      const response = await fetch(ENV_CONFIG.N8N_WEBHOOK_URL, {
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
      // Aktuelle Supabase-Session holen, um JWT an n8n zu senden
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) {
        throw new Error('Keine gültige Supabase-Session gefunden. Bitte neu einloggen.');
      }

      const jwt = sessionData.session.access_token;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      };

      if (ENV_CONFIG.N8N_API_KEY && ENV_CONFIG.N8N_API_KEY.trim()) {
        headers['x-api-key'] = ENV_CONFIG.N8N_API_KEY.trim();
      }

      const payload = {
        botType: 'add-to-doku',
        content: message.content,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(ENV_CONFIG.N8N_WEBHOOK_URL, {
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
    <div
      className={`h-screen flex relative overflow-hidden ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Hintergrund Gradients / Glows */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 left-0 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute top-40 -right-24 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-400/10 blur-3xl rounded-full" />
      </div>

      {/* Sidebar */}
      <div
        className={`relative z-10 w-20 ${
          darkMode ? 'bg-slate-900/70' : 'bg-white/70'
        } border-r border-white/5 backdrop-blur-2xl flex flex-col items-center py-6 gap-4 shadow-[0_0_35px_rgba(15,23,42,0.8)]`}
      >
        <div className="text-2xl font-semibold mb-4 select-none bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow">
          🤖
        </div>
        
        {Object.values(AI_COCKPIT_CONFIG.bots).map(bot => {
          const Icon = bot.icon;
          const isActive = activeBot === bot.id;
          const botColors = colorClasses[bot.color];
          
          return (
            <button
              key={bot.id}
              onClick={() => setActiveBot(bot.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? `bg-gradient-to-br from-${bot.color}-400 via-${bot.color}-500 to-${bot.color}-600 text-white shadow-[0_12px_30px_rgba(59,130,246,0.7)] scale-110` 
                  : `${darkMode ? 'bg-slate-800/70 text-slate-400' : 'bg-slate-100 text-slate-600'} hover:scale-105 hover:-translate-y-0.5`
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
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg transition-all duration-200 ${
            darkMode
              ? 'bg-slate-800/80 hover:bg-slate-700'
              : 'bg-white/80 hover:bg-slate-100'
          }`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} className="text-slate-700" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`h-16 ${
            darkMode ? 'bg-slate-900/70' : 'bg-white/70'
          } border-b border-white/5 flex items-center justify-between px-6 backdrop-blur-2xl shadow-[0_10px_30px_rgba(15,23,42,0.7)]`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-${currentBot.color}-400 via-${currentBot.color}-500 to-${currentBot.color}-600 shadow-[0_10px_30px_rgba(37,99,235,0.7)]`}
            >
              <BotIcon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {currentBot.name}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentBot.description}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={exportHistory}
              disabled={currentMessages.length === 0}
              className={`p-2 rounded-xl border border-white/10 ${
                darkMode ? 'bg-slate-800/70 hover:bg-slate-700/80' : 'bg-white/80 hover:bg-slate-100'
              } disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md`}
              title="Verlauf exportieren"
            >
              <Download size={20} />
            </button>
            <button
              onClick={clearHistory}
              disabled={currentMessages.length === 0}
              className={`p-2 rounded-xl border border-white/10 ${
                darkMode ? 'bg-slate-800/70 hover:bg-slate-700/80' : 'bg-white/80 hover:bg-slate-100'
              } disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md`}
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
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white mb-4 bg-gradient-to-br from-${currentBot.color}-400 via-${currentBot.color}-500 to-${currentBot.color}-600 shadow-[0_18px_45px_rgba(59,130,246,0.9)] animate-[pulse_3s_ease-in-out_infinite]`}
              >
                <BotIcon size={40} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">{currentBot.name}</h2>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                {currentBot.description}
              </p>
              <p className={`mt-4 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
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
                    <div
                      className={`w-8 h-8 ${
                        msg.isError
                          ? 'bg-red-500'
                          : `${colors.bg}`
                      } rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}
                    >
                      <BotIcon size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-3xl px-4 py-3 border ${
                      msg.role === 'user'
                        ? `bg-gradient-to-br from-${currentBot.color}-500 via-${currentBot.color}-600 to-${currentBot.color}-500 text-white border-transparent shadow-[0_10px_30px_rgba(59,130,246,0.8)]`
                        : msg.isError
                        ? 'bg-red-500/10 border-red-500/30'
                        : darkMode
                        ? 'bg-slate-900/70 border-slate-700/70 shadow-[0_12px_35px_rgba(15,23,42,0.9)]'
                        : 'bg-white/90 border-slate-200 shadow-[0_10px_25px_rgba(148,163,184,0.5)]'
                    } transition-transform duration-150 hover:-translate-y-0.5`}
                  >
                    <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                      {msg.role === 'assistant' ? (
                        <MarkdownRenderer content={msg.content} darkMode={darkMode} />
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.metadata && (
                      <div className={`mt-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
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
                                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                                  darkMode
                                    ? 'border-slate-600/90 bg-slate-900/60 hover:bg-slate-800/80'
                                    : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100'
                                } disabled:opacity-60 disabled:cursor-not-allowed shadow-sm`}
                              >
                                {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                <span>Add to Doku</span>
                              </button>
                              {status === 'success' && (
                                <span className={`inline-flex items-center gap-1 text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
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
                  <div className={`w-8 h-8 ${colors.bg} rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                    <BotIcon size={16} />
                  </div>
                  <div
                    className={`rounded-3xl px-4 py-3 border ${
                      darkMode
                        ? 'bg-slate-900/70 border-slate-700/80'
                        : 'bg-white/90 border-slate-200'
                    } shadow-[0_10px_25px_rgba(148,163,184,0.6)]`}
                  >
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
        <div
          className={`${
            darkMode ? 'bg-slate-900/80' : 'bg-white/80'
          } border-t border-white/5 p-4 backdrop-blur-2xl shadow-[0_-12px_35px_rgba(15,23,42,0.9)]`}
        >
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Nachricht an ${currentBot.name}...`}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-2xl border ${
                darkMode
                  ? 'bg-slate-900/80 text-white placeholder-slate-500 border-slate-700/80 focus:border-blue-400/80'
                  : 'bg-white/80 text-slate-900 placeholder-slate-400 border-slate-200 focus:border-blue-500/70'
              } focus:outline-none focus:ring-2 ${colors.border} disabled:opacity-50 transition-all duration-200 shadow-[0_10px_30px_rgba(15,23,42,0.7)]`}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`bg-gradient-to-r from-${currentBot.color}-400 via-${currentBot.color}-500 to-${currentBot.color}-600 ${colors.hover} text-white px-6 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[60px] shadow-[0_14px_35px_rgba(59,130,246,0.9)] active:scale-[0.97]`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// Exportiere die Hauptkomponente als App
const App = AppWithAuth;
export default App;
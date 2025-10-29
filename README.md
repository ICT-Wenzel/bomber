# AI Cockpit

Einheitliches Frontend zur Interaktion mit internen KI-Bots über n8n.

## Features
- 🤖 3 KI-Bots (Dokumentation, Wiki, Basic)
- 💬 Chat-Interface mit Verlauf
- 🌓 Dark/Light Mode
- 📥 Export-Funktion
- ⚙️ Konfigurierbare n8n Webhook-URL

## Setup
1. n8n Webhook URL in `src/App.jsx` unter `ENV_CONFIG` eintragen
2. `npm install`
3. `npm run dev`

## Deployment auf Vercel

1. Fork/Clone dieses Repo
2. Mit Vercel verbinden
3. **Environment Variable hinzufügen:**
   - Key: `VITE_N8N_WEBHOOK_URL`
   - Value: Deine n8n Webhook URL
4. Deploy! 🚀

## Lokale Entwicklung

Nutze die Settings im UI oder füge temporär deine URL im Code ein.
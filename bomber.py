import streamlit as st
import requests
from datetime import datetime
from dotenv import load_dotenv
#import os

# .env laden
load_dotenv()

#webhook = os.getenv("WEBHOOK_URL")
webhook = st.secrets["WEBHOOK_URL"]
# Bot Konfigurationen
BOTS = {
    "normal": {
        "name": "General AI Assistant",
        "description": "Get help with general questions, writing, coding, and creative tasks. Like ChatGPT but customized for our organization.",
        "webhook": webhook,
        "emoji": "🌍",
        "color": "#4A4A4A",  # Grau
    },
    "internwiki": {
        "name": "Internal Wiki Bot",
        "description": "Search and get answers from our internal knowledge base, documentation, and company resources.",
        "webhook": webhook,
        "emoji": "📚",
        "color": "#4A4A4A",  # Grau
    },
    "documentation": {
        "name": "Documentation Bot",
        "description": "Assist with finding and retrieving documentation, guides, and API references.",
        "webhook": webhook,
        "emoji": "📄",
        "color": "#4A4A4A",  # Grau
    },
    "tickets": {
        "name": "Ticket Analyzer",
        "description": "Analyze support tickets, extract insights, categorize issues, and suggest solutions based on historical data.",
        "webhook":webhook,
        "emoji": "🎟️",
        "color": "#4A4A4A",  # Grau
    },
}

st.set_page_config(page_title="Chatbot Dashboard", page_icon="🤖", layout="wide")

# Session-State Setup
if "view" not in st.session_state:
    st.session_state.view = "dashboard"  # dashboard | chat
if "active_bot" not in st.session_state:
    st.session_state.active_bot = None
if "messages" not in st.session_state:
    st.session_state.messages = {}

# ---------------- Dashboard Ansicht ----------------
if st.session_state.view == "dashboard":
    col1, col2 = st.columns([1, 3])
    with col1:
        st.image("utils/bomber.png", width=120)
    with col2:
        st.markdown("""
            <h1 style='font-size: 3.5em; margin-bottom:0; background: linear-gradient(135deg, #232526 0%, #1f9fec 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>Bomber</h1>
        """, unsafe_allow_html=True)

    bots_list = list(BOTS.keys())
    # Zeilenweise Anzeige, immer 4 Spalten
    for i in range(0, len(bots_list), 3):
        cols = st.columns(3)
        for j, bot_key in enumerate(bots_list[i:i+3]):
            bot = BOTS[bot_key]
            with cols[j]:
                bot = BOTS[bot_key]

                # Bot-Karte
                st.markdown(
                    f"""
                    <style>
                    .glossy-botbox {{
                        background: linear-gradient(135deg, #232526 0%, #1f9fec 100%);
                        padding: 20px;
                        border-radius: 15px;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                        margin-bottom: 8px;
                        position: relative;
                        overflow: hidden;
                        transition: transform 0.2s, box-shadow 0.2s;
                        height: 340px;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }}
                    .glossy-botbox:hover {{
                        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                        transform: scale(1.04);
                        animation: pulse 0.5s;
                    }}
                    @keyframes pulse {{
                        0% {{ transform: scale(1); }}
                        50% {{ transform: scale(1.06); }}
                        100% {{ transform: scale(1.04); }}
                    }}
                    .stButton > button {{
                        display: block;
                        width: 100%;
                        padding: 12px 0;
                        margin-top: 2px;
                        font-size: 1.1em;
                        font-weight: bold;
                        color: #fff !important;
                        background: linear-gradient(135deg, #232526 0%, #1f9fec 100%) !important;
                        border: none !important;
                        border-radius: 10px !important;
                        cursor: pointer;
                        box-shadow: 0 2px 8px rgba(31,159,236,0.15);
                        transition: background 0.2s, transform 0.2s;
                    }}
                    .stButton > button:hover {{
                        background: linear-gradient(135deg, #1f9fec 0%, #6EE7B7 100%) !important;
                        transform: scale(1.05);
                    }}
                    </style>
                    <div class="glossy-botbox">
                        <span style="font-size:30px; margin-bottom:15px;">{bot['emoji']}</span>
                        <h3 class="bot-title">{bot['name']}</h3>
                        <p class="bot-desc">{bot['description']}</p>
                        <p class="bot-status">Ready to assist</p>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

                # 🎯 echter Streamlit-Button
                if st.button("Launch ➝", key=f"launch_{bot_key}"):
                    st.session_state.active_bot = bot_key
                    st.session_state.view = "chat"
                    st.rerun()


# ---------------- Chat Ansicht ----------------
elif st.session_state.view == "chat":
    bot_key = st.session_state.active_bot
    bot = BOTS[bot_key]

    st.markdown(f"""
        <style>
        .chat-glossy-box {{
            background: linear-gradient(135deg, #232526 0%, #1f9fec 100%);
            border-radius: 18px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            padding: 32px 28px 24px 28px;
            margin-bottom: 28px;
            margin-top: 32px;
        }}
        .chat-glossy-box h1, .chat-glossy-box p {{
            color: #fff !important;
            text-shadow: 0 2px 8px rgba(0,0,0,0.45);
        }}
        .stButton > button {{
            display: inline-block;
            padding: 10px 22px;
            font-size: 1.1em;
            font-weight: bold;
            color: #fff !important;
            background: linear-gradient(135deg, #232526 0%, #1f9fec 100%) !important;
            border: none !important;
            border-radius: 10px !important;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(31,159,236,0.15);
            transition: background 0.2s, transform 0.2s;
        }}
        .stButton > button:hover {{
            background: linear-gradient(135deg, #1f9fec 0%, #6EE7B7 100%) !important;
            transform: scale(1.05);
        }}
        </style>
        <div class="chat-glossy-box">
            <h1 style='font-size: 2.2em; margin-bottom:0; color: #fff; font-weight: 900; text-shadow: 0 2px 12px rgba(0,0,0,0.65);'>{bot['name']}</h1>
            <p style='font-size: 1.1em; margin-top:0; font-weight:500; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.65);'>{bot['description']}</p>
        </div>
    """, unsafe_allow_html=True)
    if st.button("⬅️ Zurück zum Dashboard", key="back_dashboard"):
        st.session_state.view = "dashboard"
        st.rerun()

    # Initial-Nachricht
    if bot_key not in st.session_state.messages:
        st.session_state.messages[bot_key] = [
            {
                "id": "1",
                "content": f"Hello! I'm {bot['name']}. {bot['description']} How can I help you today?",
                "isUser": False,
                "timestamp": datetime.now().strftime("%H:%M:%S"),
            }
        ]

    # Nachrichten anzeigen
    for msg in st.session_state.messages[bot_key]:
        if msg["isUser"]:
            st.chat_message("user").markdown(f"**Du:** {msg['content']}\n\n_{msg['timestamp']}_")
        else:
            st.chat_message("assistant").markdown(f"{msg['content']}\n\n_{msg['timestamp']}_")

    # Eingabe
    if prompt := st.chat_input("Schreibe eine Nachricht..."):
        # User-Nachricht
        user_message = {
            "id": str(len(st.session_state.messages[bot_key]) + 1),
            "content": prompt,
            "isUser": True,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
        }
        st.session_state.messages[bot_key].append(user_message)
        st.chat_message("user").markdown(f"**Du:** {prompt}\n\n_{user_message['timestamp']}_")

        # Bot-Antwort nur bei User-Request
        try:
            response = requests.post(
                bot["webhook"],
                json={"frage": f"{prompt} \n Es wird eine Nachricht für folgenden Bot verlangt: {bot['name']}"},
                timeout=60
            )
            response.raise_for_status()
            bot_content = response.text.strip() if response.text else "Keine Antwort erhalten."
        except Exception as e:
            bot_content = f"❌ Anfrage fehlgeschlagen: {e}"

        bot_message = {
            "id": str(len(st.session_state.messages[bot_key]) + 1),
            "content": bot_content,
            "isUser": False,
            "timestamp": datetime.now().strftime("%H:%M:%S"),
        }
        st.session_state.messages[bot_key].append(bot_message)
        st.chat_message("assistant").markdown(f"{bot_content}\n\n_{bot_message['timestamp']}_")



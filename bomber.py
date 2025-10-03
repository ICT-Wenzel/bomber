import streamlit as st
import requests
from datetime import datetime
from bots.registry import discover_bots

# Discover bots dynamically from the bots package
BOTS = discover_bots()

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
    if not bots_list:
        st.warning("Keine Bots gefunden. Füge neue Bots unter `bots/` hinzu.")
    # Zeilenweise Anzeige, immer 4 Spalten
    for i in range(0, len(bots_list), 3):
        cols = st.columns(3)
        for j, bot_key in enumerate(bots_list[i:i+3]):
            bot = BOTS[bot_key].to_config()
            with cols[j]:
                bot = BOTS[bot_key].to_config()

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
                        padding: 12px;
                        margin-top: 2px;
                        font-size: 2.1em;
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
    bot_instance = BOTS[bot_key]
    bot_instance.render_chat()



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
            <style>
            .app-title {
                font-size: 3.6em;
                margin: 0 0 4px 0;
                font-weight: 900;
                letter-spacing: -0.5px;
                background: radial-gradient(120% 120% at 0% 0%, #8bd3ff 0%, #1f9fec 30%, #7a5cff 60%, #232526 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                text-shadow: 0 8px 40px rgba(31,159,236,0.25);
            }
            .app-subtitle {
                margin: 0;
                color: #aeb6bf;
                font-weight: 500;
            }
            </style>
            <h1 class="app-title">Bomber</h1>
            <p class="app-subtitle">Your modular AI cockpit</p>
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
                # Wrapper um Karte + Button für gezieltes Styling
                st.markdown('<div class="bot-card-wrap">', unsafe_allow_html=True)

                # Bot-Karte
                st.markdown(
                    f"""
                    <style>
                    .glossy-botbox {{
                        position: relative;
                        background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
                        border: 1px solid rgba(255,255,255,0.08);
                        backdrop-filter: blur(8px);
                        padding: 20px;
                        border-radius: 18px;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
                        margin-bottom: 10px;
                        overflow: hidden;
                        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                        height: 160px;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }}
                    .glossy-botbox::before {{
                        content: "";
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(120% 120% at 0% 0%, rgba(31,159,236,0.25) 0%, rgba(110,231,183,0.12) 45%, rgba(122,92,255,0.12) 100%);
                        pointer-events: none;
                    }}
                    .glossy-botbox:hover {{
                        box-shadow: 0 12px 36px rgba(0,0,0,0.45);
                        transform: translateY(-4px);
                        border-color: rgba(110,231,183,0.35);
                    }}
                    .bot-title {{
                        margin: 0 0 6px 0;
                        font-size: 1.2rem;
                        color: #e9eef4;
                        font-weight: 800;
                        letter-spacing: 0.2px;
                    }}
                    .bot-desc {{
                        margin: 0 0 6px 0;
                        color: #c5ced8;
                        font-size: 0.96rem;
                        line-height: 1.35rem;
                    }}
                    .bot-status {{
                        margin: 0;
                        color: #9fe6b7;
                        font-weight: 700;
                        font-size: 0.9rem;
                    }}
                    /* Button in diesem Wrap so hoch wie die Karte */
                    .bot-card-wrap .stButton > button {{
                        height: 160px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }}
                    .stButton > button {{
                        display: block;
                        width: 100%;
                        padding: 12px;
                        margin-top: 6px;
                        font-size: 1.1rem;
                        font-weight: 1000;
                        color: #0b1020 !important;
                        background: linear-gradient(135deg, #6EE7B7 0%, #93C5FD 80%) !important;
                        border: none !important;
                        border-radius: 12px !important;
                        cursor: pointer;
                        box-shadow: 0 4px 12px rgba(31,159,236,0.25);
                        transition: background 0.25s ease, transform 0.15s ease;
                    }}
                    .stButton > button:hover {{
                        background: linear-gradient(135deg, #93C5FD 0%, #6EE7B7 80%) !important;
                        transform: translateY(-1px) scale(1.01);
                    }}
                    </style>
                    <div class="glossy-botbox">
                        <div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="font-size:32px;">{bot['emoji']}</div>
                                <h3 class="bot-title">{bot['name']}</h3>
                            </div>
                            <p class="bot-desc">{bot['description']}</p>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <p class="bot-status">Ready to assist</p>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True
                )

                # 🎯 echter Streamlit-Button
                if st.button("Launch ➝", key=f"launch_{bot_key}"):
                    st.session_state.active_bot = bot_key
                    st.session_state.view = "chat"
                    st.rerun()

                st.markdown("</div>", unsafe_allow_html=True)


# ---------------- Chat Ansicht ----------------
elif st.session_state.view == "chat":
    bot_key = st.session_state.active_bot
    bot_instance = BOTS[bot_key]
    bot_instance.render_chat()



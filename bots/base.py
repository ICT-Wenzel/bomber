from typing import Optional

class BaseBot:
    """Base class for all bots.

    Subclasses must set: id, name, description, emoji, color.
    Optionally set: secrets_key for per-bot webhook key (falls back to WEBHOOK_URL).
    """

    id: str = ""
    name: str = ""
    description: str = ""
    emoji: str = "🤖"
    color: str = "#4A4A4A"
    secrets_key: Optional[str] = None

    def resolve_webhook(self) -> Optional[str]:
        """Resolve webhook URL from Streamlit secrets or environment.

        Order:
        - st.secrets[secrets_key] or st.secrets[f"WEBHOOK_URL_{id.upper()}"]
        - st.secrets["WEBHOOK_URL"]
        - os.environ equivalents as fallback
        """
        try:
            import streamlit as st
        except Exception:
            st = None

        import os

        candidate_keys = []
        if self.secrets_key:
            candidate_keys.append(self.secrets_key)
        candidate_keys.append(f"WEBHOOK_URL_{self.id.upper()}")
        candidate_keys.append("WEBHOOK_URL")

        for key in candidate_keys:
            if st is not None:
                try:
                    value = st.secrets[key]  # type: ignore[index]
                    if value:
                        return str(value)
                except Exception:
                    pass
            env_val = os.environ.get(key)
            if env_val:
                return env_val

        return None

    def to_config(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "emoji": self.emoji,
            "color": self.color,
            "webhook": self.resolve_webhook(),
        }

    # ---------- Default UI rendering (can be overridden per bot) ----------
    def render_chat(self) -> None:
        try:
            import streamlit as st
        except Exception:
            return
        from datetime import datetime
        import requests

        bot_key = self.id
        webhook_url = self.resolve_webhook()

        # Inject CSS (no f-string to avoid brace escaping issues)
        st.markdown("""
            <style>
            .chat-container {
                background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 18px;
                box-shadow: 0 10px 32px rgba(0,0,0,0.35);
                padding: 22px 22px 14px 22px;
                margin: 26px 0 20px 0;
                position: relative;
                overflow: hidden;
            }
            .chat-container::before {
                content: "";
                position: absolute;
                inset: 0;
                background: radial-gradient(140% 140% at 0% 0%, rgba(31,159,236,0.2) 0%, rgba(110,231,183,0.12) 50%, rgba(122,92,255,0.12) 100%);
                pointer-events: none;
            }
            .chat-header {
                margin: 0 0 8px 0;
                color: #e9eef4;
                font-weight: 900;
                font-size: 1.8rem;
                letter-spacing: 0.2px;
            }
            .chat-sub {
                margin: 0 0 8px 0;
                color: #c5ced8;
                font-weight: 500;
            }
            .chat-feed { margin: 8px 0 12px 0; }
            .bubble-user {
                background: linear-gradient(135deg, #93C5FD 0%, #6EE7B7 100%);
                color: #0b1020;
                padding: 12px 14px;
                border-radius: 14px;
                margin: 6px 0;
                display: inline-block;
                max-width: 92%;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(31,159,236,0.25);
            }
            .bubble-assistant {
                background: rgba(255,255,255,0.06);
                color: #e9eef4;
                padding: 12px 14px;
                border-radius: 14px;
                margin: 6px 0;
                display: inline-block;
                max-width: 92%;
                border: 1px solid rgba(255,255,255,0.08);
            }
            .bubble-assistant pre, .bubble-assistant code { background: rgba(0,0,0,0.35); color: #e9eef4; }
            .bubble-assistant pre { padding: 10px; border-radius: 10px; overflow-x: auto; }
            .bubble-assistant code { padding: 2px 6px; border-radius: 6px; }
            .chat-row { display: flex; gap: 8px; align-items: flex-end; margin: 8px 0; }
            .chat-row.user { justify-content: flex-end; }
            .chat-row.assistant { justify-content: flex-start; }
            .chat-row .time { font-size: 0.75rem; color: #aeb6bf; margin: 2px 6px; }
            .avatar { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); }
            .avatar span { font-size: 18px; }
            .message { max-width: 85%; }
            .typing { display: inline-block; min-width: 36px; }
            .typing .dot { height: 6px; width: 6px; margin: 0 2px; background: #c5ced8; border-radius: 50%; display: inline-block; animation: blink 1.2s infinite; }
            .typing .dot:nth-child(2) { animation-delay: .2s; }
            .typing .dot:nth-child(3) { animation-delay: .4s; }
            @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
            [data-testid="stChatInput"] textarea { font-weight: 600; }
            .stButton > button {
                display: inline-block;
                padding: 10px 22px;
                font-size: 1.05rem;
                font-weight: 800;
                color: #0b1020 !important;
                background: linear-gradient(135deg, #6EE7B7 0%, #93C5FD 80%) !important;
                border: none !important;
                border-radius: 12px !important;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(31,159,236,0.25);
                transition: background 0.25s ease, transform 0.15s ease;
            }
            .stButton > button:hover {
                background: linear-gradient(135deg, #93C5FD 0%, #6EE7B7 80%) !important;
                transform: translateY(-1px) scale(1.01);
            }
            </style>
        """, unsafe_allow_html=True)

        # Header HTML with variables
        st.markdown(
            f"""
            <div class=\"chat-container\"> 
                <h1 class=\"chat-header\">{self.name}</h1>
                <p class=\"chat-sub\">{self.description}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        if st.button("⬅️ Zurück zum Dashboard", key=f"back_dashboard_{bot_key}"):
            st.session_state.view = "dashboard"
            st.rerun()

        if "messages" not in st.session_state:
            st.session_state.messages = {}
        if bot_key not in st.session_state.messages:
            st.session_state.messages[bot_key] = [
                {
                    "id": "1",
                    "content": f"Hello! I'm {self.name}. {self.description} How can I help you today?",
                    "isUser": False,
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                }
            ]

        st.markdown("<div class='chat-feed'>", unsafe_allow_html=True)
        for msg in st.session_state.messages[bot_key]:
            role = "user" if msg["isUser"] else "assistant"
            bubble_class = "bubble-user" if msg["isUser"] else "bubble-assistant"
            avatar = "🧑" if msg["isUser"] else self.emoji
            if msg["isUser"]:
                st.markdown(
                    f"<div class='chat-row user'><div class='message'><div class='{bubble_class}'>{msg['content']}</div><span class='time'>{msg['timestamp']}</span></div><div class='avatar'><span>{avatar}</span></div></div>",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    f"<div class='chat-row assistant'><div class='avatar'><span>{avatar}</span></div><div class='message'><div class='{bubble_class}'>{msg['content']}</div><span class='time'>{msg['timestamp']}</span></div></div>",
                    unsafe_allow_html=True,
                )
        st.markdown("</div>", unsafe_allow_html=True)

        if prompt := st.chat_input("Schreibe eine Nachricht..."):
            user_message = {
                "id": str(len(st.session_state.messages[bot_key]) + 1),
                "content": prompt,
                "isUser": True,
                "timestamp": datetime.now().strftime("%H:%M:%S"),
            }
            st.session_state.messages[bot_key].append(user_message)
            st.markdown(
                f"<div class='chat-row user'><div class='message'><div class='bubble-user'>{prompt}</div><span class='time'>{user_message['timestamp']}</span></div><div class='avatar'><span>🧑</span></div></div>",
                unsafe_allow_html=True,
            )

            typing_placeholder = st.empty()
            typing_placeholder.markdown(
                f"<div class='chat-row assistant'><div class='avatar'><span>{self.emoji}</span></div><div class='message'><div class='bubble-assistant'><span class='typing'><span class='dot'></span><span class='dot'></span><span class='dot'></span></span></div></div></div>",
                unsafe_allow_html=True,
            )

            if not webhook_url:
                bot_content = (
                    "❌ Kein Webhook konfiguriert. Bitte setze `WEBHOOK_URL_" + bot_key.upper() +
                    "` oder `WEBHOOK_URL` in den Secrets/Umgebungsvariablen."
                )
            else:
                try:
                    response = requests.post(
                        webhook_url,
                        json={"frage": f"{prompt} \n Es wird eine Nachricht für folgenden Bot verlangt: {self.name}"},
                        timeout=180,
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
            typing_placeholder.empty()
            st.markdown(
                f"<div class='chat-row assistant'><div class='avatar'><span>{self.emoji}</span></div><div class='message'><div class='bubble-assistant'>{bot_content}</div><span class='time'>{bot_message['timestamp']}</span></div></div>",
                unsafe_allow_html=True,
            )



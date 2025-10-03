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
    secrets_key: str | None = None

    def resolve_webhook(self) -> str | None:
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
                <h1 style='font-size: 2.2em; margin-bottom:0; color: #fff; font-weight: 900; text-shadow: 0 2px 12px rgba(0,0,0,0.65);'>{self.name}</h1>
                <p style='font-size: 1.1em; margin-top:0; font-weight:500; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.65);'>{self.description}</p>
            </div>
        """, unsafe_allow_html=True)

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

        for msg in st.session_state.messages[bot_key]:
            if msg["isUser"]:
                st.chat_message("user").markdown(f"**Du:** {msg['content']}\n\n_{msg['timestamp']}_")
            else:
                st.chat_message("assistant").markdown(f"{msg['content']}\n\n_{msg['timestamp']}_")

        if prompt := st.chat_input("Schreibe eine Nachricht..."):
            user_message = {
                "id": str(len(st.session_state.messages[bot_key]) + 1),
                "content": prompt,
                "isUser": True,
                "timestamp": datetime.now().strftime("%H:%M:%S"),
            }
            st.session_state.messages[bot_key].append(user_message)
            st.chat_message("user").markdown(f"**Du:** {prompt}\n\n_{user_message['timestamp']}_")

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
            st.chat_message("assistant").markdown(f"{bot_content}\n\n_{bot_message['timestamp']}_")



from .base import BaseBot
import streamlit as st
import requests
from datetime import datetime


class DocumentationBot(BaseBot):
    id = "documentation"
    name = "Documentation Bot"
    description = (
        "Assist with finding and retrieving documentation, guides, and API references."
    )
    emoji = "📄"
    color = "#4A4A4A"
    
    # Webhook URL - hier deine URL eintragen
    webhook_url = "https://your-webhook-url.com/api/documentation"

    def ui_styles(self) -> str:
        return (
            ".chat-header { letter-spacing: 0.4px; } "
            ".bubble-assistant { border-color: rgba(110,231,183,0.35); } "
            ".docmsg { display: block; white-space: pre-wrap; } "
            ".message-actions { margin-top: 12px; display: flex; gap: 8px; justify-content: flex-start; } "
            ".action-btn { padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; "
            "background: white; cursor: pointer; font-size: 13px; } "
            ".action-btn:hover { background: #f0f0f0; } "
        )

    def initial_assistant_message(self) -> str:
        return (
            "Hello! Tell me what docs, APIs, or guides you need. I'll fetch them."
        )

    def format_user_prompt(self, prompt: str) -> str:
        return f"[DOCS_REQUEST] {prompt}"

    def render_message_html(self, content: str, is_user: bool, timestamp: str, message_id: int = None) -> str:
        """
        WICHTIG: Diese Methode wird von der Base-Klasse aufgerufen.
        Wir müssen hier die Buttons direkt einbauen!
        """
        if is_user:
            return super().render_message_html(content, is_user, timestamp)
        
        # Assistant Message MIT Buttons im HTML
        html = (
            f"<div class='chat-row assistant'>"
            f"<div class='avatar'><span>{self.emoji}</span></div>"
            f"<div class='message'>"
            f"<div class='bubble-assistant'>"
            f"<div class='docmsg'>{content}</div>"
            f"</div>"
            f"<span class='time'>{timestamp}</span>"
        )
        
        # Buttons NUR rendern wenn message_id vorhanden
        if message_id is not None:
            html += f"<div class='message-actions' id='actions_{message_id}'></div>"
        
        html += "</div></div>"
        
        return html
    
    def render_assistant_message_with_actions(self, content: str, timestamp: str, message_id: int):
        """
        Rendert die Message UND die Buttons separat.
        Diese Methode muss von deinem Chat-Loop aufgerufen werden!
        """
        # 1. HTML Message rendern
        html = self.render_message_html(content, is_user=False, timestamp=timestamp, message_id=message_id)
        st.markdown(html, unsafe_allow_html=True)
        
        # 2. Buttons in Container (außerhalb des HTML)
        col1, col2, col3 = st.columns([7, 1.5, 1.5])
        
        with col2:
            if st.button("📋 Copy", key=f"copy_{message_id}", use_container_width=True):
                st.session_state[f"show_copy_{message_id}"] = True
        
        with col3:
            if st.button("📄 Add to Docs", key=f"webhook_{message_id}", use_container_width=True):
                with st.spinner("Sending..."):
                    success = self.send_to_webhook(content, timestamp)
                if success:
                    st.success("✓ Added to documentation!")
                else:
                    st.error("✗ Failed to send")
        
        # Copy Expander anzeigen wenn aktiviert
        if st.session_state.get(f"show_copy_{message_id}", False):
            with st.expander("📋 Content zum Kopieren", expanded=True):
                st.code(content, language=None)
                if st.button("✕ Close", key=f"close_copy_{message_id}"):
                    st.session_state[f"show_copy_{message_id}"] = False
                    st.rerun()
    
    def send_to_webhook(self, content: str, timestamp: str) -> bool:
        """
        Sendet den Content per POST an die Webhook URL
        """
        try:
            payload = {
                "content": content,
                "timestamp": timestamp,
                "type": "documentation",
                "created_at": datetime.now().isoformat()
            }
            
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            return response.status_code == 200
        except Exception as e:
            st.error(f"Webhook error: {e}")
            return False
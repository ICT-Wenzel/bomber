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
        )

    def initial_assistant_message(self) -> str:
        return (
            "Hello! Tell me what docs, APIs, or guides you need. I'll fetch them."
        )

    def format_user_prompt(self, prompt: str) -> str:
        return f"[DOCS_REQUEST] {prompt}"

    def render_message_html(self, content: str, is_user: bool, timestamp: str) -> str:
        if is_user:
            return super().render_message_html(content, is_user, timestamp)
        
        # Standard HTML für Assistant Message
        html = (
            f"<div class='chat-row assistant'>"
            f"<div class='avatar'><span>{self.emoji}</span></div>"
            f"<div class='message'>"
            f"<div class='bubble-assistant'>"
            f"<div class='docmsg'>{content}</div>"
            f"</div>"
            f"<span class='time'>{timestamp}</span>"
            f"</div></div>"
        )
        return html
    
    def render_message_with_actions(self, content: str, timestamp: str, message_id: int):
        """
        Rendert eine Nachricht mit Streamlit-Buttons
        """
        # Message HTML
        html = self.render_message_html(content, is_user=False, timestamp=timestamp)
        st.markdown(html, unsafe_allow_html=True)
        
        # Streamlit Buttons in Columns
        col1, col2, col3 = st.columns([2, 1, 1])
        
        with col2:
            if st.button("📋 Copy", key=f"copy_{message_id}", use_container_width=True):
                st.code(content, language=None)
                st.success("✓ Kopiere den Text aus dem Code-Block oben!", icon="✓")
        
        with col3:
            if st.button("📄 Add to Docs", key=f"webhook_{message_id}", use_container_width=True):
                success = self.send_to_webhook(content, timestamp)
                if success:
                    st.success("✓ Added to documentation!", icon="✓")
                else:
                    st.error("✗ Failed to send", icon="✗")
    
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
            print(f"Webhook error: {e}")
            return False
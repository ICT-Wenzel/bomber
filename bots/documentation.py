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
        """Standard Message Rendering ohne Buttons"""
        if is_user:
            return super().render_message_html(content, is_user, timestamp)
        
        # Einfache Assistant Message
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
    
    def render_message_with_actions(self, content: str, is_user: bool, timestamp: str, message_id: int):
        """
        Rendert Message MIT Action Buttons.
        Rufe diese Methode statt render_message_html auf!
        """
        # 1. Message HTML rendern
        message_html = self.render_message_html(content, is_user, timestamp)
        st.markdown(message_html, unsafe_allow_html=True)
        
        # 2. Nur für Assistant Messages: Buttons rendern
        if not is_user:
            # Kleine Lücke für bessere Optik
            st.markdown("<div style='height: 4px;'></div>", unsafe_allow_html=True)
            
            # Buttons in Columns
            col1, col2, col3, col4 = st.columns([6, 1.2, 1.5, 1])
            
            with col2:
                copy_btn = st.button(
                    "📋 Copy", 
                    key=f"copy_btn_{message_id}",
                    use_container_width=True,
                    type="secondary"
                )
                
            with col3:
                docs_btn = st.button(
                    "📄 Add to Docs", 
                    key=f"docs_btn_{message_id}",
                    use_container_width=True,
                    type="primary"
                )
            
            # Button Actions
            if copy_btn:
                # Zeige den Content zum manuellen Kopieren
                st.text_area(
                    "Content to copy:",
                    value=content,
                    height=200,
                    key=f"copy_area_{message_id}"
                )
                st.info("👆 Select the text above and copy it (Ctrl+C / Cmd+C)")
                
            if docs_btn:
                with st.spinner("Sending to webhook..."):
                    success = self.send_to_webhook(content, timestamp)
                
                if success:
                    st.success("✅ Successfully added to documentation!", icon="✅")
                else:
                    st.error("❌ Failed to send to webhook. Check the URL and try again.", icon="❌")
            
            # Trennlinie nach den Buttons
            st.markdown("<div style='height: 8px;'></div>", unsafe_allow_html=True)
    
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
            
        except requests.exceptions.Timeout:
            st.error("⏱️ Request timed out after 10 seconds")
            return False
        except requests.exceptions.ConnectionError:
            st.error("🔌 Could not connect to webhook URL")
            return False
        except Exception as e:
            st.error(f"⚠️ Webhook error: {str(e)}")
            return False
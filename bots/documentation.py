from .base import BaseBot


class DocumentationBot(BaseBot):
    id = "documentation"
    name = "Documentation Bot"
    description = (
        "Assist with finding and retrieving documentation, guides, and API references."
    )
    emoji = "📄"
    color = "#4A4A4A"

    def ui_styles(self) -> str:
        return (
            ".chat-header { letter-spacing: 0.4px; } "
            ".bubble-assistant { border-color: rgba(110,231,183,0.35); } "
            ".docmsg { display: block; white-space: pre-wrap; } "
            ".bubble-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 8px; } "
            ".copy-btn { border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: #e9eef4; border-radius: 8px; padding: 6px 10px; font-size: 12px; cursor: pointer; } "
            ".copy-btn:hover { background: rgba(255,255,255,0.14); } "
            ".copy-badge { font-size: 12px; color: #9fe6b7; display: none; } "
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
        # Assistant message with copy button below the content (avoid f-string to keep JS braces intact)
        template = (
            "<div class='chat-row assistant'><div class='avatar'><span>__EMOJI__</span></div><div class='message'>"
            "<div class='bubble-assistant'><div class='docmsg'>__CONTENT__</div>"
            "<div class='bubble-actions'>"
            "<button class='copy-btn' onclick=\"(function(btn){const msg=btn.closest('.bubble-assistant').querySelector('.docmsg');if(!msg) return;const txt=msg.innerText;try{navigator.clipboard.writeText(txt);}catch(e){const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}const ok=btn.parentElement.querySelector('.copy-badge'); if(ok){ok.style.display='inline'; setTimeout(()=>ok.style.display='none',1200);} })(this)\">Copy</button>"
            "<span class='copy-badge'>Copied</span>"
            "</div></div>"
            "<span class='time'>__TIMESTAMP__</span></div></div>"
        )
        return (
            template
            .replace("__EMOJI__", str(self.emoji))
            .replace("__CONTENT__", content)
            .replace("__TIMESTAMP__", timestamp)
        )



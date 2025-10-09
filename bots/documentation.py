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
            ".bubble-assistant { border-color: rgba(110,231,183,0.35); position: relative; padding-right: 44px; } "
            ".copy-btn { position: absolute; top: 8px; right: 8px; border: 1px solid rgba(255,255,255,0.15); "
            "background: rgba(255,255,255,0.08); color: #e9eef4; border-radius: 8px; padding: 6px 8px; font-size: 12px; cursor: pointer; } "
            ".copy-btn:hover { background: rgba(255,255,255,0.14); } "
            ".copy-badge { margin-left: 8px; font-size: 12px; color: #9fe6b7; display: none; } "
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
        # Assistant message with copy button
        safe_id = abs(hash(content)) % (10**9)
        return (
            f"<div class='chat-row assistant'><div class='avatar'><span>{self.emoji}</span></div><div class='message'>"
            f"<div class='bubble-assistant'><button class='copy-btn' onclick=\"(async()=>{"
            f"const el=document.getElementById('docmsg-{safe_id}');"
            f"if(!el) return;"
            f"const txt=el.innerText;"
            f"try{{await navigator.clipboard.writeText(txt);}}catch(e){{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}}"
            f"const ok=el.parentElement.querySelector('.copy-badge'); if(ok){{ok.style.display='inline'; setTimeout(()=>ok.style.display='none',1200);}}"
            f"})()\">Copy</button><span id='docmsg-{safe_id}'>{content}</span><span class='copy-badge'>Copied</span></div>"
            f"<span class='time'>{timestamp}</span></div></div>"
        )



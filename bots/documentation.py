from .base import BaseBot


class DocumentationBot(BaseBot):
    id = "documentation"
    name = "Documentation Bot"
    description = (
        "Assist with finding and retrieving documentation, guides, and API references."
    )
    emoji = "📄"
    color = "#4A4A4A"
    
    # Webhook URL - hier deine URL eintragen
    add_documentation_webhook_url = "https://your-webhook-url.com/api/documentation"

    def ui_styles(self) -> str:
        return (
            ".chat-header { letter-spacing: 0.4px; } "
            ".bubble-assistant { border-color: rgba(110,231,183,0.35); } "
            ".docmsg { display: block; white-space: pre-wrap; } "
            ".bubble-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 8px; } "
            ".copy-btn, .webhook-btn { border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.08); color: #e9eef4; border-radius: 8px; padding: 6px 10px; font-size: 12px; cursor: pointer; } "
            ".copy-btn:hover, .webhook-btn:hover { background: rgba(255,255,255,0.14); } "
            ".webhook-btn { background: rgba(110,231,183,0.15); border-color: rgba(110,231,183,0.35); } "
            ".webhook-btn:hover { background: rgba(110,231,183,0.25); } "
            ".webhook-btn:disabled { opacity: 0.5; cursor: not-allowed; } "
            ".copy-badge, .webhook-badge { font-size: 12px; color: #9fe6b7; display: none; } "
            ".webhook-error { font-size: 12px; color: #ff6b6b; display: none; } "
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
        
        # JavaScript für Webhook-Funktion (escapen für Python String)
        webhook_js = (
            "async function(btn){"
            "const msg=btn.closest('.bubble-assistant').querySelector('.docmsg');"
            "if(!msg) return;"
            "const txt=msg.innerText;"
            "const badge=btn.parentElement.querySelector('.webhook-badge');"
            "const error=btn.parentElement.querySelector('.webhook-error');"
            "btn.disabled=true;"
            "btn.textContent='Sending...';"
            "try{"
            f"const res=await fetch('{self.add_documentation_webhook_url}',{{"
            "method:'POST',"
            "headers:{'Content-Type':'application/json'},"
            "body:JSON.stringify({content:txt,timestamp:'" + timestamp + "',type:'documentation'})"
            "});"
            "if(res.ok){"
            "if(badge){badge.style.display='inline';setTimeout(()=>badge.style.display='none',2000);}"
            "btn.textContent='Add to Documentation';"
            "}else{"
            "throw new Error('Request failed');"
            "}"
            "}catch(e){"
            "if(error){error.style.display='inline';setTimeout(()=>error.style.display='none',3000);}"
            "btn.textContent='Add to Documentation';"
            "}finally{"
            "btn.disabled=false;"
            "}"
            "}"
        )
        
        # Copy Button JavaScript (wie gehabt)
        copy_js = (
            "function(btn){"
            "const msg=btn.closest('.bubble-assistant').querySelector('.docmsg');"
            "if(!msg) return;"
            "const txt=msg.innerText;"
            "const showOk=()=>{"
            "const ok=btn.parentElement.querySelector('.copy-badge');"
            "if(ok){ok.style.display='inline';setTimeout(()=>ok.style.display='none',1200);}"
            "};"
            "const fallback=()=>{"
            "const ta=document.createElement('textarea');"
            "ta.value=txt;"
            "ta.style.position='fixed';"
            "ta.style.opacity='0';"
            "document.body.appendChild(ta);"
            "ta.focus();"
            "ta.select();"
            "try{document.execCommand('copy');}catch(e){}"
            "document.body.removeChild(ta);"
            "showOk();"
            "};"
            "if(navigator.clipboard && window.isSecureContext){"
            "navigator.clipboard.writeText(txt).then(showOk).catch(fallback);"
            "}else{fallback();}"
            "}"
        )
        
        template = (
            "<div class='chat-row assistant'><div class='avatar'><span>__EMOJI__</span></div><div class='message'>"
            "<div class='bubble-assistant'><div class='docmsg'>__CONTENT__</div>"
            "<div class='bubble-actions'>"
            f"<button class='webhook-btn' onclick=\"({webhook_js})(this)\">Add to Documentation</button>"
            f"<button class='copy-btn' onclick=\"({copy_js})(this)\">Copy</button>"
            "<span class='webhook-badge'>✓ Added</span>"
            "<span class='webhook-error'>✗ Failed</span>"
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
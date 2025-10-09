from .base import BaseBot


class NormalBot(BaseBot):
    id = "normal"
    name = "General AI Assistant"
    description = (
        "Get help with general questions, writing, coding, and creative tasks. "
        "Like ChatGPT but customized for our organization."
    )
    emoji = "🌍"
    color = "#4A4A4A"

    # Per-bot UI customizations
    def ui_styles(self) -> str:
        return ".bubble-assistant { border-color: rgba(147,197,253,0.35); }"

    def initial_assistant_message(self) -> str:
        return (
            "Hi! I'm your general assistant. Ask me anything—writing, code, ideas."
        )

    def format_user_prompt(self, prompt: str) -> str:
        return prompt



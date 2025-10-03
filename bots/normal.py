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



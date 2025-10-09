from .base import BaseBot


class InternWikiBot(BaseBot):
    id = "internwiki"
    name = "Internal Wiki Bot"
    description = (
        "Search and get answers from our Confluencedocumentation, "
        "and company resources."
    )
    emoji = "📚"
    color = "#4A4A4A"

    def ui_styles(self) -> str:
        return ".bubble-assistant { border-color: rgba(122,92,255,0.35); }"

    def initial_assistant_message(self) -> str:
        return "Hi, I answer from the internal wiki. What should I look up?"

    def format_user_prompt(self, prompt: str) -> str:
        return f"[WIKI_QUERY] {prompt}"



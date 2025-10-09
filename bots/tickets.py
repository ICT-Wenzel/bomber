from .base import BaseBot


class TicketsBot(BaseBot):
    id = "tickets"
    name = "Ticket Analyzer"
    description = (
        "Analyze support tickets, extract insights, categorize issues, and suggest "
        "solutions based on historical data."
    )
    emoji = "🎟️"
    color = "#4A4A4A"

    def ui_styles(self) -> str:
        return ".bubble-assistant { border-color: rgba(233,196,106,0.35); }"

    def initial_assistant_message(self) -> str:
        return "Provide a ticket or summary; I will analyze and categorize it."

    def format_user_prompt(self, prompt: str) -> str:
        return f"[TICKET_ANALYSIS] {prompt}"



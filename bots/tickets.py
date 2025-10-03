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



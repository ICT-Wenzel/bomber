class BaseBot:
    """Base class for all bots.

    Subclasses must set: id, name, description, emoji, color.
    Optionally set: secrets_key for per-bot webhook key (falls back to WEBHOOK_URL).
    """

    id: str = ""
    name: str = ""
    description: str = ""
    emoji: str = "🤖"
    color: str = "#4A4A4A"
    secrets_key: str | None = None

    def resolve_webhook(self) -> str | None:
        """Resolve webhook URL from Streamlit secrets or environment.

        Order:
        - st.secrets[secrets_key] or st.secrets[f"WEBHOOK_URL_{id.upper()}"]
        - st.secrets["WEBHOOK_URL"]
        - os.environ equivalents as fallback
        """
        try:
            import streamlit as st
        except Exception:
            st = None

        import os

        candidate_keys = []
        if self.secrets_key:
            candidate_keys.append(self.secrets_key)
        candidate_keys.append(f"WEBHOOK_URL_{self.id.upper()}")
        candidate_keys.append("WEBHOOK_URL")

        for key in candidate_keys:
            if st is not None:
                try:
                    value = st.secrets[key]  # type: ignore[index]
                    if value:
                        return str(value)
                except Exception:
                    pass
            env_val = os.environ.get(key)
            if env_val:
                return env_val

        return None

    def to_config(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "emoji": self.emoji,
            "color": self.color,
            "webhook": self.resolve_webhook(),
        }



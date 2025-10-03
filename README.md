## Modular bots structure

Each bot is handled individually under the `bots/` package.

Structure:

```
bots/
  __init__.py
  base.py
  registry.py
  normal.py
  internwiki.py
  documentation.py
  tickets.py
```

Add a new bot:

1. Create `bots/<your_bot>.py` and subclass `BaseBot`:

```python
from .base import BaseBot


class MyBot(BaseBot):
    id = "mybot"
    name = "My Custom Bot"
    description = "What the bot does"
    emoji = "✨"
    color = "#4A4A4A"
    # Optional: secrets_key = "WEBHOOK_URL_MYBOT"
```

2. Provide a webhook URL in secrets or env:

- `WEBHOOK_URL_MYBOT` (preferred per-bot)
- fallback: `WEBHOOK_URL`

3. The app will auto-discover the bot. No app changes required.



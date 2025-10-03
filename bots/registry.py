from __future__ import annotations

from importlib import import_module
from pkgutil import iter_modules
from pathlib import Path
from typing import Dict

from .base import BaseBot


def discover_bots() -> Dict[str, BaseBot]:
    """Discover bot subclasses in the current package and return config mapping.

    Each module under bots/ that defines a subclass of BaseBot with a non-empty
    id will be instantiated and converted to a config dict.
    """
    bots_dir = Path(__file__).parent
    package_name = __package__ or "bots"

    instances: Dict[str, BaseBot] = {}

    for module_info in iter_modules([str(bots_dir)]):
        name = module_info.name
        if name in {"__init__", "base", "registry"}:
            continue
        module = import_module(f"{package_name}.{name}")
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if isinstance(attr, type) and issubclass(attr, BaseBot) and attr is not BaseBot:
                bot: BaseBot = attr()
                if not bot.id:
                    continue
                instances[bot.id] = bot
    return instances



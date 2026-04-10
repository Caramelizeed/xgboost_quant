import yaml
from pathlib import Path
from typing import Any, Dict

CONFIG_PATH = Path(__file__).resolve().parents[1] / 'config' / 'config.yaml'


def load_config() -> Dict[str, Any]:
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


CFG = load_config()

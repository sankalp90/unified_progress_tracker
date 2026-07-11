import json
import os
from typing import Any, Optional

import redis


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Decode responses
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)


def get_json(key: str) -> Optional[Any]:
    raw = redis_client.get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # If someone stored a non-JSON value under this key
        return None


def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    redis_client.setex(key, ttl_seconds, json.dumps(value))


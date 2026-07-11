import requests
from dotenv import load_dotenv
import os

from redis_cache import get_json, set_json


load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def get_github_stats(username: str):

    cache_key = f"github:stats:{username}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached

    url = f"https://api.github.com/users/{username}"

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    result = {
        "platform": "github",
        "public_repos": data["public_repos"],
        "followers": data["followers"],
        "following": data["following"],
        "created_at": data["created_at"]
    }

    set_json(cache_key, result, ttl_seconds=300)
    return result

import requests


def get_github_contribution_history(username: str):

    cache_key = f"github:contrib_history:{username}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached

    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
    """

    response = requests.post(
        "https://api.github.com/graphql",
        json={
            "query": query,
            "variables": {
                "login": username
            }
        },
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}"
        }
    )

    if response.status_code != 200:
        return None

    data = response.json()

    user = (
        data.get("data", {})
        .get("user")
    )

    if not user:
        return None

    weeks = (
        user["contributionsCollection"]
        ["contributionCalendar"]
        ["weeks"]
    )

    history = {}

    for week in weeks:
        for day in week["contributionDays"]:

            history[day["date"]] = (
                day["contributionCount"]
            )

    set_json(cache_key, history, ttl_seconds=900)
    return history

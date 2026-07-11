import requests
import json
from datetime import datetime

from redis_cache import get_json, set_json


def get_leetcode_stats(username: str):

    cache_key = f"leetcode:stats:{username}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached

    url = "https://leetcode.com/graphql"

    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "username": username
        }
    }

    response = requests.post(url, json=payload)

    print("Status:", response.status_code)
    print("Response:", response.text)

    if response.status_code != 200:
        return None

    data = response.json()

    user = data.get("data", {}).get("matchedUser")

    if not user:
        return None

    stats = user["submitStats"]["acSubmissionNum"]

    total = 0
    easy = 0
    medium = 0
    hard = 0

    for item in stats:

        if item["difficulty"] == "All":
            total = item["count"]

        elif item["difficulty"] == "Easy":
            easy = item["count"]

        elif item["difficulty"] == "Medium":
            medium = item["count"]

        elif item["difficulty"] == "Hard":
            hard = item["count"]

    result = {
        "platform": "leetcode",
        "solved": total,
        "easy": easy,
        "medium": medium,
        "hard": hard
    }

    set_json(cache_key, result, ttl_seconds=300)
    return result



def get_leetcode_submission_history(username: str):

    cache_key = f"leetcode:history:{username}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached

    url = "https://leetcode.com/graphql"

    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submissionCalendar
      }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "username": username
        }
    }

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        return None

    data = response.json()

    user = data.get("data", {}).get("matchedUser")

    if not user:
        return None

    calendar_str = user.get("submissionCalendar")

    if not calendar_str:
        return []

    calendar = json.loads(calendar_str)

    history = []

    for timestamp, count in calendar.items():

        history.append({
            "date": datetime.fromtimestamp(
                int(timestamp)
            ).strftime("%Y-%m-%d"),

            "submissions": count
        })

    history.sort(
        key=lambda x: x["date"]
    )

    set_json(cache_key, history, ttl_seconds=900)
    return history

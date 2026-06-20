import requests
from datetime import datetime, timedelta

def get_codeforces_stats(handle: str):

    url = f"https://codeforces.com/api/user.info?handles={handle}"

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    if data["status"] != "OK":
        return None

    user = data["result"][0]

    return {
        "platform": "codeforces",
        "rating": user.get("rating", 0),
        "max_rating": user.get("maxRating", 0),
        "rank": user.get("rank", "unrated"),
        "max_rank": user.get("maxRank", "unrated")
    }

def get_codeforces_solved(handle: str):
    url = f"https://codeforces.com/api/user.status?handle={handle}"

    response = requests.get(url)

    if response.status_code != 200:
        return 0

    data = response.json()
    solved = set()

    for submission in data["result"]:
        if submission.get("verdict") == "OK":
            problem = submission["problem"]

            problem_id = (problem.get("contestId"), problem.get("index"))
            solved.add(problem_id)

    return len(solved)


def get_codeforces_submission_history(handle: str):

    url = (
        f"https://codeforces.com/api/user.status"
        f"?handle={handle}"
    )

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    if data["status"] != "OK":
        return None

    submissions_by_date = {}

    for submission in data["result"]:

        timestamp = submission["creationTimeSeconds"]

        date = datetime.fromtimestamp(
            timestamp
        ).strftime("%Y-%m-%d")

        submissions_by_date[date] = (
            submissions_by_date.get(date, 0) + 1
        )

    history = []

    for date, count in submissions_by_date.items():

        history.append({
            "date": date,
            "submissions": count
        })

    history.sort(
        key=lambda x: x["date"]
    )

    return history

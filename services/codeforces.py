import requests

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

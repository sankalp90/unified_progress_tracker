import requests


def get_github_stats(username: str):

    url = f"https://api.github.com/users/{username}"

    response = requests.get(url)

    if response.status_code != 200:
        return None

    data = response.json()

    return {
        "platform": "github",
        "public_repos": data["public_repos"],
        "followers": data["followers"],
        "following": data["following"],
        "created_at": data["created_at"]
    }
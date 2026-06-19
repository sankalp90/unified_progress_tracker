from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User

router = APIRouter()


@router.get("/")
async def get_leaderboard(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    leaderboard = []

    for user in users:

        # ======================
        # LeetCode Coding Score
        # ======================

        easy = 0
        medium = 0
        hard = 0

        for stat in user.stats:
            easy += stat.easy
            medium += stat.medium
            hard += stat.hard

        lcs = (
            easy +
            (3 * medium) +
            (7 * hard)
        )

        # ======================
        # Github
        # ======================

        github_repos = 0

        if user.github_stats:
            github_repos = user.github_stats[0].public_repos

        # ======================
        # Codeforces
        # ======================

        codeforces_rating = 0

        for metric in user.platform_metrics:
            if metric.platform == "codeforces":
                codeforces_rating = metric.rating or 0
                break

        # ======================
        # Achievements
        # ======================

        achievement_count = len(user.achievements)

        # ======================
        # Unified Score
        # ======================

        score = (
            lcs +
            codeforces_rating +
            (github_repos * 2) +
            (achievement_count * 50)
        )

        leaderboard.append({
            "user_id": user.id,
            "name": user.name,
            "score": score
        })

    # ======================
    # Sort by score
    # ======================

    leaderboard.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # ======================
    # Assign ranks
    # ======================

    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1

    return {
        "leaderboard": leaderboard
    }
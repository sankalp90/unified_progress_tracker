from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User

router = APIRouter()


@router.get("/{user_id}")
async def get_dashboard_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ======================
    # Coding Stats
    # ======================

    total_solved = 0
    total_easy = 0
    total_medium = 0
    total_hard = 0

    for stat in user.stats:
        total_solved += stat.solved
        total_easy += stat.easy
        total_medium += stat.medium
        total_hard += stat.hard

    lcs = (
        total_easy +
        (3 * total_medium) +
        (7 * total_hard)
    )

    # ======================
    # Profiles
    # ======================

    profiles = [
        {
            "platform": profile.platform,
            "username": profile.username,
            "verified": profile.verified
        }
        for profile in user.profiles
    ]

    # ======================
    # Github
    # ======================

    github_data = None
    github_repos = 0

    if user.github_stats:

        github = user.github_stats[0]

        github_data = {
            "username": github.username,
            "repos": github.public_repos,
            "followers": github.followers,
            "following": github.following
        }

        github_repos = github.public_repos

    # ======================
    # Codeforces
    # ======================

    cf_data = None
    codeforces_rating = 0

    for metric in user.platform_metrics:

        if metric.platform == "codeforces":

            cf_data = {
                "rating": metric.rating,
                "max_rating": metric.max_rating,
                "rank": metric.rank,
                "max_rank": metric.max_rank
            }

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

    # ======================
    # Response
    # ======================

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        },

        "profiles": profiles,

        "coding_stats": {
            "solved": total_solved,
            "easy": total_easy,
            "medium": total_medium,
            "hard": total_hard,
            "lcs": lcs
        },

        "github": github_data,

        "codeforces": cf_data,

        "achievement_count": achievement_count,

        "score": score
    }
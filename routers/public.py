from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from models import User, ProgressHistory

router = APIRouter()


@router.get("/{username}")
async def get_public_profile(
    username: str,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

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

    achievements = [
        {
            "title": achievement.title,
            "description": achievement.description,
            "platform": achievement.platform,
            "achieved_at": achievement.achieved_at
        }
        for achievement in user.achievements
    ]

    # ======================
    # Progress History
    # ======================

    history_rows = (
        db.query(ProgressHistory)
        .filter(
            ProgressHistory.user_id == user.id,
            ProgressHistory.total_activity > 0
        )
        .order_by(ProgressHistory.date.asc())
        .all()
    )

    # ----------------------
    # Longest Streak
    # ----------------------

    longest_streak = 0
    current_run = 0
    previous_date = None

    for row in history_rows:

        if previous_date is None:
            current_run = 1

        elif row.date == previous_date + timedelta(days=1):
            current_run += 1

        else:
            current_run = 1

        longest_streak = max(
            longest_streak,
            current_run
        )

        previous_date = row.date

    # ----------------------
    # Current Streak
    # ----------------------

    current_streak = 0

    if history_rows:

        active_dates = {
            row.date
            for row in history_rows
        }

        check_date = date.today()

        while check_date in active_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

    # ----------------------
    # Heatmap
    # ----------------------

    heatmap = [
        {
            "date": str(row.date),
            "count": row.total_activity
        }
        for row in history_rows
    ]

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
    # Public Response
    # ======================

    return {
        "profile_url": f"/public/{user.username}",

        "user": {
            "name": user.name,
            "username": user.username
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

        "achievements": achievements,

        "streaks": {
            "current_streak": current_streak,
            "longest_streak": longest_streak
        },

        "heatmap": heatmap,

        "score": score
    }
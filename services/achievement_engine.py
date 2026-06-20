from datetime import date, datetime, timedelta
from models import Achievement,CodingStats,GithubStats, PlatformMetrics, ProgressHistory


def award_achievement(
    db,
    user_id,
    title,
    description,
    platform = "system"
):
    existing = (
        db.query(Achievement)
        .filter(
            Achievement.user_id == user_id,
            Achievement.title == title
        )
        .first()
    )

    if existing:
        return

    db.add(
        Achievement(
            user_id=user_id,
            title=title,
            description=description,
            platform=platform,
            achievement_type="auto",
            verified=True,
            achieved_at=datetime.utcnow()
        )
    )


def check_achievements(
    db,
    user_id
):

    # ======================
    # Problem Solving
    # ======================

    total_solved = 0

    stats = (
        db.query(CodingStats)
        .filter(
            CodingStats.user_id == user_id
        )
        .all()
    )

    for stat in stats:
        total_solved += stat.solved

    if total_solved >= 10:
        award_achievement(
            db,
            user_id,
            "Problem Solver I",
            "Solved 10 problems"
        )

    if total_solved >= 50:
        award_achievement(
            db,
            user_id,
            "Problem Solver II",
            "Solved 50 problems"
        )

    if total_solved >= 100:
        award_achievement(
            db,
            user_id,
            "Problem Solver III",
            "Solved 100 problems"
        )

    if total_solved >= 500:
        award_achievement(
            db,
            user_id,
            "Coding Master",
            "Solved 500 problems"
        )

    # ======================
    # Codeforces
    # ======================

    cf = (
        db.query(PlatformMetrics)
        .filter(
            PlatformMetrics.user_id == user_id,
            PlatformMetrics.platform == "codeforces"
        )
        .first()
    )

    if cf and cf.rating >= 1200:
        award_achievement(
            db,
            user_id,
            "Codeforces Pupil",
            "Reached 1200 rating"
        )

    if cf and cf.rating >= 1400:
        award_achievement(
            db,
            user_id,
            "Codeforces Specialist",
            "Reached 1400 rating"
        )

    if cf and cf.rating >= 1600:
        award_achievement(
            db,
            user_id,
            "Codeforces Expert",
            "Reached 1600 rating"
        )

    # ======================
    # Github
    # ======================

    github = (
        db.query(GithubStats)
        .filter(
            GithubStats.user_id == user_id
        )
        .first()
    )

    if github and github.public_repos >= 10:
        award_achievement(
            db,
            user_id,
            "Open Source Starter",
            "Created 10 repositories"
        )

    if github and github.public_repos >= 50:
        award_achievement(
            db,
            user_id,
            "Open Source Builder",
            "Created 50 repositories"
        )

    # ======================
    # Streaks
    # ======================

    rows = (
        db.query(ProgressHistory)
        .filter(
            ProgressHistory.user_id == user_id,
            ProgressHistory.streak_active == True
        )
        .all()
    )

    current_streak = 0

    if rows:

        active_dates = {
            row.date
            for row in rows
        }

        latest_date = max(active_dates)

        cursor = latest_date

        while cursor in active_dates:
            current_streak += 1
            cursor -= timedelta(days=1)

    if current_streak >= 7:
        award_achievement(
            db,
            user_id,
            "Consistent Learner",
            "7 day streak"
        )

    if current_streak >= 30:
        award_achievement(
            db,
            user_id,
            "Dedication",
            "30 day streak"
        )

    if current_streak >= 100:
        award_achievement(
            db,
            user_id,
            "Unstoppable",
            "100 day streak"
        )

    db.commit()
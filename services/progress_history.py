from models import ProgressHistory

def update_progress_history(
    db,
    user_id,
    date,
    platform,
    count
):
    row = (
        db.query(ProgressHistory)
        .filter(
            ProgressHistory.user_id == user_id,
            ProgressHistory.date == date
        )
        .first()
    )

    if not row:
        row = ProgressHistory(
            user_id=user_id,
            date=date,
            leetcode_count=0,
            codeforces_count=0,
            github_count=0,
            total_activity=0,
            streak_active=False
        )
        db.add(row)

    if platform == "leetcode":
        row.leetcode_count = count

    elif platform == "codeforces":
        row.codeforces_count = count

    elif platform == "github":
        row.github_count = count

    row.total_activity = (
        (row.leetcode_count or 0) +
        (row.codeforces_count or 0) +
        (row.github_count or 0)
    )

    row.streak_active = row.total_activity > 0

    return row
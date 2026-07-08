from fastapi import APIRouter,HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from services.leetcode import get_leetcode_stats,get_leetcode_submission_history
from models import User, CodingStats, PlatformMetrics,GithubStats,PlatformProfile,LeetCodeHistory,CodeforcesHistory,GithubHistory,ProgressHistory
from services.codeforces import get_codeforces_stats, get_codeforces_solved,get_codeforces_submission_history
from services.github import get_github_stats,get_github_contribution_history
from schemas import (
    GithubStatsResponse,
    CodingStatsResponse,
    LeetCodeHistoryResponse,
    CodeforcesHistoryResponse,
    GithubHistoryResponse,
    SyncResponse,
)
from datetime import datetime
from services.progress_history import update_progress_history
from services.achievement_engine import check_achievements

router = APIRouter()


@router.post("/leetcode/{user_id}", response_model=CodingStatsResponse)
async def sync_leetcode(user_id: int,username: str,db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    stats = get_leetcode_stats(username)

    if not stats:
        raise HTTPException(
            status_code=404,
            detail="LeetCode user not found"
        )

    existing = db.query(CodingStats).filter(
        CodingStats.user_id == user_id,
        CodingStats.platform == "leetcode"
    ).first()

    if existing:
        existing.solved = stats["solved"]
        existing.easy = stats["easy"]
        existing.medium = stats["medium"]
        existing.hard = stats["hard"]

        db.commit()
        db.refresh(existing)

        return existing

    new_stats = CodingStats(
        platform="leetcode",
        solved=stats["solved"],
        easy=stats["easy"],
        medium=stats["medium"],
        hard=stats["hard"],
        user_id=user_id
    )

    db.add(new_stats)
    db.commit()
    db.refresh(new_stats)

    return new_stats


@router.get("/leetcode/history/{user_id}", response_model=LeetCodeHistoryResponse)
async def get_leetcode_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = (
        db.query(PlatformProfile)
        .filter(
            PlatformProfile.user_id == user_id,
            PlatformProfile.platform == "leetcode"
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Leetcode profile not found"
        )

    history = get_leetcode_submission_history(
        profile.username
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Unable to fetch Leetcode history"
        )

    saved_rows = []

    for item in history:

        date_obj = datetime.strptime(
            item["date"],
            "%Y-%m-%d"
        ).date()

        row = (
            db.query(LeetCodeHistory)
            .filter(
                LeetCodeHistory.user_id == user_id,
                LeetCodeHistory.date == date_obj
            )
            .first()
        )

        if row:

            row.solved_count = item["submissions"]

        else:

            row = LeetCodeHistory(
                user_id=user_id,
                date=date_obj,
                solved_count=item["submissions"]
            )

            db.add(row)

        update_progress_history(
            db=db,
            user_id=user_id,
            date=date_obj,
            platform="leetcode",
            count=item["submissions"]
        )

        saved_rows.append({
            "date": item["date"],
            "submissions": item["submissions"]
        })

    db.commit()

    return {
        "user_id": user_id,
        "username": profile.username,
        "records_saved": len(saved_rows),
        "history": saved_rows
    }

#codeforces

@router.post("/codeforces/{user_id}", response_model=CodingStatsResponse)
async def sync_codeforces(
    user_id: int,
    handle: str,
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

    stats = get_codeforces_stats(handle)

    if not stats:
        raise HTTPException(
            status_code=404,
            detail="Codeforces user not found"
        )
    
    existing_profile = db.query(
        PlatformProfile
    ).filter(
        PlatformProfile.user_id == user_id,
        PlatformProfile.platform == "codeforces"
    ).first()

    if existing_profile:

        existing_profile.username = handle
        existing_profile.verified = True

    else:

        new_profile = PlatformProfile(
            platform="codeforces",
            username=handle,
            verified=True,
            user_id=user_id
        )

        db.add(new_profile)

    db.commit()

    solved_count = get_codeforces_solved(handle)

    existing_metrics = db.query(PlatformMetrics).filter(
        PlatformMetrics.user_id == user_id,
        PlatformMetrics.platform == "codeforces"
    ).first()

    if existing_metrics:

        existing_metrics.rating = stats["rating"]
        existing_metrics.max_rating = stats["max_rating"]
        existing_metrics.rank = stats["rank"]
        existing_metrics.max_rank = stats["max_rank"]

        db.commit()
        db.refresh(existing_metrics)

    else:

        new_metrics = PlatformMetrics(
            platform="codeforces",
            rating=stats["rating"],
            max_rating=stats["max_rating"],
            rank=stats["rank"],
            max_rank=stats["max_rank"],
            user_id=user_id
        )

        db.add(new_metrics)
        db.commit()

    existing_stats = db.query(CodingStats).filter(
        CodingStats.user_id == user_id,
        CodingStats.platform == "codeforces"
    ).first()

    if existing_stats:

        existing_stats.solved = solved_count

        db.commit()
        db.refresh(existing_stats)

        return existing_stats

    else:

        new_stats = CodingStats(
            platform="codeforces",
            solved=solved_count,
            easy=0,
            medium=0,
            hard=0,
            user_id=user_id
        )

        db.add(new_stats)
        db.commit()
        db.refresh(new_stats)

        return new_stats
    
    
from models import (
    PlatformProfile,
    CodeforcesHistory
)


@router.get("/codeforces/history/{user_id}", response_model=CodeforcesHistoryResponse)
async def get_codeforces_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = (
        db.query(PlatformProfile)
        .filter(
            PlatformProfile.user_id == user_id,
            PlatformProfile.platform == "codeforces"
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Codeforces profile not found"
        )

    history = get_codeforces_submission_history(
        profile.username
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Unable to fetch Codeforces history"
        )

    for item in history:

        activity_date = datetime.strptime(
            item["date"],
            "%Y-%m-%d"
        ).date()

        row = (
            db.query(CodeforcesHistory)
            .filter(
                CodeforcesHistory.user_id == user_id,
                CodeforcesHistory.date == activity_date
            )
            .first()
        )

        if row:
            row.solved_count = item["submissions"]

        else:
            row = CodeforcesHistory(
                user_id=user_id,
                date=activity_date,
                solved_count=item["submissions"]
            )
            db.add(row)

        update_progress_history(
            db=db,
            user_id=user_id,
            date=activity_date,
            platform="codeforces",
            count=item["submissions"]
        )

    db.commit()

    return {
        "user_id": user_id,
        "handle": profile.username,
        "history": history
    }


#github
@router.post("/github/{user_id}",response_model=GithubStatsResponse)
async def sync_github(user_id: int, username: str, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    github_data = get_github_stats(username)

    if not github_data:
        raise HTTPException(status_code=404, detail="Github user not found")

    existing = db.query(GithubStats).filter(
        GithubStats.user_id == user_id
    ).first()

    if existing:
        
        existing.username = username
        existing.public_repos = github_data["public_repos"]
        existing.followers = github_data["followers"]
        existing.following = github_data["following"]

        db.commit()
        db.refresh(existing)

        return existing

    new_stats = GithubStats(
        username=username,
        platform="github",
        public_repos=github_data["public_repos"],
        followers=github_data["followers"],
        following=github_data["following"],
        user_id=user_id
    )

    db.add(new_stats)
    db.commit()
    db.refresh(new_stats)

    return new_stats

from models import (
    PlatformProfile,
    GithubHistory
)


@router.get("/github/history/{user_id}", response_model=GithubHistoryResponse)
async def get_github_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    profile = (
        db.query(PlatformProfile)
        .filter(
            PlatformProfile.user_id == user_id,
            PlatformProfile.platform == "github"
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Github profile not found"
        )

    history = get_github_contribution_history(
        profile.username
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Unable to fetch Github history"
        )

    for date_str, contribution_count in history.items():

        date_obj = datetime.strptime(
            date_str,
            "%Y-%m-%d"
        ).date()

        row = (
            db.query(GithubHistory)
            .filter(
                GithubHistory.user_id == user_id,
                GithubHistory.date == date_obj
            )
            .first()
        )

        if row:
            row.contribution_count = contribution_count

        else:
            row = GithubHistory(
                user_id=user_id,
                date=date_obj,
                contribution_count=contribution_count
            )
            db.add(row)

        update_progress_history(
            db=db,
            user_id=user_id,
            date=date_obj,
            platform="github",
            count=contribution_count
        )

    db.commit()

    return {
        "user_id": user_id,
        "username": profile.username,
        "history": history
    }





#sync all
@router.post("/all/{user_id}", response_model=SyncResponse)
async def sync_all(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    profiles = (
        db.query(PlatformProfile)
        .filter(
            PlatformProfile.user_id == user_id
        )
        .all()
    )

    if not profiles:
        raise HTTPException(
            status_code=404,
            detail="No platform profiles found"
        )

    synced = []
    failed = []

    for profile in profiles:

        platform = profile.platform.lower()
        username = profile.username

        try:

            # leetcode
            if platform == "leetcode":

                stats = get_leetcode_stats(username)

                if not stats:
                    raise Exception(
                        "Unable to fetch LeetCode stats"
                    )

                existing = (
                    db.query(CodingStats)
                    .filter(
                        CodingStats.user_id == user_id,
                        CodingStats.platform == "leetcode"
                    )
                    .first()
                )

                if existing:

                    existing.solved = stats["solved"]
                    existing.easy = stats["easy"]
                    existing.medium = stats["medium"]
                    existing.hard = stats["hard"]

                else:

                    db.add(
                        CodingStats(
                            platform="leetcode",
                            solved=stats["solved"],
                            easy=stats["easy"],
                            medium=stats["medium"],
                            hard=stats["hard"],
                            user_id=user_id
                        )
                    )

                db.commit()
                synced.append("leetcode")

            # codeforces
            elif platform == "codeforces":

                cf_stats = get_codeforces_stats(
                    username
                )

                if not cf_stats:
                    raise Exception(
                        "Unable to fetch Codeforces stats"
                    )

                solved_count = get_codeforces_solved(
                    username
                )

                existing_stats = (
                    db.query(CodingStats)
                    .filter(
                        CodingStats.user_id == user_id,
                        CodingStats.platform == "codeforces"
                    )
                    .first()
                )

                if existing_stats:

                    existing_stats.solved = solved_count

                else:

                    db.add(
                        CodingStats(
                            platform="codeforces",
                            solved=solved_count,
                            user_id=user_id
                        )
                    )

                existing_metrics = (
                    db.query(PlatformMetrics)
                    .filter(
                        PlatformMetrics.user_id == user_id,
                        PlatformMetrics.platform == "codeforces"
                    )
                    .first()
                )

                if existing_metrics:

                    existing_metrics.rating = cf_stats["rating"]
                    existing_metrics.max_rating = cf_stats["max_rating"]
                    existing_metrics.rank = cf_stats["rank"]
                    existing_metrics.max_rank = cf_stats["max_rank"]

                else:

                    db.add(
                        PlatformMetrics(
                            platform="codeforces",
                            rating=cf_stats["rating"],
                            max_rating=cf_stats["max_rating"],
                            rank=cf_stats["rank"],
                            max_rank=cf_stats["max_rank"],
                            user_id=user_id
                        )
                    )

                db.commit()
                synced.append("codeforces")

            # github
            elif platform == "github":

                gh_stats = get_github_stats(
                    username
                )

                if not gh_stats:
                    raise Exception(
                        "Unable to fetch Github stats"
                    )

                existing = (
                    db.query(GithubStats)
                    .filter(
                        GithubStats.user_id == user_id
                    )
                    .first()
                )

                if existing:

                    existing.username = username
                    existing.public_repos = gh_stats["public_repos"]
                    existing.followers = gh_stats["followers"]
                    existing.following = gh_stats["following"]

                else:

                    db.add(
                        GithubStats(
                            username=username,
                            platform="github",
                            public_repos=gh_stats["public_repos"],
                            followers=gh_stats["followers"],
                            following=gh_stats["following"],
                            user_id=user_id
                        )
                    )

                db.commit()
                synced.append("github")

        except Exception as e:

            db.rollback()

            failed.append({
                "platform": platform,
                "error": str(e)
            })

    return {
        "message": "Sync completed",
        "platforms_synced": synced,
        "failed": failed
    }


@router.post("/history/{user_id}", response_model=SyncResponse)
async def sync_all_history(
    user_id: int,
    db: Session = Depends(get_db)
):

    profiles = (
        db.query(PlatformProfile)
        .filter(
            PlatformProfile.user_id == user_id
        )
        .all()
    )

    if not profiles:
        raise HTTPException(
            status_code=404,
            detail="No platform profiles found"
        )

    synced = []
    failed = []

    for profile in profiles:

        platform = profile.platform.lower()

        try:

            # leetcode
            if platform == "leetcode":

                history = (
                    get_leetcode_submission_history(
                        profile.username
                    )
                )

                if not history:
                    raise Exception(
                        "Unable to fetch LeetCode history"
                    )

                for item in history:

                    sync_date = datetime.strptime(
                        item["date"],
                        "%Y-%m-%d"
                    ).date()

                    row = (
                        db.query(LeetCodeHistory)
                        .filter(
                            LeetCodeHistory.user_id == user_id,
                            LeetCodeHistory.date == sync_date
                        )
                        .first()
                    )

                    if row:
                        row.solved_count = item["submissions"]

                    else:
                        db.add(
                            LeetCodeHistory(
                                user_id=user_id,
                                date=sync_date,
                                solved_count=item["submissions"]
                            )
                        )

                    update_progress_history(
                        db=db,
                        user_id=user_id,
                        date=sync_date,
                        platform="leetcode",
                        count=item["submissions"]
                    )

                db.commit()
                synced.append("leetcode")

            # codeforces
            elif platform == "codeforces":

                history = (
                    get_codeforces_submission_history(
                        profile.username
                    )
                )

                if not history:
                    raise Exception(
                        "Unable to fetch Codeforces history"
                    )

                for item in history:

                    sync_date = datetime.strptime(
                        item["date"],
                        "%Y-%m-%d"
                    ).date()

                    row = (
                        db.query(CodeforcesHistory)
                        .filter(
                            CodeforcesHistory.user_id == user_id,
                            CodeforcesHistory.date == sync_date
                        )
                        .first()
                    )

                    if row:
                        row.solved_count = item["submissions"]

                    else:
                        db.add(
                            CodeforcesHistory(
                                user_id=user_id,
                                date=sync_date,
                                solved_count=item["submissions"]
                            )
                        )

                    update_progress_history(
                        db=db,
                        user_id=user_id,
                        date=sync_date,
                        platform="codeforces",
                        count=item["submissions"]
                    )

                db.commit()
                synced.append("codeforces")

            # github
            elif platform == "github":

                history = (
                    get_github_contribution_history(
                        profile.username
                    )
                )

                if not history:
                    raise Exception(
                        "Unable to fetch Github history"
                    )

                for date_str, contribution_count in history.items():

                    sync_date = datetime.strptime(
                        date_str,
                        "%Y-%m-%d"
                    ).date()

                    row = (
                        db.query(GithubHistory)
                        .filter(
                            GithubHistory.user_id == user_id,
                            GithubHistory.date == sync_date
                        )
                        .first()
                    )

                    if row:
                        row.contribution_count = contribution_count

                    else:
                        db.add(
                            GithubHistory(
                                user_id=user_id,
                                date=sync_date,
                                contribution_count=contribution_count
                            )
                        )

                    update_progress_history(
                        db=db,
                        user_id=user_id,
                        date=sync_date,
                        platform="github",
                        count=contribution_count
                    )

                db.commit()
                synced.append("github")

        except Exception as e:

            db.rollback()

            failed.append({
                "platform": platform,
                "error": str(e)
            })

    check_achievements(db,user_id)
    db.commit()
    
    return {
        "message": "History sync completed",
        "platforms_synced": synced,
        "failed": failed
    }
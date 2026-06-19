from fastapi import APIRouter,HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from services.leetcode import get_leetcode_stats
from models import User, CodingStats, PlatformMetrics,GithubStats,PlatformProfile
from services.codeforces import get_codeforces_stats, get_codeforces_solved
from services.github import get_github_stats
from schemas import GithubStatsResponse


router = APIRouter()


@router.post("/leetcode/{user_id}")
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



#codeforces

@router.post("/codeforces/{user_id}")
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



#sync all
@router.post("/all/{user_id}")
async def sync_all(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    profiles = db.query(
        PlatformProfile
    ).filter(
        PlatformProfile.user_id == user_id
    ).all()

    if not profiles:
        raise HTTPException(
            status_code=404,
            detail="No platform profiles found"
        )

    synced = []

    for profile in profiles:

        platform = profile.platform.lower()
        username = profile.username

#leetcode

        if platform == "leetcode":

            stats = get_leetcode_stats(username)

            if stats:

                existing = db.query(
                    CodingStats
                ).filter(
                    CodingStats.user_id == user_id,
                    CodingStats.platform == "leetcode"
                ).first()

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

                synced.append("leetcode")

#codeforces

        elif platform == "codeforces":

            cf_stats = get_codeforces_stats(username)

            if cf_stats:

                solved_count = get_codeforces_solved(username)

                existing_stats = db.query(
                    CodingStats
                ).filter(
                    CodingStats.user_id == user_id,
                    CodingStats.platform == "codeforces"
                ).first()

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

                existing_metrics = db.query(
                    PlatformMetrics
                ).filter(
                    PlatformMetrics.user_id == user_id,
                    PlatformMetrics.platform == "codeforces"
                ).first()

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

                synced.append("codeforces")

#github
        elif platform == "github":

            gh_stats = get_github_stats(username)

            if gh_stats:

                existing = db.query(
                    GithubStats
                ).filter(
                    GithubStats.user_id == user_id
                ).first()

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

                synced.append("github")

    db.commit()

    return {
        "message": "Sync completed",
        "platforms_synced": synced
    }
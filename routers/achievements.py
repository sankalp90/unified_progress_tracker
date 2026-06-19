from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Achievement, User
from schemas import AchievementCreate,AchievementUpdate,AchievementResponse

router = APIRouter()


@router.post("/", response_model=AchievementResponse)
async def create_achievement(achievement: AchievementCreate,db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == achievement.user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    new_achievement = Achievement(
        title=achievement.title,
        description=achievement.description,
        platform=achievement.platform,
        achievement_type=achievement.achievement_type,
        badge_url=achievement.badge_url,
        verified=achievement.verified,
        achieved_at=achievement.achieved_at,
        user_id=achievement.user_id
    )

    db.add(new_achievement)
    db.commit()
    db.refresh(new_achievement)

    return new_achievement

@router.get("/", response_model=list[AchievementResponse])
async def get_achievements(db: Session = Depends(get_db)):
    return db.query(Achievement).all()

@router.get("/{achievement_id}",response_model=AchievementResponse)
async def get_achievement(achievement_id: int,db: Session = Depends(get_db)):

    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id
    ).first()

    if not achievement:
        raise HTTPException(status_code=404,detail="Achievement not found")

    return achievement

@router.put("/{achievement_id}",response_model=AchievementResponse)
async def update_achievement(achievement_id: int,updated_achievement: AchievementUpdate,db: Session = Depends(get_db)):
    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id
    ).first()

    if not achievement:
        raise HTTPException(status_code=404,detail="Achievement not found")

    achievement.title = updated_achievement.title
    achievement.description = updated_achievement.description
    achievement.platform = updated_achievement.platform
    achievement.achievement_type = (updated_achievement.achievement_type)
    achievement.badge_url = updated_achievement.badge_url
    achievement.verified = updated_achievement.verified
    achievement.achieved_at = updated_achievement.achieved_at

    db.commit()
    db.refresh(achievement)

    return achievement

@router.delete("/{achievement_id}")
async def delete_achievement(achievement_id: int,db: Session = Depends(get_db)):
    achievement = db.query(Achievement).filter(
        Achievement.id == achievement_id
    ).first()

    if not achievement:
        raise HTTPException(status_code=404,detail="Achievement not found")

    db.delete(achievement)
    db.commit()

    return {"message": "Achievement deleted successfully"}

@router.get("/user/{user_id}",response_model=list[AchievementResponse])
async def get_user_achievements(user_id: int,db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user.achievements
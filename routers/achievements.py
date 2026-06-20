from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Achievement, User
from schemas import AchievementCreate,AchievementUpdate,AchievementResponse

router = APIRouter()


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


@router.get("/user/{user_id}",response_model=list[AchievementResponse])
async def get_user_achievements(user_id: int,db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user.achievements
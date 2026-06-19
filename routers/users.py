from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserResponse, UserUpdate,PlatformProfileResponse,CodingStatsResponse,PlatformSummary,AchievementResponse

router = APIRouter()


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate,db: Session = Depends(get_db)):

    new_user = User(name=user.name,email=user.email)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@router.get("/{user_id}",response_model=UserResponse)
def get_user(user_id: int,db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    updated_user: UserUpdate,
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

    user.name = updated_user.name
    user.email = updated_user.email

    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}")
def delete_user(
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

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }


@router.get("/{user_id}/profiles",response_model=list[PlatformProfileResponse])
async def get_profiles_by_id(user_id: int,db: Session = Depends(get_db)):
    
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")

    return user.profiles


@router.get("/{user_id}/stats",response_model=list[CodingStatsResponse])
async def get_stats_by_id(user_id: int,db: Session = Depends(get_db)):
    #stats by coding stats table
    #user_stats = db.query(CodingStats).filter(
    #    CodingStats.user.id == user_id
    #).all()
    #return user_stats

    #stats by user table using relationship which we created    
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    
    return user.stats



@router.get("/{user_id}/platforms",response_model=list[PlatformSummary])
async def total_solved_by_platform(user_id,db:Session=Depends(get_db)):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    
    result = []

    for stat in user.stats:
        result.append({
            "platform": stat.platform,
            "solved": stat.solved
        })

    return result  


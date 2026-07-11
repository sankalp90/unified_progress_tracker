from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import hashlib

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse, UserUpdate,PlatformProfileResponse,CodingStatsResponse,PlatformSummary,AchievementResponse,MessageResponse

router = APIRouter()


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    new_user = User(
        name=user.name,
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=UserResponse)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.username == credentials.username)
        .first()
    )

    if not user or user.password != hash_password(credentials.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return user

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/username/{username}", response_model=UserResponse)
def get_user_by_username(
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

    return user


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

    existing = (
        db.query(User)
        .filter(
            User.username == updated_user.username,
            User.id != user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user.name = updated_user.name
    user.username = updated_user.username
    user.email = updated_user.email

    db.commit()
    db.refresh(user)

    return user

@router.delete("/{user_id}", response_model=MessageResponse)
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

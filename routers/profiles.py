from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User,PlatformProfile
from schemas import PlatformProfileCreate, PlatformProfileResponse, PlatformProfileUpdate

router = APIRouter()



@router.post("/",response_model=PlatformProfileResponse)
async def link_profiles(profile:PlatformProfileCreate,db:Session=Depends(get_db)):
    new_profile = PlatformProfile(
        platform = profile.platform,
        user_id = profile.user_id,
        username = profile.username,
        verified =  profile.verified
    )

    user = db.query(User).filter(
        User.id == profile.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile

@router.get("/",response_model=list[PlatformProfileResponse])
async def get_profiles(db: Session = Depends(get_db)):
    profiles = db.query(PlatformProfile).all()

    return profiles

@router.get("/{profile_id}",response_model=PlatformProfileResponse)
async def get_profiles_by_id(profile_id:int,db: Session = Depends(get_db)):
    profile = db.query(PlatformProfile).filter(
        PlatformProfile.id == profile_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404,detail="User not found")

    return profile

@router.put("/{profile_id}",response_model = PlatformProfileResponse)
async def update_profiles(profile_id:int,updated_profile: PlatformProfileUpdate,db:Session=Depends(get_db)):
    
    profile = db.query(PlatformProfile).filter(
        PlatformProfile.id == profile_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404,detail="User not found")

    profile.platform = updated_profile.platform
    profile.username = updated_profile.username
    profile.verified = updated_profile.verified

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/filter",response_model=list[PlatformProfileResponse])
async def get_profiles_by_platform(platform: str, db: Session = Depends(get_db)):
    
    profiles = db.query(PlatformProfile).filter(
        PlatformProfile.platform == platform
    ).all()

    return profiles

@router.delete("/{profile_id}")
async def delete_profile(profile_id:int,db:Session=Depends(get_db)):
    profile = db.query(PlatformProfile).filter(
        PlatformProfile.id == profile_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail = "Profile not found")
    
    db.delete(profile)
    db.commit()

    return {"message" : "Profile deleted successfully"}
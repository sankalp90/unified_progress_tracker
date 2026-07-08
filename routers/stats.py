from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import CodingStats
from schemas import CodingStatsCreate,CodingStatsResponse,CodingStatsUpdate,MessageResponse

router = APIRouter()




@router.post("/",response_model=CodingStatsResponse)
async def add_stats(stats:CodingStatsCreate,db: Session = Depends(get_db)):

    new_stats = CodingStats(
        platform = stats.platform,
        solved = stats.solved,
        easy = stats.easy,
        medium = stats.medium,
        hard = stats.hard,
        user_id = stats.user_id
    )

    db.add(new_stats)
    db.commit()
    db.refresh(new_stats)

    return new_stats

@router.get("/",response_model=list[CodingStatsResponse])
async def get_stats(db:Session = Depends(get_db)):
    stats = db.query(CodingStats).all()
    return stats

@router.get("/{stats_id}",response_model=CodingStatsUpdate)
async def get_stat_by_id(stats_id:int,db:Session=Depends(get_db)):
    stats = db.query(CodingStats).filter(
        CodingStats.id == stats_id
    ).first()

    if not stats:
        raise HTTPException(status_code=404,detail = "stats not found")
    
    return stats

@router.put("/{stats_id}",response_model=CodingStatsResponse)
async def Update_Stats(stats_id:int,updated_stats : CodingStatsUpdate, db:Session=Depends(get_db)):
    stats = db.query(CodingStats).filter(
        CodingStats.id == stats_id
    ).first()


    if not stats:
        raise HTTPException(status_code=404,detail = "stats not found")
    
    stats.platform = updated_stats.platform
    stats.solved = updated_stats.solved
    stats.easy = updated_stats.easy
    stats.medium = updated_stats.medium
    stats.hard = updated_stats.hard

    db.commit()
    db.refresh(stats)

    return stats

@router.delete("/stats_id", response_model=MessageResponse)
async def delete_stats(stats_id:int,db:Session=Depends(get_db)):
    stat = db.query(CodingStats).filter(
        CodingStats.id == stats_id
    ).first()

    if not stat:
        raise HTTPException(status_code=404,detail="stats not found")

    db.delete(stat)
    db.commit()

    return {"message" : "stats deleted successfully"}
from fastapi import FastAPI
from models import Base
from database import engine
from routers import achievements, users,profiles,stats,dashboard
from routers import sync,leaderboard,public


Base.metadata.create_all(bind=engine)
app = FastAPI()

app.include_router(
    sync.router,
    prefix="/sync",
    tags=["Sync"]
)

app.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
    )

app.include_router(
    profiles.router,
    prefix= "/profiles",
    tags=["Profiles"]
)

app.include_router(
    stats.router,
    prefix= "/stats",
    tags=["stats"]
)

app.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

app.include_router(
    leaderboard.router,
    prefix="/leaderboard",
    tags=["leaderboard"]
)

app.include_router(
    achievements.router,
    prefix="/achievements",
    tags=["achievements"]
)

app.include_router(
    public.router,
    prefix="/public",
    tags=["public"]
)

@app.get("/")
def root():
    return {
        "message": "Unified Progress Tracker"
    }

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from models import Base
from database import engine
from routers import achievements, users,profiles,stats,dashboard
from routers import sync,leaderboard,public
from schemas import MessageResponse


Base.metadata.create_all(bind=engine)

with engine.begin() as connection:
    columns = {column["name"] for column in inspect(connection).get_columns("users")}
    if "password" not in columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR"))

app = FastAPI(title="Unified Progress Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")

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
    index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {"message": "Unified Progress Tracker"}


if os.path.isdir(FRONTEND_DIR):
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index = os.path.join(FRONTEND_DIR, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
        return {"message": "Unified Progress Tracker"}

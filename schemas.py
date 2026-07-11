from pydantic import BaseModel,EmailStr
from datetime import datetime


class User(BaseModel):
    id: int
    name: str
    username: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: EmailStr

    model_config = {
        "from_attributes": True
    }

class UserCreate(BaseModel):
    name : str
    username: str
    email : EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    name: str
    username: str
    email: EmailStr

class PlatformProfile(BaseModel):
    id : int
    platform: str
    user_id: int
    username: str
    verified: bool

class PlatformProfileCreate(BaseModel):
    platform: str
    user_id: int
    username: str
    verified: bool = False

class PlatformProfileUpdate(BaseModel):
    platform: str
    username: str
    verified: bool = False

class PlatformProfileResponse(BaseModel):
    id: int
    platform: str
    user_id: int
    username: str
    verified: bool

    model_config = {
        "from_attributes": True
    }

class PlatformSummary(BaseModel):
    platform: str
    solved: int

    model_config = {
        "from_attributes": True
    }

class CodingStatsCreate(BaseModel):
    platform: str
    solved: int
    easy: int
    medium: int
    hard: int
    user_id : int

class CodingStatsResponse(BaseModel):
    id: int
    platform: str
    solved: int
    easy: int
    medium: int
    hard: int

    model_config = {
        "from_attributes": True
    }

class CodingStatsUpdate(BaseModel):
    platform: str
    solved: int
    easy: int
    medium: int
    hard: int



class AchievementBase(BaseModel):
    title: str
    description: str
    platform: str
    achievement_type: str
    badge_url: str | None = None
    verified: bool = False


class AchievementCreate(AchievementBase):
    user_id: int
    achieved_at: datetime


class AchievementUpdate(BaseModel):
    title: str
    description: str
    platform: str
    achievement_type: str
    badge_url: str | None = None
    verified: bool
    achieved_at: datetime


class AchievementResponse(AchievementBase):
    id: int
    user_id: int
    achieved_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserAchievementsResponse(BaseModel):
    achievements: list[AchievementResponse]

class GithubStatsResponse(BaseModel):
    id: int
    username: str
    public_repos: int
    followers: int
    following: int
    user_id: int

    model_config = {
        "from_attributes": True
    }


class MessageResponse(BaseModel):
    message: str


class HistoryEntry(BaseModel):
    date: str
    submissions: int


class LeetCodeHistoryResponse(BaseModel):
    user_id: int
    username: str
    records_saved: int
    history: list[HistoryEntry]


class CodeforcesHistoryResponse(BaseModel):
    user_id: int
    handle: str
    history: list[HistoryEntry]


class GithubHistoryResponse(BaseModel):
    user_id: int
    username: str
    history: dict[str, int]


class SyncFailedEntry(BaseModel):
    platform: str
    error: str


class SyncResponse(BaseModel):
    message: str
    platforms_synced: list[str]
    failed: list[SyncFailedEntry]


class DashboardUser(BaseModel):
    id: int
    name: str
    email: EmailStr


class DashboardProfile(BaseModel):
    platform: str
    username: str
    verified: bool


class DashboardCodingStats(BaseModel):
    solved: int
    easy: int
    medium: int
    hard: int
    lcs: int


class DashboardGithub(BaseModel):
    username: str
    repos: int
    followers: int
    following: int


class DashboardCodeforces(BaseModel):
    rating: int | None = None
    max_rating: int | None = None
    rank: str | None = None
    max_rank: str | None = None


class DashboardStreaks(BaseModel):
    current_streak: int
    longest_streak: int


class HeatmapEntry(BaseModel):
    date: str
    count: int


class RecentActivityEntry(BaseModel):
    date: str
    leetcode: int
    codeforces: int
    github: int
    total: int


class ProgressStats(BaseModel):
    daily: int
    weekly: int
    monthly: int


class DashboardResponse(BaseModel):
    user: DashboardUser
    profiles: list[DashboardProfile]
    coding_stats: DashboardCodingStats
    github: DashboardGithub | None = None
    codeforces: DashboardCodeforces | None = None
    achievement_count: int
    streaks: DashboardStreaks
    heatmap: list[HeatmapEntry]
    recent_activity: list[RecentActivityEntry]
    score: int
    progress: ProgressStats


class LeaderboardEntry(BaseModel):
    user_id: int
    name: str
    username: str
    score: int
    solved: int
    achievements: int
    codeforces_rating: int
    rank: int


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]


class PublicUser(BaseModel):
    name: str
    username: str


class PublicAchievement(BaseModel):
    title: str
    description: str
    platform: str
    achieved_at: datetime


class PublicProfileResponse(BaseModel):
    profile_url: str
    user: PublicUser
    profiles: list[DashboardProfile]
    coding_stats: DashboardCodingStats
    github: DashboardGithub | None = None
    codeforces: DashboardCodeforces | None = None
    achievement_count: int
    achievements: list[PublicAchievement]
    streaks: DashboardStreaks
    heatmap: list[HeatmapEntry]
    score: int

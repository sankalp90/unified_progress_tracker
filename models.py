from sqlalchemy.orm import DeclarativeBase,relationship
from sqlalchemy import Column, Integer, String, Boolean,ForeignKey,DateTime,UniqueConstraint,Date


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    username = Column(String,unique=True,nullable=False,index=True)
    email = Column(String,unique=True,nullable=False)
    password = Column(String,nullable=True)
    
    profiles = relationship("PlatformProfile",back_populates="user")
    stats = relationship("CodingStats", back_populates="user")
    achievements = relationship("Achievement",back_populates="user")
    github_stats = relationship("GithubStats",back_populates="user")
    platform_metrics = relationship("PlatformMetrics",back_populates="user")
    leetcode_history = relationship("LeetCodeHistory",back_populates="user")
    codeforces_history = relationship("CodeforcesHistory",back_populates="user")
    github_history = relationship("GithubHistory",back_populates="user")
    progress_history = relationship("ProgressHistory",back_populates="user")


class PlatformProfile(Base):
    __tablename__ = "profiles"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "platform",
            name="unique_user_platform"
        ),
    )

    id = Column(Integer,primary_key=True,index=True)
    platform = Column(String,nullable=False)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    username = Column(String)
    verified = Column(Boolean, default = False)
    
    user = relationship("User",back_populates="profiles")

class CodingStats(Base):
    __tablename__ = "coding_stats"

    id = Column(Integer,primary_key=True,index=True)
    platform = Column(String,nullable=False)

    solved = Column(Integer,default=0)
    easy = Column(Integer,default=0)
    medium = Column(Integer,default=0)
    hard = Column(Integer,default=0)

    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    user = relationship("User",back_populates="stats")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String)
    platform = Column(String, nullable=False)

    achievement_type = Column(String)
    badge_url = Column(String)
    external_id = Column(String)
    verified = Column(Boolean, default=False)
    achieved_at = Column(DateTime)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User",back_populates="achievements")


class PlatformMetrics(Base):
    __tablename__ = "platform_metrics"

    id = Column(Integer, primary_key=True)
    platform = Column(String)
    rating = Column(Integer)
    max_rating = Column(Integer)
    rank = Column(String)
    max_rank = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User",back_populates="platform_metrics")


class GithubStats(Base):
    __tablename__ = "github_stats"

    id = Column(Integer, primary_key=True)
    username = Column(String)
    platform = Column(String)
    public_repos = Column(Integer)
    followers = Column(Integer)
    following = Column(Integer)

    user_id = Column(Integer,ForeignKey("users.id"))
    user = relationship("User", back_populates="github_stats")


class LeetCodeHistory(Base):
    __tablename__ = "leetcode_history"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="uq_leetcode_user_date"
        ),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    date = Column(Date)

    solved_count = Column(Integer)

    user = relationship("User",back_populates="leetcode_history")

class CodeforcesHistory(Base):
    __tablename__ = "codeforces_history"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="uq_codeforces_user_date"
        ),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    date = Column(Date)

    solved_count = Column(Integer)

    user = relationship("User",back_populates="codeforces_history")


class GithubHistory(Base):
    __tablename__ = "github_history"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="uq_github_user_date"
        ),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    date = Column(Date)

    contribution_count = Column(Integer)

    user = relationship("User",back_populates="github_history")


class ProgressHistory(Base):
    __tablename__ = "progress_history"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "date",
            name="uq_progresshistory_user_date"
        ),
    )

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    date = Column(Date, nullable=False)

    leetcode_count = Column(Integer, default=0)

    codeforces_count = Column(Integer, default=0)

    github_count = Column(Integer, default=0)

    total_activity = Column(Integer, default=0)

    streak_active = Column(Boolean, default=False)

    user = relationship("User",back_populates="progress_history")

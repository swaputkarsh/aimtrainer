"""
Pydantic Models
Data validation schemas for API requests and responses
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GameSessionCreate(BaseModel):
    """Schema for creating a new game session"""
    player_id: str = Field(..., min_length=1, max_length=100)
    player_name: Optional[str] = Field(None, max_length=100)


class GameSessionEnd(BaseModel):
    """Schema for ending a game session"""
    session_id: str = Field(..., min_length=1)
    score: int = Field(..., ge=0)
    accuracy: float = Field(..., ge=0, le=100)
    hits: int = Field(..., ge=0)
    misses: int = Field(..., ge=0)
    shots_taken: int = Field(..., ge=0)


class GameSession(BaseModel):
    """Schema for game session response"""
    session_id: str
    player_id: str
    player_name: Optional[str]
    score: int
    accuracy: float
    hits: int
    misses: int
    shots_taken: int
    created_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: int

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    """Schema for leaderboard entry"""
    rank: int
    player_name: Optional[str]
    score: int
    accuracy: float
    created_at: datetime

    class Config:
        from_attributes = True


class GameConfig(BaseModel):
    """Schema for game configuration"""
    target_spawn_rate: int = Field(default=800, description="Milliseconds between target spawns")
    target_size: int = Field(default=30, description="Radius of targets in pixels")
    game_duration: int = Field(default=60, description="Game duration in seconds")
    max_targets_on_screen: int = Field(default=5, description="Maximum targets visible at once")


class HealthResponse(BaseModel):
    """Schema for health check response"""
    status: str
    database: str

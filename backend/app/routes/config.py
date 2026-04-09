"""
Configuration Routes
Provides game configuration to frontend
"""
from fastapi import APIRouter
from app.models import GameConfig

router = APIRouter(prefix="/config", tags=["config"])


@router.get("/game", response_model=GameConfig)
def get_game_config():
    """
    Get current game configuration
    """
    return GameConfig(
        target_spawn_rate=800,
        target_size=30,
        game_duration=60,
        max_targets_on_screen=5,
    )

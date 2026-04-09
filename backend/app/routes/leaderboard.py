"""
Leaderboard Routes
Handles leaderboard retrieval and management
"""
from fastapi import APIRouter, HTTPException, status
from app.database import get_db

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/top")
def get_top_scores(limit: int = 10):
    """
    Get top scores from leaderboard
    """
    db = get_db()

    # Validate limit
    if limit < 1 or limit > 100:
        limit = 10

    if db is None:
        # Demo mode - return empty leaderboard
        return {"entries": [], "total": 0}

    try:
        # Query top scores
        entries = list(
            db.leaderboard.find()
            .sort("score", -1)
            .limit(limit)
        )

        # Format response
        formatted_entries = []
        for rank, entry in enumerate(entries, start=1):
            formatted_entries.append(
                {
                    "rank": rank,
                    "player_name": entry.get("player_name", "Anonymous"),
                    "score": entry.get("score", 0),
                    "accuracy": entry.get("accuracy", 0),
                    "created_at": entry.get("created_at"),
                }
            )

        return {
            "entries": formatted_entries,
            "total": len(formatted_entries),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve leaderboard: {str(e)}",
        )


@router.get("/player/{player_id}")
def get_player_scores(player_id: str, limit: int = 10):
    """
    Get all scores for a specific player
    """
    db = get_db()

    # Validate limit
    if limit < 1 or limit > 100:
        limit = 10

    if db is None:
        # Demo mode
        return {"player_id": player_id, "entries": [], "total": 0}

    try:
        # Query player's scores
        entries = list(
            db.leaderboard.find({"player_id": player_id})
            .sort("created_at", -1)
            .limit(limit)
        )

        # Format response
        formatted_entries = []
        for entry in entries:
            formatted_entries.append(
                {
                    "player_name": entry.get("player_name", "Anonymous"),
                    "score": entry.get("score", 0),
                    "accuracy": entry.get("accuracy", 0),
                    "created_at": entry.get("created_at"),
                }
            )

        return {
            "player_id": player_id,
            "entries": formatted_entries,
            "total": len(formatted_entries),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve player scores: {str(e)}",
        )

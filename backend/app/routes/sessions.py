"""
Game Sessions Routes
Handles session creation, updates, and retrieval
"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from bson.objectid import ObjectId
import uuid
from app.models import GameSessionCreate, GameSessionEnd, GameSession
from app.database import get_db

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/start", response_model=dict)
def start_session(session_data: GameSessionCreate):
    """
    Start a new game session
    Returns session_id for tracking during gameplay
    """
    db = get_db()

    if db is None:
        # Demo mode - return mock session
        return {
            "session_id": str(uuid.uuid4()),
            "player_id": session_data.player_id,
            "player_name": session_data.player_name or "Anonymous",
            "status": "started",
        }

    try:
        session_doc = {
            "player_id": session_data.player_id,
            "player_name": session_data.player_name or "Anonymous",
            "created_at": datetime.utcnow(),
            "ended_at": None,
            "score": 0,
            "accuracy": 0,
            "hits": 0,
            "misses": 0,
            "shots_taken": 0,
        }

        result = db.sessions.insert_one(session_doc)
        session_id = str(result.inserted_id)

        return {
            "session_id": session_id,
            "player_id": session_data.player_id,
            "player_name": session_data.player_name,
            "status": "started",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}",
        )


@router.post("/end", response_model=dict)
def end_session(session_data: GameSessionEnd):
    """
    End a game session and save final statistics
    """
    db = get_db()

    if db is None:
        # Demo mode - return confirmation
        return {
            "session_id": session_data.session_id,
            "status": "completed",
            "score": session_data.score,
        }

    try:
        # Validate session exists
        try:
            session_id = ObjectId(session_data.session_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format",
            )

        # Update session with final stats
        update_result = db.sessions.update_one(
            {"_id": session_id},
            {
                "$set": {
                    "ended_at": datetime.utcnow(),
                    "score": session_data.score,
                    "accuracy": session_data.accuracy,
                    "hits": session_data.hits,
                    "misses": session_data.misses,
                    "shots_taken": session_data.shots_taken,
                }
            },
        )

        if update_result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        # Add to leaderboard
        session = db.sessions.find_one({"_id": session_id})
        if session:
            db.leaderboard.insert_one(
                {
                    "session_id": str(session_id),
                    "player_id": session.get("player_id"),
                    "player_name": session.get("player_name"),
                    "score": session_data.score,
                    "accuracy": session_data.accuracy,
                    "created_at": session.get("created_at"),
                }
            )

        return {
            "session_id": session_data.session_id,
            "status": "completed",
            "score": session_data.score,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to end session: {str(e)}",
        )


@router.get("/{session_id}", response_model=dict)
def get_session(session_id: str):
    """
    Get session details and statistics
    """
    db = get_db()

    if db is None:
        # Demo mode
        return {"session_id": session_id, "status": "not_found"}

    try:
        try:
            oid = ObjectId(session_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format",
            )

        session = db.sessions.find_one({"_id": oid})

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found",
            )

        return {
            "session_id": str(session["_id"]),
            "player_id": session.get("player_id"),
            "player_name": session.get("player_name"),
            "score": session.get("score", 0),
            "accuracy": session.get("accuracy", 0),
            "hits": session.get("hits", 0),
            "misses": session.get("misses", 0),
            "shots_taken": session.get("shots_taken", 0),
            "created_at": session.get("created_at"),
            "ended_at": session.get("ended_at"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve session: {str(e)}",
        )

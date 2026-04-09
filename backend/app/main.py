"""
Aim Trainer Backend API
FastAPI application for game session management and leaderboard
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import sessions, leaderboard, config
from contextlib import asynccontextmanager

# Create FastAPI app with lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    print("Starting Aim Trainer Backend...")
    connect_to_mongo()

    yield

    # Shutdown
    print("Shutting down...")
    close_mongo_connection()


app = FastAPI(
    title="Aim Trainer API",
    description="Backend API for aim trainer game",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend will be on same server in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router)
app.include_router(leaderboard.router)
app.include_router(config.router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    from app.database import get_db

    db = get_db()
    db_status = "connected" if db else "disconnected (demo mode)"

    return {
        "status": "healthy",
        "database": db_status,
    }


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "name": "Aim Trainer API",
        "version": "1.0.0",
        "docs": "/docs",
    }

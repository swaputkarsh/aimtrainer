"""
Database Configuration
Handles MongoDB connection and initialization
"""
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "aim_trainer")

# Global client and database instances
client = None
db = None


def connect_to_mongo():
    """Initialize MongoDB connection"""
    global client, db
    try:
        client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        db = client[DB_NAME]

        # Create collections and indexes
        create_indexes()
        print("✓ Connected to MongoDB")
        return db
    except ServerSelectionTimeoutError:
        print("✗ Could not connect to MongoDB. Running in demo mode.")
        return None
    except Exception as e:
        print(f"✗ MongoDB connection error: {e}")
        return None


def create_indexes():
    """Create database indexes for better query performance"""
    if db is None:
        return

    # Sessions collection
    if "sessions" not in db.list_collection_names():
        db.create_collection("sessions")
    db.sessions.create_index("player_id")
    db.sessions.create_index("created_at")

    # Leaderboard doesn't need special indexes - queries on score are fast enough
    if "leaderboard" not in db.list_collection_names():
        db.create_collection("leaderboard")
    db.leaderboard.create_index("score", direction=-1)  # Descending for top scores


def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")


def get_db():
    """Get database instance"""
    return db

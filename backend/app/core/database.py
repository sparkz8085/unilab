import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, IndexModel

from app.core.config import settings

logger = logging.getLogger("unilab.db")


class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False


db_manager = DatabaseManager()


async def connect_to_mongo():
    """Initializes MongoDB async client and ensures indexes."""
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=3000
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        
        # Test connection ping
        await db_manager.client.admin.command('ping')
        db_manager.is_connected = True
        logger.info(f"Successfully connected to MongoDB database '{settings.MONGODB_DB_NAME}'.")
        
        # Initialize indexes
        await init_db_indexes(db_manager.db)
    except Exception as e:
        logger.warning(
            f"Could not connect to MongoDB ({e}). "
            "UniLab will operate with fallback data/storage if MongoDB is offline."
        )
        db_manager.is_connected = False


async def close_mongo_connection():
    """Closes MongoDB async client connection."""
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.is_connected = False


async def init_db_indexes(db: AsyncIOMotorDatabase):
    """Creates performance and constraint indexes on collections."""
    try:
        # Users indexes
        await db.users.create_indexes([
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("role", ASCENDING)]),
            IndexModel([("student_id", ASCENDING)], sparse=True),
        ])

        # Courses indexes
        await db.courses.create_indexes([
            IndexModel([("code", ASCENDING), ("academic_session_id", ASCENDING)], unique=True),
            IndexModel([("teacher_ids", ASCENDING)]),
            IndexModel([("student_ids", ASCENDING)]),
        ])

        # Practicals indexes
        await db.practicals.create_indexes([
            IndexModel([("course_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("deadline", ASCENDING)]),
        ])

        # Submissions indexes
        await db.submissions.create_indexes([
            IndexModel([("practical_id", ASCENDING), ("student_id", ASCENDING)], unique=True),
            IndexModel([("practical_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("student_id", ASCENDING), ("course_id", ASCENDING)]),
        ])

        # Feedback indexes
        await db.feedback.create_indexes([
            IndexModel([("submission_id", ASCENDING)], unique=True),
            IndexModel([("practical_id", ASCENDING)]),
        ])

        # Academic Sessions indexes
        await db.academic_sessions.create_indexes([
            IndexModel([("name", ASCENDING)], unique=True),
            IndexModel([("is_current", ASCENDING)]),
        ])

        logger.info("Database indexes successfully verified and initialized.")
    except Exception as e:
        logger.error(f"Error initializing indexes: {e}")


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns current active database instance."""
    return db_manager.db

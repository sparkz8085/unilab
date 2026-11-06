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
    """Connects to MongoDB; production startup requires a working database."""
    try:
        logger.info("Connecting to MongoDB database '%s'...", settings.MONGODB_DB_NAME)
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]

        await db_manager.client.admin.command("ping")
        db_manager.is_connected = True
        logger.info("Successfully connected to MongoDB.")

        await init_db_indexes(db_manager.db)
    except Exception:
        db_manager.is_connected = False
        if db_manager.client is not None:
            db_manager.client.close()
        db_manager.client = None
        db_manager.db = None

        if settings.ENVIRONMENT.lower() == "production":
            logger.error("MongoDB connection failed; production startup aborted.")
            raise RuntimeError(
                "MongoDB is required in production. Check MONGODB_URI and Atlas network access."
            ) from None

        logger.warning("MongoDB connection failed; using in-memory fallback for development.")


async def close_mongo_connection():
    """Closes MongoDB async client connection."""
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
        db_manager.is_connected = False


async def init_db_indexes(db: AsyncIOMotorDatabase):
    """Creates performance and constraint indexes on collections."""
    try:
        await db.users.create_indexes([
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("role", ASCENDING)]),
            IndexModel([("student_id", ASCENDING)], sparse=True),
        ])

        await db.courses.create_indexes([
            IndexModel([("code", ASCENDING), ("academic_session_id", ASCENDING)], unique=True),
            IndexModel([("teacher_ids", ASCENDING)]),
            IndexModel([("student_ids", ASCENDING)]),
        ])

        await db.practicals.create_indexes([
            IndexModel([("course_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("deadline", ASCENDING)]),
        ])

        await db.submissions.create_indexes([
            IndexModel([("practical_id", ASCENDING), ("student_id", ASCENDING)], unique=True),
            IndexModel([("practical_id", ASCENDING), ("status", ASCENDING)]),
            IndexModel([("student_id", ASCENDING), ("course_id", ASCENDING)]),
        ])

        await db.feedback.create_indexes([
            IndexModel([("submission_id", ASCENDING)], unique=True),
            IndexModel([("practical_id", ASCENDING)]),
        ])

        await db.academic_sessions.create_indexes([
            IndexModel([("name", ASCENDING)], unique=True),
            IndexModel([("is_current", ASCENDING)]),
        ])

        logger.info("Database indexes successfully verified and initialized.")
    except Exception:
        logger.exception("Database index initialization failed.")
        if settings.ENVIRONMENT.lower() == "production":
            raise


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns current active database instance."""
    return db_manager.db

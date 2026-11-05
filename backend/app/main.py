import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo
from app.core.rate_limit import limiter
from app.utils.seed_data import seed_initial_data_if_empty

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("unilab")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB & seed initial mock/demo records
    logger.info(f"Starting {settings.PROJECT_NAME} Backend Engine...")
    await connect_to_mongo()
    if settings.ENVIRONMENT != "production":
        await seed_initial_data_if_empty()
    yield
    # Shutdown: Cleanly close DB connection
    logger.info(f"Shutting down {settings.PROJECT_NAME} Backend Engine...")
    await close_mongo_connection()


app = FastAPI(
    title="UniLab API",
    description="Backend REST API for UniLab — AI-Assisted University Practical & Laboratory Management System",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Too many requests. Please try again later."},
    )

# Configure CORS for Next.js frontend (Vercel & local development)
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Laboratory Management API",
        "docs": "/docs",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/health")
async def root_health():
    from app.core.database import db_manager
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database_connected": db_manager.is_connected
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

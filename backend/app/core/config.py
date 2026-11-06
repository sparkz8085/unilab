from typing import List, Union

from pydantic import ValidationInfo, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "UniLab"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    UPLOAD_DIR: str = "uploads"

    # MongoDB Connection
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "unilab_db"

    # JWT Authentication
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return value
        raise ValueError("CORS_ORIGINS must be a comma-separated string or a list.")

    @field_validator("JWT_SECRET")
    @classmethod
    def validate_jwt_secret(cls, value: str, info: ValidationInfo) -> str:
        if not value or len(value) < 32:
            raise ValueError("JWT_SECRET must be a random value of at least 32 characters.")

        environment = str(info.data.get("ENVIRONMENT", "development")).lower()
        normalized = value.strip().lower()
        placeholders = (
            "replace_with_",
            "your_",
            "change_me",
            "changeme",
            "example",
            "password",
        )
        if environment == "production" and any(
            normalized.startswith(prefix) for prefix in placeholders
        ):
            raise ValueError("A real, randomly generated JWT_SECRET is required in production.")

        return value


settings = Settings()

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./todo_app.db"  # Default fallback

    # JWT Configuration
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3004,http://127.0.0.1:3004,http://localhost:5173"

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Todo API"
    DEBUG: bool = False

    # OpenAI Configuration
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    MCP_SERVER_URL: str = "http://localhost:8001"

    # Application Configuration
    APP_ENV: str = "development"

    # Computed Properties
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        # This tells pydantic to load from .env file
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Case sensitive to match exact variable names
        case_sensitive = True
        # Allow extra fields from .env that aren't defined in class
        extra = "ignore"


# Global settings instance
settings = Settings()
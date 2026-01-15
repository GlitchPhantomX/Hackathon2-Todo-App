from pydantic_settings import BaseSettings
from typing import Optional
import os


class MicroserviceConfig(BaseSettings):
    """
    Configuration settings for microservices
    """
    # Dapr configuration
    dapr_http_port: int = 3500
    dapr_grpc_port: int = 50001

    # Notification service configuration
    notification_window_minutes: int = 30
    notification_scan_interval_seconds: int = 30

    # Database configuration
    database_url: str = "sqlite:///./todo_app.db"
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # Retry and reliability settings
    retry_max_attempts: int = 3
    retry_base_delay: float = 1.0
    retry_max_delay: float = 60.0

    # Circuit breaker settings
    circuit_breaker_failure_threshold: int = 5
    circuit_breaker_timeout_seconds: int = 60

    # Logging configuration
    log_level: str = "INFO"
    log_file: Optional[str] = None

    # Service-specific settings
    service_name: str = "microservice"
    service_port: int = 8000

    class Config:
        env_prefix = 'MICROSERVICE_'
        case_sensitive = False


# Global config instance
config = MicroserviceConfig()


def get_config() -> MicroserviceConfig:
    """
    Get the global configuration instance
    """
    return config
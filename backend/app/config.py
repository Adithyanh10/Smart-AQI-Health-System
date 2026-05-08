from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_KEY: str = "dev-api-key"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    DATASET_PATH: str = "../dataset/air_quality.csv"
    MODELS_DIR: str = "../models"
    LOGS_DIR: str = "../logs"
    CACHE_TTL_SECONDS: int = 60
    RATE_LIMIT_MAX: int = 100
    RATE_LIMIT_WINDOW: int = 60

    class Config:
        env_file = ".env"


settings = Settings()

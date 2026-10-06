from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://grimoire:grimoire@db:5432/grimoire"
    cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()

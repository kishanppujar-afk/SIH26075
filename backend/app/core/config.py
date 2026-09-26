from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillStat AI Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = "sqlite:///./skillstat.db"

    SECRET_KEY: str = "skillstat_hackathon_mospi_secret_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:4b"
    OLLAMA_EMBEDDING_MODEL: str = "nomic-embed-text"

    UPLOAD_DIR: str = "./uploads"

    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

"""Application settings loaded from environment variables / .env.

Environment separation (audit §20-21):
- development: debug logging, Swagger, dev tools allowed, SQLite
- testing:      isolated DB, fast deterministic config
- production:   debug and dev tools rejected at startup, restricted CORS
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

DEV = "development"
TEST = "testing"
PROD = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Duolingo Clone API"
    environment: str = DEV
    debug: bool = False

    database_url: str = "sqlite:///./data/duolingo_clone.db"

    # Auth: HMAC signing key for bearer tokens. Required in production.
    secret_key: str = "dev-only-insecure-secret-key-change-me"

    # Logging
    log_level: str = "INFO"

    # Rate limiting (audit §11) — in-memory limiter, per-IP.
    rate_limit_enabled: bool = True
    rate_limit_general: str = "100/minute"
    rate_limit_submission: str = "30/minute"
    rate_limit_completion: str = "10/minute"
    rate_limit_auth: str = "20/minute"
    rate_limit_dev: str = "20/minute"

    # Gamification tuning
    heart_regeneration_minutes: int = 30
    default_max_hearts: int = 5
    # Gem economy: costs and rewards (Duolingo-style).
    heart_refill_gem_cost: int = 350
    lesson_completion_gem_reward: int = 5
    achievement_gem_reward: int = 10

    demo_username: str = "demo_learner"

    # Development-only tools (/api/v1/dev/*)
    enable_dev_tools: bool = False

    # Comma-separated allowed origins.
    cors_origins: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == PROD

    def validate_for_startup(self) -> list[str]:
        """Fail-early validation for unsafe production configuration.

        Returns a list of problems; empty means safe to start.
        """
        problems: list[str] = []
        if self.is_production:
            if self.debug:
                problems.append("DEBUG=true is not allowed in production")
            if self.enable_dev_tools:
                problems.append("ENABLE_DEV_TOOLS=true is not allowed in production")
            if not self.cors_origin_list:
                problems.append("CORS_ORIGINS must be set in production")
            if self.secret_key in (
                "dev-only-insecure-secret-key-change-me",
                "duolingo-clone-master-secret-key-2026",
                "",
            ):
                problems.append("SECRET_KEY must be a real secret in production")
        return problems


@lru_cache
def get_settings() -> Settings:
    return Settings()

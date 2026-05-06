from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # app
    app_env: str = "development"
    secret_key: str = "dev-secret-key"
    debug: bool = True
    allowed_origins: str = "http://localhost:3000"

    # database
    database_url: str = "postgresql+asyncpg://decypher:decypher@localhost:5432/decypher_db"

    # redis
    redis_url: str = "redis://localhost:6379/0"

    # ai
    ai_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_max_tokens: int = 4096
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"

    # data collection
    github_token: str = ""
    reddit_client_id: str = ""
    reddit_client_secret: str = ""
    reddit_user_agent: str = "DecypherAI/0.1.0"

    # task
    default_task_interval: int = 3600
    max_concurrent_tasks: int = 5
    rate_limit_per_minute: int = 60

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # app
    app_env: str = Field("development", validation_alias=AliasChoices("DECYPHER_APP_ENV", "APP_ENV", "app_env"))
    secret_key: str = Field("dev-secret-key", validation_alias=AliasChoices("DECYPHER_SECRET_KEY", "SECRET_KEY", "secret_key"))
    debug: bool = Field(True, validation_alias=AliasChoices("DECYPHER_DEBUG", "DEBUG", "debug"))
    allowed_origins: str = Field(
        "http://localhost:3000",
        validation_alias=AliasChoices("DECYPHER_ALLOWED_ORIGINS", "ALLOWED_ORIGINS", "allowed_origins"),
    )

    # database
    database_url: str = Field(
        "postgresql+asyncpg://decypher:decypher@localhost:5432/decypher_db",
        validation_alias=AliasChoices("DECYPHER_DATABASE_URL", "DATABASE_URL", "database_url"),
    )

    # redis
    redis_url: str = Field(
        "redis://localhost:6379/0",
        validation_alias=AliasChoices("DECYPHER_REDIS_URL", "REDIS_URL", "redis_url"),
    )

    # ai provider: ollama | openai | deepseek
    ai_provider: str = Field(
        "ollama",
        validation_alias=AliasChoices("DECYPHER_AI_PROVIDER", "AI_PROVIDER", "ai_provider"),
    )
    ai_max_tokens: int = Field(
        4096,
        validation_alias=AliasChoices("DECYPHER_AI_MAX_TOKENS", "AI_MAX_TOKENS", "ai_max_tokens"),
    )

    # ollama (local — used during development)
    ollama_base_url: str = Field(
        "http://localhost:11434/v1",
        validation_alias=AliasChoices("DECYPHER_OLLAMA_BASE_URL", "OLLAMA_BASE_URL", "ollama_base_url"),
    )
    ollama_model: str = Field(
        "llama3.2",
        validation_alias=AliasChoices("DECYPHER_OLLAMA_MODEL", "OLLAMA_MODEL", "ollama_model"),
    )

    # openai (cloud — used in production)
    openai_api_key: str = Field(
        "",
        validation_alias=AliasChoices("OPENAI_API_KEY", "DECYPHER_OPENAI_API_KEY", "openai_api_key"),
    )
    openai_model: str = Field(
        "gpt-4o-mini",
        validation_alias=AliasChoices("DECYPHER_OPENAI_MODEL", "OPENAI_MODEL", "openai_model"),
    )

    # deepseek (cloud — fallback)
    deepseek_api_key: str = Field(
        "",
        validation_alias=AliasChoices("DEEPSEEK_API_KEY", "DECYPHER_DEEPSEEK_API_KEY", "deepseek_api_key"),
    )
    deepseek_model: str = Field(
        "deepseek-chat",
        validation_alias=AliasChoices("DECYPHER_DEEPSEEK_MODEL", "DEEPSEEK_MODEL", "deepseek_model"),
    )

    # data collection — github
    github_token: str = Field(
        "",
        validation_alias=AliasChoices("GITHUB_TOKEN", "DECYPHER_GITHUB_TOKEN", "github_token"),
    )
    # data collection — reddit
    reddit_client_id: str = Field(
        "",
        validation_alias=AliasChoices("REDDIT_CLIENT_ID", "DECYPHER_REDDIT_CLIENT_ID", "reddit_client_id"),
    )
    reddit_client_secret: str = Field(
        "",
        validation_alias=AliasChoices("REDDIT_CLIENT_SECRET", "DECYPHER_REDDIT_CLIENT_SECRET", "reddit_client_secret"),
    )
    reddit_user_agent: str = Field(
        "DecypherAI/0.1.0",
        validation_alias=AliasChoices("REDDIT_USER_AGENT", "DECYPHER_REDDIT_USER_AGENT", "reddit_user_agent"),
    )
    # data collection — product hunt (optional; service degrades gracefully when empty)
    producthunt_api_key: str = Field(
        "",
        validation_alias=AliasChoices("PRODUCTHUNT_API_KEY", "DECYPHER_PRODUCTHUNT_API_KEY", "producthunt_api_key"),
    )
    # data collection — stack exchange (optional; raises rate limit 300→10000/day)
    stackexchange_api_key: str = Field(
        "",
        validation_alias=AliasChoices("STACKEXCHANGE_API_KEY", "DECYPHER_STACKEXCHANGE_API_KEY", "stackexchange_api_key"),
    )

    # task
    default_task_interval: int = Field(
        3600,
        validation_alias=AliasChoices("DECYPHER_DEFAULT_TASK_INTERVAL", "DEFAULT_TASK_INTERVAL", "default_task_interval"),
    )
    max_concurrent_tasks: int = Field(
        5,
        validation_alias=AliasChoices("DECYPHER_MAX_CONCURRENT_TASKS", "MAX_CONCURRENT_TASKS", "max_concurrent_tasks"),
    )
    rate_limit_per_minute: int = Field(
        60,
        validation_alias=AliasChoices("DECYPHER_RATE_LIMIT_PER_MINUTE", "RATE_LIMIT_PER_MINUTE", "rate_limit_per_minute"),
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def active_ai_model(self) -> str:
        """Model name to pass to each chat completion call."""
        if self.ai_provider == "ollama":
            return self.ollama_model
        if self.ai_provider == "deepseek":
            return self.deepseek_model
        return self.openai_model

    @property
    def ai_client_kwargs(self) -> dict:
        """Kwargs for openai.AsyncOpenAI() — works for ollama, deepseek, and openai."""
        if self.ai_provider == "ollama":
            # Ollama exposes an OpenAI-compatible endpoint; any non-empty string works as key
            return {"base_url": self.ollama_base_url, "api_key": "ollama"}
        if self.ai_provider == "deepseek":
            return {"base_url": "https://api.deepseek.com/v1", "api_key": self.deepseek_api_key}
        return {"api_key": self.openai_api_key}


settings = Settings()

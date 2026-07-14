from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    openai_api_key: str
    solar_api_key: str = ""
    access_token_expire_minutes: int = 10080  # 7 days
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()

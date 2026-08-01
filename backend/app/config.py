from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    openai_api_key: str
    solar_api_key: str = ""
    access_token_expire_minutes: int = 10080  # 7 days
    algorithm: str = "HS256"

    # 창업 정보 허브 수집 (STEP: hub_items 실데이터 연동)
    hub_collector_key: str = ""    # GitHub Actions가 POST /hub/collect 호출 시 보내는 관리자 키
    kstartup_api_key: str = ""     # data.go.kr K-Startup 서비스키
    # 기업마당·KOCCA는 공식 오픈API가 없어 공개 목록 페이지를 크롤링한다(app/hub/sources.py) — 키 불필요.

    class Config:
        env_file = ".env"


settings = Settings()

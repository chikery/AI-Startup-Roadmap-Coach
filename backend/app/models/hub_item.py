from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, JSON, UniqueConstraint, func
from app.database import Base


class HubItem(Base):
    """창업 정보 허브(대시보드) 수집 데이터. source_type: 'news' | 'gov_support' | 'article'.

    이번 단계에서는 K-Startup/기업마당/KOCCA 3개 공식 API만 'gov_support'로 수집한다.
    'news'/'article'은 향후 확장을 위해 스키마에는 남겨두되 아직 채우는 수집기가 없다 —
    프론트는 빈 결과일 때 자동으로 기존 목업(info-hub-data.ts)으로 폴백한다.
    """
    __tablename__ = "hub_items"

    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String, nullable=False)
    agency = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text)
    url = Column(String, nullable=False)
    published_at = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)               # gov_support 전용
    max_support_amount = Column(String, nullable=True)    # gov_support 전용, 자유 텍스트
    eligible_steps = Column(JSON, default=list)           # [1..7]
    eligible_categories = Column(JSON, default=list)      # ["문화예술", ...]
    eligible_age_max = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    raw_source_id = Column(String, nullable=False, index=True)
    collected_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("source_type", "agency", "raw_source_id", name="uq_hub_item_source"),
    )

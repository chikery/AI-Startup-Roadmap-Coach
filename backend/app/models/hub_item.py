from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, JSON, UniqueConstraint, func
from app.database import Base


class HubItem(Base):
    """창업 정보 허브(대시보드) 수집 데이터. source_type: 'news' | 'gov_support' | 'article'.

    'gov_support'는 K-Startup/기업마당/KOCCA 3개 기관, 'news'는 플래텀/벤처스퀘어/
    바이라인네트워크 RSS 3개 매체를 수집한다. 'article'(Recommended Articles)은
    "이번 주 최신 글"이 아니라 "단계별로 계속 유효한 글"이 필요해 자동 수집 대상이
    아니다 — 수동으로 큐레이션한 실제 아티클을 info-hub-data.ts에 직접 등록한다.
    프론트는 이 테이블이 비어있으면(수집 전/실패 시) 자동으로 기존 목업으로 폴백한다.
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

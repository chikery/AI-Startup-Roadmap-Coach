from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)           # 사업명
    organization = Column(String, nullable=False)   # 주관기관
    support_type = Column(String)                   # 현금/현물/교육
    support_amount = Column(String)                 # 지원금 규모
    eligibility = Column(Text)                      # 신청 자격
    target_stage = Column(String)                   # 아이디어/예비창업/초기창업
    target_category = Column(String)                # 분야
    region = Column(String, default="전국")
    deadline = Column(String)
    apply_url = Column(String)
    description = Column(Text)                      # RAG 임베딩 대상 전체 설명
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

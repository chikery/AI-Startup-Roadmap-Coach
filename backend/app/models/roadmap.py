from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    step = Column(Integer, nullable=False)          # 1~7
    is_completed = Column(Boolean, default=False)
    content = Column(Text)                          # 사용자 작성 내용 (JSON string)
    ai_draft = Column(Text)                         # AI 생성 초안 (JSON string)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="roadmap_progress")

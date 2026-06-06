from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    item_keyword = Column(String)        # 창업 아이템 키워드
    startup_stage = Column(String)       # 아이디어/예비창업/초기창업
    region = Column(String)
    category = Column(String)            # 문화예술/콘텐츠/공예 등
    has_team = Column(String)            # solo/team
    created_at = Column(DateTime, server_default=func.now())

    roadmap_progress = relationship("RoadmapProgress", back_populates="user")

from pydantic import BaseModel
from typing import Optional, List


class ProgramResponse(BaseModel):
    id: int
    name: str
    organization: str
    support_type: Optional[str]
    support_amount: Optional[str]
    eligibility: Optional[str]
    target_stage: Optional[str]
    target_category: Optional[str]
    region: Optional[str]
    deadline: Optional[str]
    apply_url: Optional[str]
    description: Optional[str]
    match_reason: Optional[str] = None   # RAG가 생성한 적합도 이유

    class Config:
        from_attributes = True


class RecommendRequest(BaseModel):
    item_keyword: str
    category: str
    startup_stage: str
    region: Optional[str] = "전국"
    has_team: Optional[str] = "solo"


class RecommendResponse(BaseModel):
    programs: List[ProgramResponse]
    total: int

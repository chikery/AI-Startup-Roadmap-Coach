from pydantic import BaseModel
from typing import Optional, Any


class StepSave(BaseModel):
    content: Any      # step별 구조화된 JSON


class StepResponse(BaseModel):
    step: int
    is_completed: bool
    content: Optional[Any]
    ai_draft: Optional[Any]

    class Config:
        from_attributes = True


class AIDraftRequest(BaseModel):
    step: int
    item_keyword: str
    context: Optional[Any] = None   # 이전 단계 내용

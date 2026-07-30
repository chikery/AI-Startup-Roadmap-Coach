import json
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any

MAX_CONTEXT_JSON_CHARS = 20000


def _validate_context_size(cls, v):
    if v is not None and len(json.dumps(v, ensure_ascii=False)) > MAX_CONTEXT_JSON_CHARS:
        raise ValueError(f"입력이 너무 큽니다 (최대 {MAX_CONTEXT_JSON_CHARS}자)")
    return v


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
    item_keyword: str = Field(max_length=200)
    context: Optional[Any] = None   # 이전 단계 내용

    _validate_context = field_validator("context")(_validate_context_size)

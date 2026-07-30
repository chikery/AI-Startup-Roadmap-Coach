from pydantic import BaseModel
from typing import Optional, List


class HubItemPublic(BaseModel):
    """프론트 InfoHubItem과 동일한 shape — 그대로 꽂아 쓸 수 있게 필드명을 맞춘다."""
    title: str
    source: str            # HubItem.agency
    date: str               # HubItem.published_at.isoformat()
    url: str
    steps: List[int]        # HubItem.eligible_steps

    class Config:
        from_attributes = True


class HubItemsResponse(BaseModel):
    items: List[HubItemPublic]


class HubCollectResult(BaseModel):
    ok: bool
    collected: int
    deactivated: int
    errors: List[str] = []

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.hub_item import HubItem
from app.schemas.hub import HubItemPublic, HubItemsResponse, HubCollectResult
from app.hub.collector import run_collection

router = APIRouter(prefix="/hub", tags=["hub"])


def require_collector_key(x_hub_collector_key: str = Header(default="")):
    if not settings.hub_collector_key or x_hub_collector_key != settings.hub_collector_key:
        raise HTTPException(status_code=401, detail="관리자 키가 유효하지 않습니다")


@router.post("/collect", response_model=HubCollectResult, dependencies=[Depends(require_collector_key)])
def collect(db: Session = Depends(get_db)):
    result = run_collection(db)
    return HubCollectResult(**result)


@router.get("/items", response_model=HubItemsResponse)
def get_items(source_type: str, db: Session = Depends(get_db)):
    rows = (
        db.query(HubItem)
        .filter(HubItem.source_type == source_type, HubItem.is_active.is_(True))
        .order_by(HubItem.published_at.desc().nullslast())
        .limit(20)
        .all()
    )
    items = [
        HubItemPublic(
            title=r.title,
            source=r.agency,
            date=r.published_at.isoformat() if r.published_at else r.collected_at.date().isoformat(),
            url=r.url,
            steps=r.eligible_steps or [],
        )
        for r in rows
    ]
    return HubItemsResponse(items=items)

"""수집 오케스트레이션: fetch → 태깅 → upsert(중복 방지) → 마감 지난 공고 비활성화.

화면(GET /hub/items)은 이 결과가 저장된 DB만 읽는다 — 요청 시점 즉석 수집은 없다.
"""

from datetime import date

from sqlalchemy.orm import Session

from app.models.hub_item import HubItem
from app.hub.sources import SOURCE_FETCHERS, NEWS_SOURCE_FETCHERS
from app.hub.tagging import tag_item

SOURCE_TYPE_GOV_SUPPORT = "gov_support"
SOURCE_TYPE_NEWS = "news"


def _collect(db: Session, source_type: str, fetchers: dict) -> dict:
    collected = 0
    errors: list[str] = []

    for agency, fetcher in fetchers.items():
        try:
            raw_items = fetcher()
        except Exception as e:
            errors.append(f"{agency}: fetch 실패 — {e}")
            continue

        for raw in raw_items:
            try:
                tags = tag_item(raw["title"], raw.get("summary", ""), raw.get("raw_eligibility_text", ""))

                existing = (
                    db.query(HubItem)
                    .filter(
                        HubItem.source_type == source_type,
                        HubItem.agency == raw["agency"],
                        HubItem.raw_source_id == raw["raw_id"],
                    )
                    .first()
                )

                if existing:
                    existing.title = raw["title"]
                    existing.summary = raw.get("summary")
                    existing.url = raw["url"]
                    existing.published_at = raw.get("published_at")
                    existing.deadline = raw.get("deadline")
                    existing.max_support_amount = raw.get("max_support_amount")
                    existing.eligible_steps = tags["eligible_steps"]
                    existing.eligible_categories = tags["eligible_categories"]
                    existing.eligible_age_max = tags["eligible_age_max"]
                    existing.is_active = True  # 재수집됐고 아래에서 마감 여부를 다시 판단하므로 일단 활성화
                else:
                    db.add(HubItem(
                        source_type=source_type,
                        agency=raw["agency"],
                        title=raw["title"],
                        summary=raw.get("summary"),
                        url=raw["url"],
                        published_at=raw.get("published_at"),
                        deadline=raw.get("deadline"),
                        max_support_amount=raw.get("max_support_amount"),
                        raw_source_id=raw["raw_id"],
                        eligible_steps=tags["eligible_steps"],
                        eligible_categories=tags["eligible_categories"],
                        eligible_age_max=tags["eligible_age_max"],
                    ))
                collected += 1
            except Exception as e:
                errors.append(f"{agency}/{raw.get('raw_id')}: {e}")

    db.commit()
    return {"collected": collected, "errors": errors}


def collect_gov_support(db: Session) -> dict:
    return _collect(db, SOURCE_TYPE_GOV_SUPPORT, SOURCE_FETCHERS)


def collect_startup_news(db: Session) -> dict:
    """뉴스는 마감일 개념이 없어(raw.deadline은 항상 None) deactivate_expired 대상이 되지
    않는다 — 화면은 published_at 최신순 상위 N건만 보여주므로 오래된 기사는 자연히 밀려난다."""
    return _collect(db, SOURCE_TYPE_NEWS, NEWS_SOURCE_FETCHERS)


def deactivate_expired(db: Session) -> int:
    today = date.today()
    q = db.query(HubItem).filter(
        HubItem.deadline.isnot(None),
        HubItem.deadline < today,
        HubItem.is_active.is_(True),
    )
    count = q.count()
    if count:
        q.update({"is_active": False}, synchronize_session=False)
        db.commit()
    return count


def run_collection(db: Session) -> dict:
    gov = collect_gov_support(db)
    news = collect_startup_news(db)
    deactivated = deactivate_expired(db)
    return {
        "ok": True,
        "collected": gov["collected"] + news["collected"],
        "deactivated": deactivated,
        "errors": gov["errors"] + news["errors"],
    }

"""수집 소스 — K-Startup / 기업마당(bizinfo) / KOCCA 공식 오픈 API만 다룬다.

GOKAMS(예술경영지원센터):
  TODO(수집 대상 제외 — 결정 필요): data.go.kr에 지원사업 공모 API가 없고,
  gokams.or.kr/robots.txt가 우리가 필요로 하는 공지사항 경로(/01_news/*.aspx)를
  명시적으로 Disallow 하고 있어 자동 스크래핑도 불가능하다. 제휴 문의로 데이터를
  받거나, 당분간 관리자가 수동으로 hub_items에 등록하는 방식 중 하나를 나중에
  결정한다. 이 수집기에는 포함하지 않는다.

각 fetch_* 함수는 raw dict 리스트를 반환한다. 공통 shape:
    {
        "raw_id": str,              # 원본 고유 식별자 (dedup 키)
        "agency": str,
        "title": str,
        "summary": str,
        "url": str,
        "published_at": date | None,
        "deadline": date | None,
        "max_support_amount": str | None,
        "raw_eligibility_text": str,  # tagging.py가 이 텍스트에서 태그를 뽑는다
    }

주의(TODO): 아래 3개 API의 정확한 요청 파라미터/응답 필드명은 공공데이터포털
문서 기준 조사치이며, 실제 서비스키로 라이브 호출해 검증하지 않았다. 필드가
여러 후보 키 중 하나로 올 수 있다고 가정해 방어적으로 파싱한다 — 실 서비스키로
첫 수집을 돌려본 뒤 `_pick()` 후보 키 목록을 실제 응답에 맞게 보정해야 할 수 있다.
"""

import logging
from datetime import date, datetime
from typing import Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

KSTARTUP_URL = "https://apis.data.go.kr/B552735/kisedKstartupService01/getAnnouncementInformation01"
BIZINFO_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do"
KOCCA_URL = "https://apis.data.go.kr/B551014/CTCA_A_01/CTCA_A_01"  # TODO: 실제 서비스 경로 확인 필요


def _pick(d: dict, *keys: str, default: Any = None) -> Any:
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return default


def _parse_date(raw: Any) -> Optional[date]:
    if not raw:
        return None
    s = str(raw).strip()
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y.%m.%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(s[:10].replace(".", "-").replace("/", "-"), "%Y-%m-%d").date()
        except ValueError:
            continue
    return None


def fetch_kstartup() -> list[dict]:
    if not settings.kstartup_api_key:
        logger.info("KSTARTUP_API_KEY not configured — skipping K-Startup collection")
        return []

    try:
        resp = httpx.get(
            KSTARTUP_URL,
            params={
                "serviceKey": settings.kstartup_api_key,
                "page": 1,
                "perPage": 50,
                "returnType": "json",
            },
            timeout=15,
        )
        resp.raise_for_status()
        payload = resp.json()
    except Exception as e:
        logger.warning("K-Startup fetch failed: %s", e)
        return []

    # TODO: 실제 응답 envelope 확인 필요 — data.go.kr 계열은 흔히 response.body.items
    raw_items = _pick(payload, "data", "items", default=[]) or _pick(
        payload.get("response", {}) if isinstance(payload, dict) else {}, "body", default={}
    ).get("items", [])
    if isinstance(raw_items, dict):
        raw_items = raw_items.get("item", [])

    out = []
    for it in raw_items:
        raw_id = str(_pick(it, "pbancSn", "pblancId", "id", default=""))
        if not raw_id:
            continue
        eligibility = _pick(it, "pbancCtnt", "sprtAge", "aplyTrgtCn", default="")
        out.append({
            "raw_id": raw_id,
            "agency": "K-Startup",
            "title": _pick(it, "bizPbancNm", "pblancNm", "title", default="(제목 없음)"),
            "summary": _pick(it, "pbancCtnt", "bsnsSumryCn", "summary", default=""),
            "url": _pick(it, "detlPgUrl", "url", default="https://www.k-startup.go.kr/"),
            "published_at": _parse_date(_pick(it, "creatPnttm", "regDt")),
            "deadline": _parse_date(_pick(it, "pbancRcptEndDt", "reqstEndDe")),
            "max_support_amount": _pick(it, "sprtScl", "bizTrgtAge", default=None),
            "raw_eligibility_text": str(eligibility),
        })
    return out


def fetch_bizinfo() -> list[dict]:
    if not settings.bizinfo_api_key:
        logger.info("BIZINFO_API_KEY not configured — skipping 기업마당 collection")
        return []

    try:
        resp = httpx.get(
            BIZINFO_URL,
            params={
                "crtfcKey": settings.bizinfo_api_key,
                "dataType": "json",
                "searchCnt": 50,
            },
            timeout=15,
        )
        resp.raise_for_status()
        payload = resp.json()
    except Exception as e:
        logger.warning("기업마당 fetch failed: %s", e)
        return []

    # TODO: 실제 envelope 확인 필요 — 문서상 jsonArray 키로 내려온다고 알려져 있음
    raw_items = _pick(payload, "jsonArray", "items", default=[])

    out = []
    for it in raw_items:
        raw_id = str(_pick(it, "pblancId", "seq", "id", default=""))
        if not raw_id:
            continue
        eligibility = _pick(it, "trgetNm", "bsnsSumryCn", default="")
        out.append({
            "raw_id": raw_id,
            "agency": "기업마당",
            "title": _pick(it, "pblancNm", "title", default="(제목 없음)"),
            "summary": _pick(it, "bsnsSumryCn", "summary", default=""),
            "url": _pick(it, "pblancUrl", "url", default="https://www.bizinfo.go.kr/"),
            "published_at": _parse_date(_pick(it, "creatDt", "regDt")),
            "deadline": _parse_date(_pick(it, "reqstEndDe", "reqstEnddate")),
            "max_support_amount": _pick(it, "sprtScl", default=None),
            "raw_eligibility_text": str(eligibility),
        })
    return out


def fetch_kocca() -> list[dict]:
    if not settings.kocca_api_key:
        logger.info("KOCCA_API_KEY not configured — skipping KOCCA collection")
        return []

    try:
        resp = httpx.get(
            KOCCA_URL,
            params={
                "serviceKey": settings.kocca_api_key,
                "pageNo": 1,
                "numOfRows": 50,
                "type": "json",
            },
            timeout=15,
        )
        resp.raise_for_status()
        payload = resp.json()
    except Exception as e:
        logger.warning("KOCCA fetch failed: %s", e)
        return []

    raw_items = _pick(payload, "data", "items", default=[]) or _pick(
        payload.get("response", {}) if isinstance(payload, dict) else {}, "body", default={}
    ).get("items", [])
    if isinstance(raw_items, dict):
        raw_items = raw_items.get("item", [])

    out = []
    for it in raw_items:
        raw_id = str(_pick(it, "bsnsNo", "id", "seq", default=""))
        if not raw_id:
            continue
        eligibility = _pick(it, "cn", "content", default="")
        out.append({
            "raw_id": raw_id,
            "agency": "한국콘텐츠진흥원",
            "title": _pick(it, "title", "게시물제목", default="(제목 없음)"),
            "summary": _pick(it, "cn", "content", default=""),
            "url": _pick(it, "url", "link", default="https://www.kocca.kr/"),
            "published_at": _parse_date(_pick(it, "regDt", "regDate")),
            "deadline": _parse_date(_pick(it, "rcptEndDe", "receiptEndDate")),
            "max_support_amount": None,
            "raw_eligibility_text": str(eligibility),
        })
    return out


# GOKAMS: 의도적으로 fetch 함수 없음 — 위 모듈 docstring의 TODO 참고.

SOURCE_FETCHERS = {
    "K-Startup": fetch_kstartup,
    "기업마당": fetch_bizinfo,
    "한국콘텐츠진흥원": fetch_kocca,
}

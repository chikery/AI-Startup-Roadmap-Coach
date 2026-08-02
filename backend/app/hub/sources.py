"""수집 소스 — K-Startup(공식 API) / 기업마당·KOCCA(공개 목록 페이지 크롤링).

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

기업마당·KOCCA는 공식 오픈API가 없다(예전 구현은 존재하지 않는 API를 가정하고
있었다 — 아래 각 함수 docstring 참고). 오픈소스 조사 도구 ir-search
(https://github.com/djfksjd/ir-search, MIT)가 세 기관 모두를 실제 라이브
호출로 검증해둔 필드명·엔드포인트를 그대로 참고해 재작성했고, 기업마당·KOCCA
파싱 정규식은 2026-08-01 라이브 응답으로 직접 재검증했다. K-Startup 응답
필드명(snake_case 후보)도 ir-search 근거로 교체했지만, 실 서비스키로
라이브 검증은 아직 못 했다 — 첫 실 수집 때 `_pick()` 후보를 다시 점검할 것.
"""

import html as htmllib
import logging
import re
import xml.etree.ElementTree as ET
from datetime import date, datetime
from email.utils import parsedate_to_datetime
from typing import Any, Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

KSTARTUP_URL = "https://apis.data.go.kr/B552735/kisedKstartupService01/getAnnouncementInformation01"
BIZINFO_LIST_URL = "https://www.bizinfo.go.kr/sii/siia/selectSIIA200View.do"
BIZINFO_DETAIL_URL = "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId={id}"
KOCCA_LIST_URL = "https://www.kocca.kr/kocca/pims/list.do"
KOCCA_DETAIL_URL = "https://www.kocca.kr/kocca/pims/view.do?intcNo={id}"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.4 Safari/605.1.15"
)


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


def _clean(s: str) -> str:
    return re.sub(r"\s+", " ", htmllib.unescape(s or "")).strip()


def _norm_date_str(s: str) -> str:
    """'26.07.31', '2026-07-31 ~ 2026-08-18' 같은 표기를 YYYY-MM-DD로. 못 읽으면 원문 그대로."""
    s = _clean(s)
    m = re.search(r"(\d{4})[.\-/\s]+(\d{1,2})[.\-/\s]+(\d{1,2})", s)
    if m:
        return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    m = re.search(r"(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})", s)  # 26.07.31 (2자리 연도)
    if m:
        return f"20{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    return s


def _split_period(s: str) -> tuple[str, str]:
    parts = re.split(r"~|∼|～", s)
    if len(parts) == 2:
        return _norm_date_str(parts[0]), _norm_date_str(parts[1])
    return "", _norm_date_str(s)


def fetch_kstartup() -> list[dict]:
    """K-Startup 공식 오픈API(data.go.kr).

    필드명은 ir-search(kstartup_api.py, MIT)가 실 서비스키로 검증해둔
    snake_case 후보를 그대로 채택 — 우리 이전 구현의 camelCase 추측은 근거가
    없었다. 응답에 상세 URL이 없으면(자주 있는 일) `pbanc_sn`으로 K-Startup
    공고 상세 URL을 직접 조립한다 — 이게 없으면 모든 공고가 K-Startup 홈으로만
    연결되는 문제(하드코딩 폴백)가 생긴다.
    """
    if not settings.kstartup_api_key:
        logger.info("KSTARTUP_API_KEY not configured — skipping K-Startup collection")
        return []

    try:
        resp = httpx.get(
            KSTARTUP_URL,
            params={
                "serviceKey": settings.kstartup_api_key,
                "page": 1,
                "perPage": 100,
                "returnType": "json",
            },
            headers={"User-Agent": UA},
            timeout=15,
        )
        resp.raise_for_status()
        payload = resp.json()
    except Exception as e:
        logger.warning("K-Startup fetch failed: %s", e)
        return []

    if not isinstance(payload, dict):
        return []

    raw_items: Any = None
    if isinstance(payload.get("data"), list):
        raw_items = payload["data"]
    elif isinstance(payload.get("items"), list):
        raw_items = payload["items"]
    else:
        body = (payload.get("response") or {}).get("body") if isinstance(payload.get("response"), dict) else None
        if isinstance(body, dict):
            items = body.get("items")
            if isinstance(items, dict):
                item = items.get("item")
                raw_items = item if isinstance(item, list) else ([item] if isinstance(item, dict) else [])
            elif isinstance(items, list):
                raw_items = items
    if raw_items is None:
        return []

    out = []
    for it in raw_items:
        if not isinstance(it, dict):
            continue
        raw_id = str(_pick(it, "pbanc_sn", "biz_pbanc_sn", "pbancSn", default=""))
        if not raw_id:
            continue
        eligibility = _pick(it, "supt_biz_clsfc", "pbanc_ctnt", "aplyTrgtCn", default="")

        url = _pick(it, "detl_pg_url", "pbanc_url", "pblancUrl", "url", default="")
        if not url or "k-startup.go.kr" not in url:
            url = f"https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn={raw_id}"

        out.append({
            "raw_id": raw_id,
            "agency": "K-Startup",
            "title": _pick(it, "biz_pbanc_nm", "pbanc_nm", "pbancNm", default="(제목 없음)"),
            "summary": _pick(it, "pbanc_ctnt", "bsnsSumryCn", default=""),
            "url": url,
            "published_at": _parse_date(_pick(it, "pbanc_rcpt_bgng_dt", "rcpt_bgng_dt", "creatPnttm")),
            "deadline": _parse_date(_pick(it, "pbanc_rcpt_end_dt", "pbanc_end_dt", "rcpt_end_dt")),
            "max_support_amount": _pick(it, "sprt_scl", "sprtScl", default=None),
            "raw_eligibility_text": str(eligibility),
        })
    return out


def fetch_bizinfo() -> list[dict]:
    """기업마당(bizinfo.go.kr) — 공식 오픈API가 없다(이전 구현이 호출하던
    `uss/rss/bizinfoApi.do`는 존재하지 않는 엔드포인트였다). 목록 페이지를
    직접 파싱한다 — 로그인·비공개 영역 없이 공개된 공고 목록만 조회.

    행 구조(ir-search sources_crawl.py 기준, 2026-08-01 라이브 응답으로
    직접 재검증): 번호 / 분야 / 제목+링크(pblancId) / 신청기간 / 부처 / 기관 /
    등록일 / 조회수.
    """
    try:
        resp = httpx.get(
            BIZINFO_LIST_URL,
            params={"rows": 15, "cpage": 1, "schEndAt": "N"},
            headers={"User-Agent": UA},
            timeout=15,
        )
        resp.raise_for_status()
        h = resp.text
    except Exception as e:
        logger.warning("기업마당 fetch failed: %s", e)
        return []

    out = []
    for row in re.findall(r"<tr>[\s\S]*?</tr>", h):
        m = re.search(r'href\s*=\s*"([^"]*pblancId=(PBLN_\d+)[^"]*)"[^>]*>\s*([\s\S]*?)</a>', row)
        if not m:
            continue
        raw_id = m.group(2)
        tds = [_clean(re.sub(r"<[^>]+>", " ", td)) for td in re.findall(r"<td[^>]*>([\s\S]*?)</td>", row)]
        field = tds[1] if len(tds) > 1 else ""
        _start, end = _split_period(tds[3]) if len(tds) > 3 else ("", "")
        org = " / ".join(x for x in tds[4:6] if x) if len(tds) > 5 else ""
        reg_date = tds[6] if len(tds) > 6 else ""

        out.append({
            "raw_id": raw_id,
            "agency": "기업마당",
            "title": _clean(m.group(3)),
            "summary": field,
            "url": BIZINFO_DETAIL_URL.format(id=raw_id),
            "published_at": _parse_date(reg_date),
            "deadline": _parse_date(end),
            "max_support_amount": None,
            "raw_eligibility_text": f"{field} {org}".strip(),
        })
    return out


def fetch_kocca() -> list[dict]:
    """KOCCA(한국콘텐츠진흥원) — 공식 오픈API가 없다(이전 구현이 호출하던
    `apis.data.go.kr/B551014/CTCA_A_01/CTCA_A_01`는 실제 서비스 경로가 아니었다).
    목록 페이지가 페이지네이션을 GET 쿼리가 아니라 POST 폼 제출로 처리한다.

    행 구조(ir-search sources_crawl.py 기준, 2026-08-01 라이브 응답으로
    직접 재검증): 분야 / 제목+링크(intcNo) / 접수기간(data-label) / 공고일(data-label).
    """
    try:
        resp = httpx.post(
            KOCCA_LIST_URL,
            data={"menuNo": "204104", "pageIndex": "1"},
            headers={"User-Agent": UA},
            timeout=15,
        )
        resp.raise_for_status()
        h = resp.text
    except Exception as e:
        logger.warning("KOCCA fetch failed: %s", e)
        return []

    out = []
    for row in re.findall(r"<tr>[\s\S]*?</tr>", h):
        m = re.search(r'href="(/kocca/pims/view\.do\?intcNo=([^&"]+)[^"]*)"[^>]*>([\s\S]*?)</a>', row)
        if not m:
            continue
        raw_id = m.group(2)
        cat = re.search(r'<span class="category_color\d+">([^<]+)</span>', row)
        period = re.search(r'data-label="접수기간">\s*([^<]+)', row)
        notice = re.search(r'data-label="공고일">\s*([^<]+)', row)
        _start, end = _split_period(period.group(1)) if period else ("", "")
        category = _clean(cat.group(1)) if cat else ""

        out.append({
            "raw_id": raw_id,
            "agency": "한국콘텐츠진흥원",
            "title": _clean(m.group(3)),
            "summary": category,
            "url": KOCCA_DETAIL_URL.format(id=raw_id),
            "published_at": _parse_date(_norm_date_str(notice.group(1))) if notice else None,
            "deadline": _parse_date(end),
            "max_support_amount": None,
            "raw_eligibility_text": category,
        })
    return out


# GOKAMS: 의도적으로 fetch 함수 없음 — 위 모듈 docstring의 TODO 참고.

SOURCE_FETCHERS = {
    "K-Startup": fetch_kstartup,
    "기업마당": fetch_bizinfo,
    "한국콘텐츠진흥원": fetch_kocca,
}


def _fetch_wordpress_rss(url: str, agency: str) -> list[dict]:
    """워드프레스 표준 RSS(title/link/pubDate/category)를 쓰는 매체 공용 파서.
    라이브로 확인(2026-08-01): 플래텀·벤처스퀘어·바이라인네트워크 전부 이 구조.
    마감일 개념이 없는 뉴스라 deadline/max_support_amount는 항상 None."""
    try:
        resp = httpx.get(url, headers={"User-Agent": UA}, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        root = ET.fromstring(resp.text)
    except Exception as e:
        logger.warning("%s RSS fetch failed: %s", agency, e)
        return []

    out = []
    for item in root.findall(".//item"):
        link = (item.findtext("link") or "").strip()
        title = (item.findtext("title") or "").strip()
        if not link or not title:
            continue
        published_at = None
        pub_raw = item.findtext("pubDate")
        if pub_raw:
            try:
                published_at = parsedate_to_datetime(pub_raw).date()
            except (ValueError, TypeError):
                published_at = None
        categories = [c.text.strip() for c in item.findall("category") if c.text and c.text.strip()]

        out.append({
            "raw_id": link,
            "agency": agency,
            "title": title,
            "summary": ", ".join(categories),
            "url": link,
            "published_at": published_at,
            "deadline": None,
            "max_support_amount": None,
            "raw_eligibility_text": f"{title} {' '.join(categories)}",
        })
    return out


def fetch_platum() -> list[dict]:
    return _fetch_wordpress_rss("https://platum.kr/feed", "플래텀")


def fetch_venturesquare() -> list[dict]:
    return _fetch_wordpress_rss("https://www.venturesquare.net/feed", "벤처스퀘어")


def fetch_byline() -> list[dict]:
    return _fetch_wordpress_rss("https://byline.network/feed", "바이라인네트워크")


NEWS_SOURCE_FETCHERS = {
    "플래텀": fetch_platum,
    "벤처스퀘어": fetch_venturesquare,
    "바이라인네트워크": fetch_byline,
}

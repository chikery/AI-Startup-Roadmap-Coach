from datetime import date, timedelta

from app.hub import tagging, sources
from app.hub.collector import collect_gov_support, deactivate_expired
from app.models.hub_item import HubItem


# ---- 1. 태깅 정확도 (기관별 대표 원문) ----

def test_tag_item_kstartup_style_regex_confident():
    tags = tagging.tag_item(
        title="2026년 예비창업패키지 모집공고",
        summary="혁신적인 기술 아이디어를 보유한 예비창업자에게 사업화 자금을 지원합니다.",
        eligibility_text="만 39세 이하 예비창업자, 기술/IT 분야 우대, 자금조달 지원사업",
    )
    assert tags["eligible_age_max"] == 39
    assert "기술/IT" in tags["eligible_categories"]
    assert 5 in tags["eligible_steps"]  # "자금조달 지원사업" 키워드


def test_tag_item_bizinfo_style_no_age_limit():
    tags = tagging.tag_item(
        title="콘텐츠 스타트업 판로 지원사업",
        summary="콘텐츠 분야 스타트업의 해외진출과 판로 확대를 지원합니다.",
        eligibility_text="업력 제한 없음, 콘텐츠 분야",
    )
    assert tags["eligible_age_max"] is None
    assert "콘텐츠" in tags["eligible_categories"]
    assert 7 in tags["eligible_steps"]  # "해외진출" 키워드


def test_tag_item_falls_back_to_llm_when_ambiguous(monkeypatch):
    called = {}

    def fake_llm(text, need_categories, need_steps, need_age):
        called["hit"] = True
        return {"categories": ["소셜임팩트"], "steps": [1], "age_max": 45}

    monkeypatch.setattr(tagging, "_llm_classify", fake_llm)

    tags = tagging.tag_item(
        title="사회 초년생 대상 프로그램",
        summary="특정 나이대 창업자를 위한 프로그램입니다.",  # 정규식으로 분야/단계 확정 불가
        eligibility_text="만 45세까지 참여 가능",  # 표준 "이하/미만" 패턴과 달라 나이도 애매
    )
    assert called.get("hit") is True
    assert tags["eligible_categories"] == ["소셜임팩트"]
    assert tags["eligible_steps"] == [1]
    assert tags["eligible_age_max"] == 45


# ---- 2. 중복 수집 방지 (raw_source_id unique) ----

def test_dedup_via_raw_source_id_unique(db, monkeypatch):
    raw_item = {
        "raw_id": "12345",
        "agency": "K-Startup",
        "title": "테스트 공고",
        "summary": "설명",
        "url": "https://www.k-startup.go.kr/test",
        "published_at": date.today(),
        "deadline": date.today() + timedelta(days=30),
        "max_support_amount": "최대 1억원",
        "raw_eligibility_text": "예비창업자",
    }
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "K-Startup", lambda: [raw_item])
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "기업마당", lambda: [])
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "한국콘텐츠진흥원", lambda: [])

    collect_gov_support(db)
    collect_gov_support(db)  # 동일 raw_id로 재수집

    rows = db.query(HubItem).filter(HubItem.raw_source_id == "12345").all()
    assert len(rows) == 1


# ---- 3. 마감 지난 공고 자동 비활성화 ----

def test_deactivate_expired(db):
    expired = HubItem(
        source_type="gov_support", agency="K-Startup", title="마감된 공고",
        url="https://example.com", raw_source_id="expired-1",
        deadline=date.today() - timedelta(days=1), is_active=True,
    )
    active = HubItem(
        source_type="gov_support", agency="K-Startup", title="진행 중 공고",
        url="https://example.com", raw_source_id="active-1",
        deadline=date.today() + timedelta(days=10), is_active=True,
    )
    no_deadline = HubItem(
        source_type="gov_support", agency="K-Startup", title="상시 공고",
        url="https://example.com", raw_source_id="none-1",
        deadline=None, is_active=True,
    )
    db.add_all([expired, active, no_deadline])
    db.commit()

    deactivated = deactivate_expired(db)

    assert deactivated == 1
    db.refresh(expired)
    db.refresh(active)
    db.refresh(no_deadline)
    assert expired.is_active is False
    assert active.is_active is True
    assert no_deadline.is_active is True


# ---- 4. 관리자 트리거 인증 ----

def test_collect_endpoint_rejects_missing_key(client):
    res = client.post("/hub/collect")
    assert res.status_code == 401


def test_collect_endpoint_rejects_wrong_key(client):
    res = client.post("/hub/collect", headers={"X-Hub-Collector-Key": "wrong"})
    assert res.status_code == 401


def test_collect_endpoint_accepts_correct_key(client, monkeypatch):
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "K-Startup", lambda: [])
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "기업마당", lambda: [])
    monkeypatch.setitem(sources.SOURCE_FETCHERS, "한국콘텐츠진흥원", lambda: [])

    res = client.post("/hub/collect", headers={"X-Hub-Collector-Key": "test-collector-key"})
    assert res.status_code == 200
    assert res.json()["ok"] is True


def test_get_items_only_returns_active(db, client):
    db.add(HubItem(
        source_type="gov_support", agency="K-Startup", title="활성 공고",
        url="https://example.com", raw_source_id="a1", is_active=True,
        eligible_steps=[1], published_at=date.today(),
    ))
    db.add(HubItem(
        source_type="gov_support", agency="K-Startup", title="비활성 공고",
        url="https://example.com", raw_source_id="a2", is_active=False,
        eligible_steps=[1],
    ))
    db.commit()

    res = client.get("/hub/items", params={"source_type": "gov_support"})
    assert res.status_code == 200
    titles = [i["title"] for i in res.json()["items"]]
    assert "활성 공고" in titles
    assert "비활성 공고" not in titles

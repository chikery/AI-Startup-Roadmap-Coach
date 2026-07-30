from app.api import ai as ai_module


def _register(client, email="sec-test@example.com", password="longenough1"):
    return client.post("/auth/register", json={"email": email, "password": password, "name": "테스트"})


# ---- 비밀번호 최소 길이 ----

def test_register_rejects_short_password(client):
    res = _register(client, password="short1")
    assert res.status_code == 422


def test_register_accepts_valid_password(client):
    res = _register(client)
    assert res.status_code == 200
    assert "access_token" in res.json()


# ---- 토큰 재발급 ----

def test_refresh_returns_new_token_for_valid_session(client):
    token = _register(client, email="refresh-ok@example.com").json()["access_token"]
    res = client.post("/auth/refresh", params={"token": token})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_refresh_rejects_invalid_token(client):
    res = client.post("/auth/refresh", params={"token": "not-a-real-token"})
    assert res.status_code == 401


# ---- 레이트리밋 ----

def test_business_plan_rate_limit_triggers(client, monkeypatch):
    class FakeChoice:
        message = type("M", (), {"content": "사업계획서 초안"})()

    class FakeResponse:
        choices = [FakeChoice()]

    monkeypatch.setattr(
        ai_module.client.chat.completions, "create",
        lambda **kwargs: FakeResponse(),
    )

    body = {"token": "irrelevant", "all_content": {"1": {"target": "테스트 고객"}}}
    statuses = [client.post("/ai/business-plan", json=body).status_code for _ in range(11)]

    assert statuses[:10] == [200] * 10
    assert statuses[10] == 429

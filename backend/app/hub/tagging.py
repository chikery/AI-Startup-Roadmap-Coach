"""공고 원문을 고정된 태그 체계(단계 1~7 / 분야 / 연령 상한)로 정형화한다.

정규식으로 확실히 판단되는 것만 1차로 뽑고, 남는(애매한) 필드만 기존
OpenAI/Solar 클라이언트로 분류한다 — 새 NLP 의존성을 추가하지 않는다.
"""

import json
import logging
import re
from typing import Optional

from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

# frontend/app/programs/page.tsx의 CATEGORIES와 동일하게 유지할 것
CATEGORIES = ["문화예술", "콘텐츠", "공예", "소셜임팩트", "기술/IT", "기타"]

CATEGORY_KEYWORDS = {
    "문화예술": ["문화예술", "예술", "공연", "미술", "전시"],
    "콘텐츠": ["콘텐츠", "영상", "미디어", "게임", "웹툰", "방송"],
    "공예": ["공예", "수공예", "핸드메이드"],
    "소셜임팩트": ["소셜", "사회적기업", "임팩트", "사회공헌"],
    "기술/IT": ["기술", "IT", "테크", "딥테크", "AI", "인공지능", "소프트웨어"],
}

# 7단계: 아이디어스파크/예술적비전/시장적합성/재무지도/투자유치/팀빌딩/런칭데이
STEP_KEYWORDS = {
    1: ["문제 발견", "아이디어 검증", "고객 정의"],
    2: ["차별화", "브랜드", "예술적 비전", "독창성"],
    3: ["시장", "경쟁사", "TAM", "SAM", "SOM"],
    4: ["재무", "수익", "비즈니스 모델", "단위경제"],
    5: ["자금", "투자", "지원사업", "정책자금", "예비창업", "창업사업화"],
    6: ["팀", "인력", "고용", "채용", "멘토"],
    7: ["IR", "데모데이", "피치", "런칭", "판로", "수출", "해외진출"],
}

_AGE_PATTERN = re.compile(r"만?\s*(\d{1,2})\s*세\s*(이하|미만)")


def _regex_categories(text: str) -> Optional[list]:
    hits = [cat for cat, kws in CATEGORY_KEYWORDS.items() if any(kw in text for kw in kws)]
    return hits or None


def _regex_age_max(text: str) -> Optional[int]:
    m = _AGE_PATTERN.search(text)
    if not m:
        return None
    n = int(m.group(1))
    return n - 1 if m.group(2) == "미만" else n


def _regex_steps(text: str) -> Optional[list]:
    hits = [step for step, kws in STEP_KEYWORDS.items() if any(kw in text for kw in kws)]
    return hits or None


def _llm_classify(text: str, need_categories: bool, need_steps: bool, need_age: bool) -> dict:
    use_solar = bool(settings.solar_api_key and settings.solar_api_key != "your-solar-api-key-here")
    try:
        if use_solar:
            classify_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")
            model = "solar-pro"
        else:
            classify_client = OpenAI(api_key=settings.openai_api_key)
            model = "gpt-4o-mini"

        prompt = f"""다음 창업 지원사업 공고 원문을 분류하세요.

원문:
{text[:1500]}

아래 JSON 형식으로만 답하세요. 다른 설명 없이 JSON만 출력하세요.
{{
  "categories": [지원 분야 — {CATEGORIES} 중에서만 0개 이상 선택],
  "steps": [관련 창업 단계 — 1~7 중에서만 0개 이상 선택. 1=문제발견 2=차별화/비전 3=시장검증 4=재무/비즈니스모델 5=자금조달/지원사업 6=팀빌딩 7=런칭/IR],
  "age_max": (연령 상한이 명시돼 있으면 정수, 없으면 null)
}}"""
        response = classify_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=200,
        )
        raw = response.choices[0].message.content or "{}"
        raw = re.sub(r"^```json\s*|\s*```$", "", raw.strip())
        data = json.loads(raw)
        return {
            "categories": [c for c in data.get("categories", []) if c in CATEGORIES],
            "steps": [s for s in data.get("steps", []) if isinstance(s, int) and 1 <= s <= 7],
            "age_max": data.get("age_max"),
        }
    except Exception as e:
        logger.warning("hub tagging LLM classify failed, defaulting to empty: %s", e)
        return {"categories": [], "steps": [], "age_max": None}


def tag_item(title: str, summary: str, eligibility_text: str) -> dict:
    text = f"{title}\n{summary}\n{eligibility_text}"

    categories = _regex_categories(text)
    steps = _regex_steps(text)
    age_max = _regex_age_max(text)
    # "세"가 텍스트에 있는데 표준 패턴("만 N세 이하/미만")으로 못 뽑았다면 — 다른 표현일 수 있으니 LLM에 재확인
    age_ambiguous = age_max is None and "세" in text

    need_categories = categories is None
    need_steps = steps is None
    need_age = age_ambiguous

    if need_categories or need_steps or need_age:
        llm_result = _llm_classify(text, need_categories, need_steps, need_age)
        if need_categories:
            categories = llm_result["categories"]
        if need_steps:
            steps = llm_result["steps"]
        if need_age:
            age_max = llm_result["age_max"]

    return {
        "eligible_categories": categories or [],
        "eligible_steps": steps or [],
        "eligible_age_max": age_max,
    }

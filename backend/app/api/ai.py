from fastapi import APIRouter, HTTPException
from openai import OpenAI
from app.schemas.roadmap import AIDraftRequest
from app.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])
client = OpenAI(api_key=settings.openai_api_key)

STEP_PROMPTS = {
    1: """창업 아이템: {item_keyword}

TPCS 프레임워크로 초안을 JSON 형식으로 작성해주세요:
{{
  "target": "목표 고객 (1~2문장)",
  "problem": "고객이 겪는 핵심 문제 (1~2문장)",
  "cause": "문제의 근본 원인 3가지 (배열)",
  "solution": "제안하는 솔루션 (2~3문장)",
  "why_analysis": ["1차 원인", "2차 원인", "3차 원인"]
}}""",

    2: """창업 아이템: {item_keyword}
이전 단계 내용: {context}

잠재고객 프로파일과 시장 리서치 방향을 JSON으로 작성해주세요:
{{
  "customer_profile": {{
    "age_range": "나이대",
    "occupation": "직업/역할",
    "pain_points": ["불편함1", "불편함2", "불편함3"],
    "goals": ["목표1", "목표2"]
  }},
  "research_platforms": ["네이버 데이터랩", "썸트렌드", "기타 추천 플랫폼"],
  "ai_research_prompt": "시장 조사용 AI 프롬프트 예시 텍스트"
}}""",

    3: """창업 아이템: {item_keyword}
고객 정보: {context}

고객 인터뷰 설계를 JSON으로 작성해주세요:
{{
  "hypotheses": ["가설1: 우리 고객은 ___", "가설2", ...(9개)],
  "interview_questions": {{
    "general": ["일반 질문1", "일반 질문2", "일반 질문3"],
    "deep_dive": ["심층 질문1", "심층 질문2", "심층 질문3"]
  }},
  "persona": {{
    "name": "페르소나 이름",
    "description": "한 줄 설명"
  }}
}}""",

    4: """창업 아이템: {item_keyword}
이전 내용: {context}

MVP 테스트 설계를 JSON으로 작성해주세요:
{{
  "hypothesis": "핵심 가치 중심 가설",
  "success_criteria": "수치적 성공 기준",
  "recommended_tools": [
    {{"tool": "도구명", "reason": "추천 이유", "url": "링크"}}
  ],
  "test_plan": "테스트 실행 계획 (2~3문장)"
}}""",

    5: """창업 아이템: {item_keyword}
이전 내용: {context}

시장 및 경쟁사 분석을 JSON으로 작성해주세요:
{{
  "market_size": {{
    "TAM": "전체 시장 규모 추정",
    "SAM": "유효 시장 규모",
    "SOM": "목표 시장 규모",
    "formula_hint": "예상고객수 × 구매가격 × 구매횟수 기반 추정 방법"
  }},
  "competitors": [
    {{"name": "경쟁사A", "strength": "강점", "weakness": "약점"}},
    {{"name": "경쟁사B", "strength": "강점", "weakness": "약점"}}
  ],
  "swot": {{
    "S": ["강점1", "강점2"],
    "W": ["약점1", "약점2"],
    "O": ["기회1", "기회2"],
    "T": ["위협1", "위협2"]
  }},
  "strategy_comments": "SO/WT/WO/ST 전략 방향 코멘트"
}}""",

    6: """창업 아이템: {item_keyword}
이전 내용: {context}

비즈니스 모델 캔버스 9개 블록을 JSON으로 작성해주세요:
{{
  "customer_segments": "목표 고객",
  "value_propositions": "핵심 가치",
  "channels": "유통 채널",
  "customer_relationships": "고객 관계",
  "revenue_streams": "수익 구조",
  "key_resources": "핵심 자원",
  "key_activities": "핵심 활동",
  "key_partnerships": "핵심 파트너",
  "cost_structure": "비용 구조",
  "checklist": {{
    "revenue_clarity": true,
    "scalability": true,
    "competitive_advantage": true
  }},
  "feedback": "모순되거나 보완이 필요한 부분 코멘트"
}}""",

    7: """창업 아이템: {item_keyword}
전체 단계 내용: {context}

피치덱 10개 섹션 초안을 JSON으로 작성해주세요:
{{
  "sections": [
    {{"title": "배경", "content": "..."}},
    {{"title": "문제", "content": "..."}},
    {{"title": "MVP 결과", "content": "..."}},
    {{"title": "해결방안", "content": "..."}},
    {{"title": "경쟁현황", "content": "..."}},
    {{"title": "시장분석", "content": "..."}},
    {{"title": "비즈니스모델", "content": "..."}},
    {{"title": "향후전략", "content": "..."}},
    {{"title": "팀소개", "content": "..."}},
    {{"title": "마무리", "content": "..."}}
  ],
  "qa_list": [
    {{"question": "예상 질문1", "answer": "답변 방향"}},
    {{"question": "예상 질문2", "answer": "답변 방향"}}
  ]
}}"""
}


@router.post("/generate")
def generate_draft(body: AIDraftRequest):
    if body.step not in STEP_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    prompt = STEP_PROMPTS[body.step].format(
        item_keyword=body.item_keyword,
        context=str(body.context) if body.context else "없음",
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "당신은 창업 전문 코치입니다. JSON 형식으로만 응답하세요."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        import json
        draft = json.loads(response.choices[0].message.content)
        return {"step": body.step, "draft": draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

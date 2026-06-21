from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.roadmap import AIDraftRequest
from app.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])
client = OpenAI(api_key=settings.openai_api_key)
solar_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    step: Optional[int] = None


# ── AI 초안 생성 프롬프트 (OpenAI) ────────────────────────────────────────
STEP_PROMPTS = {
    1: """당신은 StepUp AI 창업 코치입니다. 아래 창업 아이템을 기반으로 TPCS 프레임워크 초안을 JSON으로 작성하세요.
린 스타트업 관점에서 '의견'이 아닌 '검증 가능한 가설'로 작성하고, 각 항목은 구체적이고 간결하게 1~3문장으로 씁니다.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "target": "이 문제를 겪는 구체적인 페르소나 (나이대·상황·맥락 포함, 1~2문장)",
  "problem": "고객이 겪는 가장 고통스러운 핵심 문제 (구체적으로, 1~2문장)",
  "cause": "문제의 근본 원인 — 왜 지금껏 해결되지 않았는가 (1~2문장)",
  "solution": "혁신적 해결책과 차별점 (2~3문장)"
}}""",

    2: """당신은 StepUp AI 창업 코치입니다. 아이템의 예술적·독창적 비전을 비전 캔버스 형식으로 JSON으로 작성하세요.
'예쁘다'가 아니라 '왜 지금 이것이 필요한가'를 시장의 언어로 번역합니다.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "core_value": "당신의 작업이 추구하는 단 하나의 핵심 가치 (1문장)",
  "originality": "경쟁자가 따라오기 어려운 독창적 강점 (1~2문장)",
  "aesthetic": "브랜드 톤앤매너와 미학 방향을 한마디로 (1문장)",
  "relevance": "이 비전이 지금 시장에서 갖는 의미와 타이밍 (1~2문장)"
}}""",

    3: """당신은 StepUp AI 창업 코치입니다. 시장 분석 초안을 JSON으로 작성하세요.
'전체 시장이 크다'는 주장 대신 먼저 압도적으로 장악할 수 있는 작은 틈새 시장부터 정의합니다.
모든 금액은 반드시 한국 원(만 원, 억 원) 단위로 표기하세요. USD 등 외화 단위는 절대 사용하지 마세요.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "tam": "전체 시장(TAM) 규모 추정과 근거 (숫자 포함, 원 단위)",
  "sam": "유효 시장(SAM) — 실제 타겟 가능한 범위와 규모 (원 단위)",
  "som": "목표 시장(SOM) — 3년 내 현실적으로 점유 가능한 비율·금액과 근거 (원 단위)",
  "competitive_edge": "주요 경쟁사 대비 핵심 차별점과 우위 (구체적으로)"
}}""",

    4: """당신은 StepUp AI 창업 코치입니다. 수익 모델 초안을 JSON으로 작성하세요.
수익 모델은 한 가지를 깊게 파고, 단위 경제학으로 지속 가능성을 검증합니다.
모든 금액은 반드시 한국 원(만 원, 억 원) 단위로 표기하세요. USD 등 외화 단위는 절대 사용하지 마세요.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "revenue": "주요 수익원과 발생 방식 (구독/수수료/판매 등, 1~2문장)",
  "pricing": "가격 전략과 근거 (경쟁사·고객 지불 의향 기반, 원 단위, 1~2문장)",
  "cost": "주요 비용 구조 항목과 규모 (인건비·마케팅·개발·운영 등, 원 단위)",
  "unit_economics": "단위 경제 핵심 지표 (LTV, CAC, 마진, 손익분기점 시점, 원 단위)"
}}""",

    5: """당신은 StepUp AI 창업 코치입니다. 자금 계획 초안을 JSON으로 작성하세요.
자금 조달 전략과 지금 신청 가능한 정부 지원사업을 연결합니다.
모든 금액은 반드시 한국 원(만 원, 억 원) 단위로 표기하세요. USD 등 외화 단위는 절대 사용하지 마세요.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "funding_need": "총 소요 자금과 항목별 내역 (인건비/마케팅/개발/운영, 원 단위 금액 포함)",
  "funding_strategy": "자금 조달 전략 (정부지원/엔젤투자/자체수익 등, 단계별, 원 단위)",
  "milestone": "자금 소진 전까지 달성할 핵심 마일스톤 (수치 기반)",
  "matched_grants": "지금 신청 가능한 추천 지원사업명과 신청 시기 (예비창업패키지, 초기창업패키지, 예술인창업지원 등)"
}}""",

    6: """당신은 StepUp AI 창업 코치입니다. 팀 설계 초안을 JSON으로 작성하세요.
혼자라도 '내가 잘하는 것 + 채워야 할 것 + 채울 방법'이 명확하면 강점이 됩니다.

창업 아이템: {item_keyword}
이전 단계 내용: {context}

JSON 형식:
{{
  "roles": "사업에 필요한 핵심 역할 목록과 각 역할의 책임 (역할명: 책임 형태로)",
  "current_team": "현재 팀원 구성과 각자의 핵심 역량 (1인이면 창업자 역량 중심으로)",
  "gaps": "현재 팀에서 부족한 역할·역량과 충원 계획",
  "collaboration": "의사결정 방식과 협업 프로세스 (도구·주기·방식)"
}}""",

    7: """당신은 StepUp AI 창업 코치입니다. 피치덱 및 런칭 준비 초안을 JSON으로 작성하세요.
'왜 이 사업이 남다른가, 왜 지금인가, 왜 당신인가'를 3분 안에 설명할 수 있도록 구성합니다.
모든 금액은 반드시 한국 원(만 원, 억 원) 단위로 표기하세요. USD 등 외화 단위는 절대 사용하지 마세요.

창업 아이템: {item_keyword}
전체 단계 내용: {context}

JSON 형식:
{{
  "pitch_deck": "피치덱 핵심 흐름 요약 — 문제→솔루션→시장→팀→계획→비전 순서로 각 슬라이드 핵심 메시지",
  "qa": "심사위원 예상 질문 5개와 답변 방향 (질문: 답변 형태로)",
  "gtm": "출시 전략 — 첫 고객 획득 채널과 방법, 첫 100명 달성 계획",
  "kpi": "3개월·6개월·1년 핵심 지표 목표 (구체적 수치로)"
}}""",
}


# ── 챗봇 단계별 시스템 프롬프트 (Solar) ──────────────────────────────────
_COACH_BASE = """당신은 StepUp의 AI 창업 코치 '요다'입니다.
청년·문화예술 창업가와 함께 아이디어에서 사업계획서까지 완성해 나갑니다.

말투 규칙:
• 친근하고 따뜻한 구어체로 말하세요. 예: "그렇군요!", "좋아요, 같이 한번 파봐요!", "음, 그 부분이 좀 걸리네요."
• 너무 딱딱하거나 나열식으로 답하지 마세요. 대화하듯 자연스럽게 이어가세요.
• 답변은 3~5문장 이내로 핵심만 짚어주세요. 길게 설명하는 것보다 다음 질문으로 이어가는 게 더 좋아요.
• 마크다운 기호(**, ##, -, * 등)는 절대 쓰지 마세요. 일반 한국어 문장만 사용하세요.
• 근거 없는 낙관은 부추기지 마세요. 따뜻하지만 냉정한 시각을 유지하세요.
• 모든 금액은 한국 원(만 원, 억 원) 단위로 말하세요."""

STEP_CHAT_PROMPTS = {
    1: _COACH_BASE + """

지금 사용자는 STEP 1 — 문제 발견과 솔루션 단계에 있어요.
이 단계의 핵심은 "해결책에 먼저 반하지 말고, 문제가 진짜인지 먼저 확인하는 것"이에요.

이 단계에서 집중할 것들:
가족·친구의 호의적 반응은 데이터가 아니에요. 행동 증거가 있어야 해요.
"왜 지금 당신이 이 문제를 해결해야 하나요?"를 자연스럽게 물어보세요.
TPCS(Target·Problem·Cause·Solution) 흐름으로 정리를 도와주세요.""",

    2: _COACH_BASE + """

지금 사용자는 STEP 2 — 예술적 비전 단계에 있어요.
이 단계의 핵심은 "당신만의 예술적 강점을 시장의 언어로 번역하는 것"이에요.

이 단계에서 집중할 것들:
'예쁘다'가 아니라 '왜 지금 이게 필요한가'를 말하도록 이끌어주세요.
경쟁자가 따라오기 어려운 독창적 강점이 뭔지 구체적으로 캐물어보세요.
비전 캔버스(핵심가치·독창성·미학방향·시장적의미) 방향으로 생각을 정리하도록 도와주세요.""",

    3: _COACH_BASE + """

지금 사용자는 STEP 3 — 시장 적합성 단계에 있어요.
이 단계의 핵심은 "가설을 데이터로 바꿔 시장의 크기와 진입 지점을 증명하는 것"이에요.

이 단계에서 집중할 것들:
TAM·SAM·SOM 수치의 근거를 구체적으로 물어보세요.
"모두를 위한 제품"을 경계하고, 먼저 장악할 수 있는 작은 틈새 시장부터 정의하게 도와주세요.
숫자 없는 시장 분석은 설득력이 없다는 걸 부드럽게 짚어주세요.""",

    4: _COACH_BASE + """

지금 사용자는 STEP 4 — 재무 지도 단계에 있어요.
이 단계의 핵심은 "어떻게 돈을 벌고 언제 흑자로 전환하는지 설계하는 것"이에요.

이 단계에서 집중할 것들:
구독형·수수료형·판매형 중 하나를 깊게 파도록 유도해주세요.
LTV, CAC, 마진 같은 단위 경제학 개념을 쉽게 풀어서 설명하고 적용해보세요.
"언제 손익분기점에 도달하나요?"를 숫자로 대답하게 이끌어주세요.
모든 금액은 원화로 얘기해주세요.""",

    5: _COACH_BASE + """

지금 사용자는 STEP 5 — 투자 유치 단계에 있어요.
이 단계의 핵심은 "필요한 자금을 정의하고 지금 받을 수 있는 지원을 연결하는 것"이에요.

이 단계에서 집중할 것들:
막연한 "몇 억 필요해요" 대신 항목별로 왜, 어디에 쓰는지 구체적으로 물어보세요.
예비창업패키지·초기창업패키지·예술인창업지원 등 지금 신청 가능한 프로그램을 안내해주세요.
마일스톤과 자금 소진 계획이 자연스럽게 연결되도록 도와주세요.
모든 금액은 원화로 얘기해주세요.""",

    6: _COACH_BASE + """

지금 사용자는 STEP 6 — 팀 빌딩 단계에 있어요.
이 단계의 핵심은 "비전을 실행할 사람과 역할, 일하는 방식을 설계하는 것"이에요.

이 단계에서 집중할 것들:
혼자라도 괜찮아요. 내가 잘하는 것과 채워야 할 것이 명확하면 강점이에요.
핵심 역할 공백이 뭔지 파악하고, 언제 어떻게 채울지 함께 고민해보세요.
투자자와 심사위원은 팀의 실행력·보완성·신뢰를 본다는 걸 알려주세요.""",

    7: _COACH_BASE + """

지금 사용자는 STEP 7 — 런칭 데이 단계에 있어요.
이 단계의 핵심은 "6단계의 결과를 하나의 발표자료와 출시 계획으로 통합하는 것"이에요.

이 단계에서 집중할 것들:
3분 피치로 "왜 이 사업인가, 왜 지금인가, 왜 당신인가"를 답할 수 있게 다듬어주세요.
피치덱 흐름(문제→솔루션→시장→팀→계획→비전)이 자연스럽게 연결되는지 점검해주세요.
예상 Q&A로 약점을 미리 보완하도록 도와주세요.""",
}

DEFAULT_CHAT_PROMPT = _COACH_BASE + """

사용자가 창업 여정의 어느 단계에 있든 함께 고민해줄게요.
어떤 단계인지, 어떤 고민인지 먼저 물어보고, 그에 맞는 코칭을 자연스럽게 이어가세요."""


# ── 피드백 프롬프트 ───────────────────────────────────────────────────────
STEP_FEEDBACK_PROMPTS = {
    1: """아래는 창업자가 작성한 TPCS 프레임워크 내용입니다.

Target(고객): {target}
Problem(문제): {problem}
Cause(원인): {cause}
Solution(해결책): {solution}

린 스타트업 코치로서 이 내용을 검토하고 구체적인 피드백을 2~3문장으로 작성하세요.
잘된 점 1가지와 보완할 점 1~2가지를 콕 집어서 말하세요.
칭찬으로 시작하되 날카롭게 짚어주세요. 근거 없는 낙관은 부추기지 마세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    2: """아래는 창업자가 작성한 비전 캔버스 내용입니다.

핵심 가치: {core_value}
독창성: {originality}
미학 방향: {aesthetic}
시장적 의미: {relevance}

코치로서 이 비전이 시장에서 설득력 있는지 검토하고 2~3문장으로 피드백하세요.
'왜 당신이어야 하는가'에 대한 답이 명확한지 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    3: """아래는 창업자가 작성한 시장 분석 내용입니다.

TAM(전체 시장): {tam}
SAM(유효 시장): {sam}
SOM(점유 목표): {som}
경쟁 우위: {competitive_edge}

시장 분석 전문가로서 숫자의 근거와 경쟁 우위의 설득력을 검토하고 2~3문장으로 피드백하세요.
수치의 현실성과 경쟁사 대비 차별점이 명확한지 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    4: """아래는 창업자가 작성한 수익 모델 내용입니다.

수익원: {revenue}
가격 전략: {pricing}
비용 구조: {cost}
단위 경제: {unit_economics}

재무 코치로서 수익 구조의 지속 가능성을 검토하고 2~3문장으로 피드백하세요.
손익분기점 도달 가능성과 단위 경제의 현실성을 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    5: """아래는 창업자가 작성한 자금 계획 내용입니다.

소요 자금: {funding_need}
조달 전략: {funding_strategy}
마일스톤: {milestone}
추천 지원사업: {matched_grants}

투자 코치로서 자금 계획의 현실성을 검토하고 2~3문장으로 피드백하세요.
마일스톤과 자금 소진 계획의 연결고리, 지원사업 적합성을 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    6: """아래는 창업자가 작성한 팀 설계 내용입니다.

핵심 역할: {roles}
현재 팀: {current_team}
보완 영역: {gaps}
협업 방식: {collaboration}

팀 빌딩 코치로서 팀 구성의 실행 가능성을 검토하고 2~3문장으로 피드백하세요.
역할 공백의 심각성과 충원 계획의 구체성을 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    7: """아래는 창업자가 작성한 런칭 준비 내용입니다.

피치덱 핵심 흐름: {pitch_deck}
예상 Q&A: {qa}
출시 계획(GTM): {gtm}
핵심 지표(KPI): {kpi}

최종 코치로서 피치덱과 런칭 준비의 완성도를 검토하고 2~3문장으로 피드백하세요.
'왜 이 사업, 왜 지금, 왜 당신'에 대한 답변이 명확한지 집중적으로 짚어주세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",
}


class FeedbackRequest(BaseModel):
    step: int
    content: dict


@router.post("/feedback")
def generate_feedback(body: FeedbackRequest):
    if body.step not in STEP_FEEDBACK_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    template = STEP_FEEDBACK_PROMPTS[body.step]
    try:
        prompt = template.format(**{k: (v or "미작성") for k, v in body.content.items()})
    except KeyError:
        prompt = f"STEP {body.step} 작성 내용:\n{body.content}\n\n위 내용을 검토하고 2~3문장으로 구체적인 피드백을 주세요."

    try:
        response = solar_client.chat.completions.create(
            model="solar-pro",
            messages=[
                {"role": "system", "content": "당신은 StepUp의 AI 창업 코치 요다입니다. 날카롭지만 따뜻하게, 구체적이고 실용적인 피드백을 2~3문장으로 제공하세요. 한국어로만 답변하세요."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        return {"feedback": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 엔드포인트 ────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_draft(body: AIDraftRequest):
    if body.step not in STEP_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    prompt = STEP_PROMPTS[body.step].format(
        item_keyword=body.item_keyword,
        context=str(body.context) if body.context else "없음",
    )

    try:
        import json, re
        response = solar_client.chat.completions.create(
            model="solar-pro",
            messages=[
                {"role": "system", "content": (
                    "당신은 창업 전문 코치입니다. "
                    "반드시 유효한 JSON 객체만 응답하세요. "
                    "JSON 값에 줄바꿈이 필요하면 \\n 이스케이프를 사용하세요. "
                    "큰따옴표 안에 큰따옴표가 필요하면 \\\" 로 이스케이프하세요. "
                    "코드블록(```)이나 다른 텍스트는 절대 포함하지 마세요."
                )},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
        )
        raw = response.choices[0].message.content.strip()

        # 코드블록 제거
        if "```" in raw:
            raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()

        # { ... } 범위만 추출
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            raw = raw[start:end]

        def escape_strings(s: str) -> str:
            """문자열 값 내부의 리터럴 줄바꿈·탭·따옴표를 JSON 이스케이프로 변환."""
            result = []
            in_string = False
            escape_next = False
            for ch in s:
                if escape_next:
                    result.append(ch)
                    escape_next = False
                    continue
                if ch == '\\':
                    result.append(ch)
                    escape_next = True
                    continue
                if ch == '"':
                    in_string = not in_string
                    result.append(ch)
                    continue
                if in_string:
                    if ch == '\n':
                        result.append('\\n')
                        continue
                    if ch == '\r':
                        result.append('\\r')
                        continue
                    if ch == '\t':
                        result.append('\\t')
                        continue
                result.append(ch)
            return ''.join(result)

        try:
            draft = json.loads(raw)
        except json.JSONDecodeError:
            draft = json.loads(escape_strings(raw))

        return {"step": body.step, "draft": draft}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
def chat(body: ChatRequest):
    if not body.messages:
        raise HTTPException(status_code=400, detail="메시지가 없습니다")

    system_prompt = STEP_CHAT_PROMPTS.get(body.step, DEFAULT_CHAT_PROMPT) if body.step else DEFAULT_CHAT_PROMPT

    use_solar = bool(settings.solar_api_key and settings.solar_api_key != "your-solar-api-key-here")

    try:
        if use_solar:
            chat_client = OpenAI(
                api_key=settings.solar_api_key,
                base_url="https://api.upstage.ai/v1",
            )
            model = "solar-pro"
        else:
            chat_client = client
            model = "gpt-4o-mini"

        response = chat_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                *[{"role": m.role, "content": m.content} for m in body.messages],
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return {"message": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

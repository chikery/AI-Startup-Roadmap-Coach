import re
import json
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas.roadmap import AIDraftRequest
from app.config import settings

limiter = Limiter(key_func=get_remote_address)

MAX_DICT_JSON_CHARS = 20000  # 로드맵 단계 하나 분량 기준 넉넉한 상한 — 유료 LLM 호출 남용 방지용


def _size_validator(max_chars: int = MAX_DICT_JSON_CHARS):
    """field_validator에 꽂을 수 있는 (cls, v) 시그니처 검증기를 만들어 반환한다 —
    Pydantic v2가 필드 검증기를 classmethod로 감싸 (cls, value) 형태로 호출하기 때문."""
    def _validate(cls, v):
        if v is not None and len(json.dumps(v, ensure_ascii=False)) > max_chars:
            raise ValueError(f"입력이 너무 큽니다 (최대 {max_chars}자)")
        return v
    return _validate


def strip_markdown(text: str) -> str:
    text = re.sub(r'\*{1,3}(.+?)\*{1,3}', r'\1', text)   # **bold**, *italic*, ***both***
    text = re.sub(r'_{1,2}(.+?)_{1,2}', r'\1', text)      # __bold__, _italic_
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)  # # 제목
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)  # - 목록
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # 1. 번호 목록
    text = re.sub(r'`{1,3}(.+?)`{1,3}', r'\1', text, flags=re.DOTALL)  # `code`
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)        # [링크](url)
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)  # > 인용
    text = re.sub(r'\n{3,}', '\n\n', text)                 # 3줄 이상 공백 → 2줄
    return text.strip()

def _as_str_list(value) -> list:
    if isinstance(value, list):
        return [str(v) for v in value]
    if isinstance(value, str) and value.strip():
        return [value]
    return []


router = APIRouter(prefix="/ai", tags=["ai"])
client = OpenAI(api_key=settings.openai_api_key)
solar_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")


class ChatMessage(BaseModel):
    role: str
    content: str = Field(max_length=4000)

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(max_length=50)
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


# ── 방법론 참조 라이브러리 ───────────────────────────────────────────────
METHODOLOGY_REFS = {
    1: {
        "name": "린 스타트업 — 검증된 학습 원칙",
        "principles": """
[참조 방법론: 린 스타트업 (Eric Ries)]
핵심 원칙:
- "의견이 아닌 검증 가능한 가설로 시작하라" — 고객이 '분명 있을 것'이라는 추측은 데이터가 아님
- "가족·친구의 호의적 반응은 증거가 아님, 낯선 사람의 행동 변화가 증거임"
- TPCS에서 Target과 Problem의 연결이 구체적일수록 Solution의 설득력이 높아짐
- Problem 진술은 '고객이 현재 어떻게 해결하고 있는가'를 포함해야 함 (Jobs-to-be-Done 원칙)
""",
    },
    2: {
        "name": "블루오션 전략 — 가치 혁신 원칙",
        "principles": """
[참조 방법론: 블루오션 전략 (김위찬·르네 마보안) + Zero to One (피터 틸)]
핵심 원칙:
- "독창성은 '더 잘하는 것'이 아니라 '다르게 만드는 것'에서 나온다" (블루오션)
- "경쟁하지 말고 독점하라 — 차별점이 없으면 가격 경쟁만 남는다" (Zero to One)
- 브랜드 미학이 고객 행동으로 연결되는 고리(Relevance)가 없으면 예술이지 사업이 아님
- '우리만의 비밀(Secret)'이 있어야 함 — 경쟁자가 10년 후에도 따라오기 어려운 것
""",
    },
    3: {
        "name": "캐즘 이론 — 시장 진입 전략",
        "principles": """
[참조 방법론: Crossing the Chasm (제프리 무어) + 포터의 경쟁 우위론]
핵심 원칙:
- "전체 시장이 아닌 좁은 틈새를 먼저 장악하라 — 볼링 핀 전략" (Crossing the Chasm)
- TAM·SAM·SOM은 아래에서 위로 쌓는 것이 더 신뢰를 얻음 (SOM부터 구체적으로)
- 경쟁 우위는 비용 우위 또는 차별화 중 하나에 집중해야 함 (포터의 본원적 경쟁 전략)
- "모두를 위한 제품은 아무도 위한 제품이 아님" — 페르소나와 시장 진입점을 연결해야 함
""",
    },
    4: {
        "name": "단위 경제학 — 지속 가능한 수익 설계",
        "principles": """
[참조 방법론: Zero to One (피터 틸) + 린 스타트업 단위 경제학]
핵심 원칙:
- LTV > 3×CAC이어야 지속 가능한 사업 (업계 황금률)
- "수익 모델은 하나를 깊게 파라 — 복잡한 수익 구조는 초기 스타트업의 적" (Zero to One)
- 손익분기점 도달 시점을 숫자로 말할 수 없다면 아직 검증되지 않은 것
- 가격 전략은 '원가+마진'이 아니라 '고객의 지불 의향(WTP)'에서 출발해야 함
""",
    },
    5: {
        "name": "린 스타트업 자금 전략 — 런웨이 최적화",
        "principles": """
[참조 방법론: 린 스타트업 + 한국 창업지원사업 생태계]
핵심 원칙:
- "런웨이(Runway) = 현금 잔액 ÷ 월간 번 레이트" — 최소 12~18개월 확보가 목표
- 정부 지원사업은 희석 없는 자금이지만 '목적·자격·타이밍'이 전략적으로 맞아야 함
- 마일스톤은 다음 자금 조달을 위한 증거가 되어야 함 — "다음 라운드에서 무엇을 증명했는가"
- 예비창업패키지(1억)·초기창업패키지(1억)·도약패키지(3억)는 단계별 자격 조건이 다름
""",
    },
    6: {
        "name": "팀 캔버스 — 실행 조직 설계",
        "principles": """
[참조 방법론: Team Canvas + 하이어링 원칙 (엔드류 그로브, High Output Management)]
핵심 원칙:
- "투자자는 아이디어보다 팀을 보고 투자한다" — 팀의 실행력·보완성·신뢰가 핵심
- 역할 공백 파악 → 언제 어떻게 채울지 계획 → 이것이 없으면 실행 불가
- "A급 팀은 A급 사람을 채용하고, B급 팀은 C급 사람을 채용한다" (엔드류 그로브)
- 혼자 창업자라도 '내가 잘하는 것 + 채워야 할 것 + 채울 방법'이 명확하면 강점
""",
    },
    7: {
        "name": "피치덱 원칙 — 3분 설득 구조",
        "principles": """
[참조 방법론: Guy Kawasaki 10/20/30 Rule + Simon Sinek의 WHY 원칙]
핵심 원칙:
- "10개 슬라이드, 20분, 30포인트 폰트" — 복잡함은 확신 없음의 표시 (Guy Kawasaki)
- 피치의 순서: WHY(문제·사명) → HOW(솔루션) → WHAT(제품·수치), 거꾸로 하면 안 됨 (Simon Sinek)
- "왜 이 사업인가, 왜 지금인가, 왜 당신인가" — 이 세 질문에 30초씩 답할 수 있어야 함
- GTM 전략의 핵심은 '첫 100명'을 어떻게 확보하는가 — 채널과 전환율을 숫자로
""",
    },
}


# ── 피드백 프롬프트 (근거 기반 업그레이드) ────────────────────────────────
STEP_FEEDBACK_PROMPTS = {
    1: """아래는 창업자가 작성한 TPCS 프레임워크 내용입니다.

Target(고객): {target}
Problem(문제): {problem}
Cause(원인): {cause}
Solution(해결책): {solution}

{methodology}

린 스타트업 코치로서 이 내용을 검토하고 구체적인 피드백을 2~3문장으로 작성하세요.
잘된 점 1가지와 보완할 점 1~2가지를 콕 집어서 말하세요.
칭찬으로 시작하되 날카롭게 짚어주세요. 근거 없는 낙관은 부추기지 마세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    2: """아래는 창업자가 작성한 비전 캔버스 내용입니다.

핵심 가치: {core_value}
독창성: {originality}
미학 방향: {aesthetic}
시장적 의미: {relevance}

{methodology}

코치로서 이 비전이 시장에서 설득력 있는지 검토하고 2~3문장으로 피드백하세요.
'왜 당신이어야 하는가'에 대한 답이 명확한지 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    3: """아래는 창업자가 작성한 시장 분석 내용입니다.

TAM(전체 시장): {tam}
SAM(유효 시장): {sam}
SOM(점유 목표): {som}
경쟁 우위: {competitive_edge}

{methodology}

시장 분석 전문가로서 숫자의 근거와 경쟁 우위의 설득력을 검토하고 2~3문장으로 피드백하세요.
수치의 현실성과 경쟁사 대비 차별점이 명확한지 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    4: """아래는 창업자가 작성한 수익 모델 내용입니다.

수익원: {revenue}
가격 전략: {pricing}
비용 구조: {cost}
단위 경제: {unit_economics}

{methodology}

재무 코치로서 수익 구조의 지속 가능성을 검토하고 2~3문장으로 피드백하세요.
손익분기점 도달 가능성과 단위 경제의 현실성을 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    5: """아래는 창업자가 작성한 자금 계획 내용입니다.

소요 자금: {funding_need}
조달 전략: {funding_strategy}
마일스톤: {milestone}
추천 지원사업: {matched_grants}

{methodology}

투자 코치로서 자금 계획의 현실성을 검토하고 2~3문장으로 피드백하세요.
마일스톤과 자금 소진 계획의 연결고리, 지원사업 적합성을 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    6: """아래는 창업자가 작성한 팀 설계 내용입니다.

핵심 역할: {roles}
현재 팀: {current_team}
보완 영역: {gaps}
협업 방식: {collaboration}

{methodology}

팀 빌딩 코치로서 팀 구성의 실행 가능성을 검토하고 2~3문장으로 피드백하세요.
역할 공백의 심각성과 충원 계획의 구체성을 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",

    7: """아래는 창업자가 작성한 런칭 준비 내용입니다.

피치덱 핵심 흐름: {pitch_deck}
예상 Q&A: {qa}
출시 계획(GTM): {gtm}
핵심 지표(KPI): {kpi}

{methodology}

최종 코치로서 피치덱과 런칭 준비의 완성도를 검토하고 2~3문장으로 피드백하세요.
'왜 이 사업, 왜 지금, 왜 당신'에 대한 답변이 명확한지 집중적으로 짚어주세요.
마지막 문장은 반드시 "[근거: {methodology_name}]" 형태로 어떤 원칙에 근거한 피드백인지 명시하세요.
반드시 자연스러운 한국어 문장으로만 작성하세요. **, ##, -, * 같은 마크다운 기호는 절대 사용하지 마세요.""",
}


# ── 완성도 채점 프롬프트 ─────────────────────────────────────────────────
STEP_SCORE_PROMPTS = {
    1: """창업자가 작성한 TPCS 프레임워크를 린 스타트업 원칙으로 채점하세요.

Target: {target}
Problem: {problem}
Cause: {cause}
Solution: {solution}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (구체성·검증가능성·연결성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    2: """창업자가 작성한 비전 캔버스를 블루오션 전략과 Zero to One 원칙으로 채점하세요.

핵심 가치: {core_value}
독창성: {originality}
미학 방향: {aesthetic}
시장적 의미: {relevance}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (독창성·차별성·시장연결성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    3: """창업자가 작성한 시장 분석을 캐즘 이론과 포터의 경쟁 우위론으로 채점하세요.

TAM: {tam}
SAM: {sam}
SOM: {som}
경쟁 우위: {competitive_edge}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (수치근거·시장진입전략·경쟁우위 명확성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    4: """창업자가 작성한 수익 모델을 단위 경제학 원칙으로 채점하세요.

수익원: {revenue}
가격 전략: {pricing}
비용 구조: {cost}
단위 경제: {unit_economics}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (LTV/CAC비율·손익분기점명확성·지속가능성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    5: """창업자가 작성한 자금 계획을 린 스타트업 런웨이 원칙으로 채점하세요.

소요 자금: {funding_need}
조달 전략: {funding_strategy}
마일스톤: {milestone}
추천 지원사업: {matched_grants}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (런웨이계획·마일스톤연결·지원사업적합성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    6: """창업자가 작성한 팀 설계를 팀 캔버스 원칙으로 채점하세요.

핵심 역할: {roles}
현재 팀: {current_team}
보완 영역: {gaps}
협업 방식: {collaboration}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (역할명확성·공백인식·충원계획구체성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",

    7: """창업자가 작성한 런칭 준비를 Guy Kawasaki와 Simon Sinek 원칙으로 채점하세요.

피치덱 흐름: {pitch_deck}
예상 Q&A: {qa}
GTM: {gtm}
KPI: {kpi}

아래 JSON 형식으로만 응답하세요:
{{
  "score": 0~100 사이 정수 (스토리흐름·근거수치·실행가능성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  "strengths": ["잘된 점 1가지를 한 문장으로"],
  "missing_items": ["보완이 필요한 항목 1~3개, 각각 한 문장으로"],
  "improvement_hint": "가장 시급한 개선 방향을 한 문장으로"
}}""",
}

# ── 이전/이후 비교 프롬프트 ──────────────────────────────────────────────
STEP_COMPARE_PROMPTS = {
    1: "TPCS 프레임워크 (Target·Problem·Cause·Solution)",
    2: "비전 캔버스 (핵심가치·독창성·미학방향·시장적의미)",
    3: "시장 분석 (TAM·SAM·SOM·경쟁우위)",
    4: "수익 모델 (수익원·가격전략·비용구조·단위경제)",
    5: "자금 계획 (소요자금·조달전략·마일스톤·추천지원사업)",
    6: "팀 설계 (핵심역할·현재팀·보완영역·협업방식)",
    7: "런칭 준비 (피치덱·Q&A·GTM·KPI)",
}


class FeedbackRequest(BaseModel):
    step: int
    content: dict

    _validate_content = field_validator("content")(_size_validator())


@router.post("/feedback")
@limiter.limit("20/minute")
def generate_feedback(request: Request, body: FeedbackRequest):
    if body.step not in STEP_FEEDBACK_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    ref = METHODOLOGY_REFS.get(body.step, {"name": "창업 방법론", "principles": ""})
    template = STEP_FEEDBACK_PROMPTS[body.step]
    content_with_defaults = {k: (v or "미작성") for k, v in body.content.items()}
    content_with_defaults["methodology"] = ref["principles"]
    content_with_defaults["methodology_name"] = ref["name"]

    try:
        prompt = template.format(**content_with_defaults)
    except KeyError:
        prompt = (
            f"STEP {body.step} 작성 내용:\n{body.content}\n\n"
            f"{ref['principles']}\n\n"
            f"위 내용을 검토하고 2~3문장으로 구체적인 피드백을 주세요. "
            f"마지막 문장은 '[근거: {ref['name']}]' 형태로 끝내세요."
        )

    try:
        response = solar_client.chat.completions.create(
            model="solar-pro",
            messages=[
                {"role": "system", "content": "당신은 StepUp의 AI 창업 코치 요다입니다. 날카롭지만 따뜻하게, 구체적이고 실용적인 피드백을 2~3문장으로 제공하세요. 반드시 마지막 문장에 [근거: ...] 형태로 방법론 출처를 명시하세요. 한국어로만 답변하세요."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=400,
        )
        raw = response.choices[0].message.content.strip()
        return {
            "feedback": raw,
            "methodology_ref": ref["name"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ScoreRequest(BaseModel):
    step: int
    content: dict

    _validate_content = field_validator("content")(_size_validator())


@router.post("/score")
@limiter.limit("20/minute")
def score_step(request: Request, body: ScoreRequest):
    if body.step not in STEP_SCORE_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    template = STEP_SCORE_PROMPTS[body.step]
    content_with_defaults = {k: (v or "미작성") for k, v in body.content.items()}

    try:
        prompt = template.format(**content_with_defaults)
    except KeyError:
        prompt = f"STEP {body.step} 내용:\n{body.content}\n\n위 내용을 0~100점으로 채점하고 JSON으로 응답하세요."

    try:
        import json as _json, re as _re
        response = solar_client.chat.completions.create(
            model="solar-pro",
            messages=[
                {"role": "system", "content": "창업 코치로서 작성 내용을 채점하세요. 반드시 유효한 JSON 객체만 응답하세요. 코드블록이나 다른 텍스트는 포함하지 마세요."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = _re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            raw = raw[start:end]
        result = _json.loads(raw)
        return {
            "score": int(result.get("score", 0)),
            "grade": result.get("grade", "D"),
            "strengths": _as_str_list(result.get("strengths")),
            "missing_items": _as_str_list(result.get("missing_items")),
            "improvement_hint": result.get("improvement_hint", ""),
            "methodology_ref": METHODOLOGY_REFS.get(body.step, {}).get("name", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CompareRequest(BaseModel):
    step: int
    before: dict
    after: dict

    _validate_before = field_validator("before")(_size_validator())
    _validate_after = field_validator("after")(_size_validator())


@router.post("/compare")
@limiter.limit("20/minute")
def compare_versions(request: Request, body: CompareRequest):
    if body.step not in STEP_COMPARE_PROMPTS:
        raise HTTPException(status_code=400, detail="유효하지 않은 단계입니다")

    framework_name = STEP_COMPARE_PROMPTS[body.step]
    ref = METHODOLOGY_REFS.get(body.step, {"name": "창업 방법론", "principles": ""})

    prompt = f"""창업자가 {framework_name} 내용을 수정했습니다.

[수정 전]
{body.before}

[수정 후]
{body.after}

{ref['principles']}

수정 전후를 비교해 Build-Measure-Learn 관점에서 JSON으로 응답하세요:
{{
  "improvements": ["나아진 점 1~3가지, 각각 한 문장으로 구체적으로"],
  "remaining_issues": ["아직 보완이 필요한 점 1~2가지, 각각 한 문장으로"],
  "overall_progress": "전체적인 진전을 한 문장으로 (격려와 다음 방향 포함)",
  "progress_delta": 0~30 사이 정수 (이번 수정으로 향상된 완성도 포인트 추정)
}}"""

    try:
        import json as _json, re as _re
        response = solar_client.chat.completions.create(
            model="solar-pro",
            messages=[
                {"role": "system", "content": "창업 코치로서 수정 전후를 비교하세요. 반드시 유효한 JSON 객체만 응답하세요. 코드블록이나 다른 텍스트는 포함하지 마세요."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=600,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            raw = _re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            raw = raw[start:end]
        result = _json.loads(raw)
        return {
            "improvements": _as_str_list(result.get("improvements")),
            "remaining_issues": _as_str_list(result.get("remaining_issues")),
            "overall_progress": result.get("overall_progress", ""),
            "progress_delta": int(result.get("progress_delta", 0)),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 엔드포인트 ────────────────────────────────────────────────────────────

@router.post("/generate")
@limiter.limit("20/minute")
def generate_draft(request: Request, body: AIDraftRequest):
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
@limiter.limit("30/minute")
def chat(request: Request, body: ChatRequest):
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
        raw = response.choices[0].message.content or ""
        return {"message": strip_markdown(raw)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── 사업계획서 생성 ────────────────────────────────────────────────────────

class BusinessPlanRequest(BaseModel):
    token: str
    all_content: dict

    _validate_all_content = field_validator("all_content")(_size_validator(max_chars=80000))  # 7단계 전체 취합분


class BusinessPlanFeedbackRequest(BaseModel):
    business_plan: str = Field(max_length=20000)


@router.post("/business-plan")
@limiter.limit("10/minute")
def generate_business_plan(request: Request, body: BusinessPlanRequest):
    step_names = {
        1: "문제 발견과 솔루션", 2: "예술적 비전", 3: "시장 분석",
        4: "수익 모델", 5: "자금 계획", 6: "팀 빌딩", 7: "피치덱·런칭",
    }
    context = ""
    for step_num in range(1, 8):
        content = body.all_content.get(str(step_num)) or body.all_content.get(step_num)
        if content:
            context += f"\n[{step_num}단계 - {step_names[step_num]}]\n"
            for k, v in content.items():
                if v:
                    val = v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)
                    context += f"- {k}: {val}\n"

    prompt = f"""당신은 전문 창업 컨설턴트입니다. 아래 창업자의 7단계 로드맵 작성 내용을 바탕으로 완성도 높은 한국어 사업계획서를 작성해주세요.

작성 원칙:
- 모든 금액은 한국 원(만 원, 억 원) 단위로 표기하세요
- 마크다운 기호(**, ##, -, * 등)는 절대 사용하지 마세요
- 각 섹션은 [섹션명] 형태로 시작하세요
- 자연스러운 한국어 문장으로 작성하세요
- 구체적인 수치와 근거를 포함해 작성하세요

창업자 정보:
{context}

아래 구조로 사업계획서를 작성하세요:

[사업 개요]
[해결하는 문제와 솔루션]
[목표 고객]
[시장 분석]
[비즈니스 모델과 수익 구조]
[자금 조달 계획]
[팀 구성]
[마케팅 및 출시 전략]
[핵심 지표(KPI)]
[비전과 성장 로드맵]
"""
    use_solar = bool(settings.solar_api_key and settings.solar_api_key != "your-solar-api-key-here")
    try:
        if use_solar:
            bp_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")
            model = "solar-pro"
        else:
            bp_client = client
            model = "gpt-4o"
        response = bp_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=3000,
        )
        return {"business_plan": strip_markdown(response.choices[0].message.content or "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/business-plan/feedback")
@limiter.limit("20/minute")
def generate_business_plan_feedback(request: Request, body: BusinessPlanFeedbackRequest):
    prompt = f"""당신은 StepUp AI 창업 코치 '요다'입니다.
아래 사업계획서 전체를 읽고, 창업자에게 따뜻하고 직접적인 코칭 피드백을 해주세요.

말투 규칙:
- 친근하고 구어체로 말하세요. "좋아요!", "이 부분은 좀 더 다듬으면 좋겠어요." 같은 톤으로요.
- 마크다운 기호(**, ##, -, * 등)는 절대 쓰지 마세요.
- 잘된 점 2가지, 보완할 점 2가지를 자연스러운 문장으로 얘기해주세요.
- 마지막에 한 줄 응원 메시지를 써주세요.
- 전체 400자 내외로 간결하게 써주세요.

사업계획서:
{body.business_plan[:3000]}
"""
    use_solar = bool(settings.solar_api_key and settings.solar_api_key != "your-solar-api-key-here")
    try:
        if use_solar:
            fb_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")
            model = "solar-pro"
        else:
            fb_client = client
            model = "gpt-4o-mini"
        response = fb_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800,
        )
        return {"feedback": strip_markdown(response.choices[0].message.content or "")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

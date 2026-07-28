export interface StepMeta {
  name: string;
  desc: string;
  methodology: string;
  learningBlurb: string;
  coachTip: string;
}

export const STEP_CONTENT: StepMeta[] = [
  {
    name: "아이디어 스파크",
    desc: "해결할 문제와 고객을 명확히 정의할 차례입니다.",
    methodology: "린 스타트업",
    learningBlurb: "가족·친구의 호의적 반응은 증거가 아니에요. 낯선 사람의 행동 변화가 진짜 증거입니다.",
    coachTip: "지금 이 단계를 완성하면 다음 지원사업 신청에 한 발 더 가까워집니다!",
  },
  {
    name: "예술적 비전",
    desc: "당신만의 독창성을 시장의 언어로 번역합니다.",
    methodology: "블루오션 전략 · Zero to One",
    learningBlurb: "독창성은 '더 잘하는 것'이 아니라 '다르게 만드는 것'에서 나와요.",
    coachTip: "'예쁘다'가 아니라 '왜 지금 이게 필요한가'를 한 문장으로 말할 수 있어야 해요.",
  },
  {
    name: "시장 적합성",
    desc: "시장 규모와 경쟁사를 데이터로 분석합니다.",
    methodology: "캐즘 이론 · 포터의 경쟁우위론",
    learningBlurb: "전체 시장이 아닌 좁은 틈새를 먼저 장악하는 게 신뢰를 얻는 지름길이에요.",
    coachTip: "TAM 수치가 구체적이에요. SOM 달성 전략을 다음 단계에서 연결해 보세요.",
  },
  {
    name: "재무 지도",
    desc: "수익 구조와 비즈니스 모델을 완성합니다.",
    methodology: "단위 경제학",
    learningBlurb: "LTV가 CAC의 3배는 넘어야 지속 가능한 사업이라고 봅니다.",
    coachTip: "손익분기점을 숫자로 말할 수 없다면 아직 검증되지 않은 거예요.",
  },
  {
    name: "투자 유치",
    desc: "자금 계획과 지원사업을 연결합니다.",
    methodology: "린 스타트업 자금 전략",
    learningBlurb: "런웨이(현금 ÷ 월 소진액)는 최소 12~18개월 확보가 목표예요.",
    coachTip: "막연히 '몇 억 필요해요' 대신, 항목별로 왜 필요한지 정리해봐요.",
  },
  {
    name: "팀 빌딩",
    desc: "팀 구성과 실행 체계를 설계합니다.",
    methodology: "팀 캔버스",
    learningBlurb: "투자자는 아이디어보다 팀의 실행력과 보완성을 봐요.",
    coachTip: "혼자여도 괜찮아요. 잘하는 것과 채워야 할 것만 명확하면 강점이 됩니다.",
  },
  {
    name: "런칭 데이",
    desc: "피치덱과 런칭 준비를 완성합니다.",
    methodology: "Guy Kawasaki 10/20/30 · Simon Sinek",
    learningBlurb: "왜 이 사업, 왜 지금, 왜 당신인가 — 이 세 질문에 30초씩 답할 수 있어야 해요.",
    coachTip: "이제 마지막이에요. 사업계획서로 지금까지의 여정을 완성해봐요.",
  },
];

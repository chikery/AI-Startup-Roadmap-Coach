import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
          AI 기반 창업 가이드 플랫폼
        </p>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          아이디어에서
          <br />
          <span className="text-blue-600">사업계획서</span>까지
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          창업 아이디어를 가진 예술인·초기 창업자가
          <br />
          스스로 해낼 수 있게 돕는 AI 창업 로드맵 코치
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors text-lg"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-gray-300 transition-colors text-lg"
          >
            로그인
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="text-3xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">창업지원사업 자동 추천</h2>
          <p className="text-gray-500 leading-relaxed">
            아이템 분야·창업 단계·지역을 입력하면 RAG 엔진이 적합한 지원사업을 순위로 추천합니다.
            문체부, 중기부, 예술경영지원센터 등 주요 기관 공고를 실시간 반영합니다.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="text-3xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7단계 창업 로드맵</h2>
          <p className="text-gray-500 leading-relaxed">
            문제 발견 → 시장 리서치 → MVP 설계 → 비즈니스 모델 → 피치덱 완성.
            각 단계에서 AI가 초안을 자동 생성하고, 피드백을 제공합니다.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="text-3xl mb-4">✍️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">AI 초안 생성 + 수정</h2>
          <p className="text-gray-500 leading-relaxed">
            아이템 키워드 하나만 입력하면 TPCS 프레임, 고객 가설, 인터뷰 질문지 등을 즉시 생성합니다.
            사용자가 수정하며 완성도를 높여갑니다.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="text-3xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">사업계획서 자동 완성</h2>
          <p className="text-gray-500 leading-relaxed">
            STEP 7 완료 시 전 단계 내용이 자동으로 통합된 피치덱 초안이 완성됩니다.
            예상 Q&A 8문항 생성 및 답변 연습 기능도 제공합니다.
          </p>
        </div>
      </div>
    </main>
  );
}

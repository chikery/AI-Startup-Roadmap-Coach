"use client";

import Link from "next/link";

const STEP_META = [
  { step: 1, title: "문제 발견과 솔루션", desc: "TPCS 프레임으로 아이템 핵심 정의", icon: "🔍" },
  { step: 2, title: "고객과 시장 리서치", desc: "잠재고객 프로파일 및 시장 조사", icon: "👥" },
  { step: 3, title: "고객 인터뷰 설계", desc: "가설 수립 및 인터뷰 질문지 생성", icon: "💬" },
  { step: 4, title: "MVP 테스트 설계", desc: "가설 검증 및 도구 선택", icon: "🚀" },
  { step: 5, title: "시장 및 경쟁사 분석", desc: "TAM·SAM·SOM 및 SWOT 분석", icon: "📊" },
  { step: 6, title: "비즈니스 모델", desc: "BMC 9개 블록 완성", icon: "💡" },
  { step: 7, title: "피치덱 완성", desc: "10개 섹션 자동 초안 + Q&A 연습", icon: "🎯" },
];

interface Props {
  step: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export default function StepCard({ step, isCompleted, isLocked }: Props) {
  const meta = STEP_META[step - 1];

  return (
    <div
      className={`relative p-6 rounded-lg border transition-all ${
        isLocked
          ? "border-border bg-[color-mix(in_srgb,var(--color-muted)_8%,var(--color-surface))] opacity-50 cursor-not-allowed"
          : isCompleted
          ? "border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_14%,var(--color-surface))] hover:shadow-md cursor-pointer"
          : "glass border-primary hover:shadow-md cursor-pointer"
      }`}
    >
      {isLocked && (
        <span className="absolute top-4 right-4 text-muted text-lg">🔒</span>
      )}
      {isCompleted && (
        <span className="absolute top-4 right-4 text-success text-lg">✅</span>
      )}

      <div className="flex items-start gap-4">
        <span className="text-3xl">{meta.icon}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
            STEP {step}
          </p>
          <h3 className="font-bold text-text text-lg mb-1">{meta.title}</h3>
          <p className="text-sm text-muted">{meta.desc}</p>
        </div>
      </div>

      {!isLocked && (
        <Link href={`/roadmap/${step}`} className="absolute inset-0 rounded-lg" />
      )}
    </div>
  );
}

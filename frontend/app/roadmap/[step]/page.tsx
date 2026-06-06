"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";

const STEP_META = [
  { step: 1, title: "문제 발견과 솔루션", desc: "TPCS 프레임워크로 아이템의 핵심을 정의합니다", icon: "🔍" },
  { step: 2, title: "고객과 시장 리서치", desc: "잠재고객 프로파일과 시장 조사 방향을 설계합니다", icon: "👥" },
  { step: 3, title: "고객 인터뷰 설계", desc: "가설을 수립하고 인터뷰 질문지를 생성합니다", icon: "💬" },
  { step: 4, title: "MVP 테스트 설계", desc: "가설 검증 방법과 적합한 도구를 선택합니다", icon: "🚀" },
  { step: 5, title: "시장 및 경쟁사 분석", desc: "TAM·SAM·SOM 산정 및 SWOT 분석을 완성합니다", icon: "📊" },
  { step: 6, title: "비즈니스 모델", desc: "비즈니스 모델 캔버스 9개 블록을 완성합니다", icon: "💡" },
  { step: 7, title: "피치덱 완성", desc: "10개 섹션 초안과 예상 Q&A를 생성합니다", icon: "🎯" },
];

export default function RoadmapStepPage() {
  const { step: stepParam } = useParams();
  const step = parseInt(stepParam as string);
  const router = useRouter();
  const meta = STEP_META[step - 1];

  const [user, setUser] = useState<any>(null);
  const [stepData, setStepData] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [userContent, setUserContent] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (u) setUser(JSON.parse(u));

    api.roadmap.getStep(step)
      .then((data: any) => {
        setStepData(data);
        if (data.content) setUserContent(JSON.stringify(data.content, null, 2));
        if (data.ai_draft) setDraft(data.ai_draft);
      })
      .catch(() => {});
  }, [step]);

  async function handleGenerate() {
    if (!user?.item_keyword) return;
    setGenerating(true);
    try {
      const res = await api.ai.generateDraft(step, user.item_keyword, stepData?.content) as any;
      setDraft(res.draft);
      setUserContent(JSON.stringify(res.draft, null, 2));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const parsed = JSON.parse(userContent);
      await api.roadmap.saveStep(step, parsed);
      alert("저장되었습니다!");
      if (step < 7) router.push(`/roadmap/${step + 1}`);
      else router.push("/dashboard");
    } catch {
      alert("JSON 형식을 확인해주세요");
    } finally {
      setSaving(false);
    }
  }

  if (!meta) return <div className="p-10 text-center text-gray-400">존재하지 않는 단계입니다</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-gray-900">AI 창업 로드맵 코치</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Step Header */}
        <div className="mb-8">
          <p className="text-sm font-bold text-blue-500 uppercase tracking-wide mb-2">STEP {step} / 7</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{meta.icon}</span>
            <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          </div>
          <p className="text-gray-500">{meta.desc}</p>
        </div>

        {/* AI Generate Button */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800 mb-1">AI 초안 자동 생성</p>
              <p className="text-sm text-gray-500">
                아이템 키워드 기반으로 이 단계의 내용을 즉시 생성합니다
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !user?.item_keyword}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {generating ? "생성 중..." : "✨ 초안 생성"}
            </button>
          </div>
          {!user?.item_keyword && (
            <p className="text-xs text-orange-500 mt-3">
              ⚠️ 아이템 키워드를 먼저 설정해주세요 (프로필 설정)
            </p>
          )}
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800">내용 편집</p>
            <span className="text-xs text-gray-400">JSON 형식으로 저장됩니다</span>
          </div>
          <textarea
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            rows={20}
            className="w-full font-mono text-sm border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
            placeholder={`AI 초안 생성 버튼을 눌러 시작하거나\n직접 JSON 형식으로 입력하세요`}
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !userContent}
            className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
          >
            {saving ? "저장 중..." : step < 7 ? "저장하고 다음 단계 →" : "완성! 사업계획서 보기"}
          </button>
          {step > 1 && (
            <Link
              href={`/roadmap/${step - 1}`}
              className="px-6 py-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:border-gray-300 transition-colors"
            >
              ← 이전
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

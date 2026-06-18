"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import StepCard from "@/app/components/StepCard";

interface StepStatus {
  step: number;
  is_completed: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progress, setProgress] = useState<StepStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setIsLoggedIn(!!token);

    if (token) {
      api.roadmap.getProgress()
        .then((data: any) => setProgress(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const completedCount = progress.filter((s) => s.is_completed).length;

  function isLocked(step: number) {
    if (!isLoggedIn) return false;
    if (step === 1) return false;
    return !progress.find((s) => s.step === step - 1)?.is_completed;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900">AI 창업 로드맵 코치</span>
          <div className="flex items-center gap-4">
            <Link href="/programs" className="text-sm text-blue-600 font-medium hover:underline">
              지원사업 추천
            </Link>
            {isLoggedIn ? (
              <span className="text-sm text-gray-500">{user?.name}</span>
            ) : (
              <Link href="/login" className="text-sm text-blue-600 font-semibold hover:underline">
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Guest Banner */}
        {!isLoggedIn && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-blue-700">
              로그인하면 진행 상황이 저장되고, AI 초안 생성 기능을 사용할 수 있습니다.
            </p>
            <div className="flex gap-2 shrink-0">
              <Link href="/signup" className="text-sm font-semibold text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                무료 가입
              </Link>
              <Link href="/login" className="text-sm font-semibold text-blue-600 bg-white border border-blue-200 px-4 py-2 rounded-full hover:border-blue-300 transition-colors">
                로그인
              </Link>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isLoggedIn ? `안녕하세요, ${user?.name}님 👋` : "AI 창업 로드맵"}
          </h1>
          {user?.item_keyword && (
            <p className="text-gray-500">
              아이템: <span className="text-gray-700 font-medium">"{user.item_keyword}"</span>
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-700">로드맵 진행률</span>
            <span className="text-blue-600 font-bold">{completedCount} / 7 단계</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((step) => (
            <StepCard
              key={step}
              step={step}
              isCompleted={progress.find((s) => s.step === step)?.is_completed ?? false}
              isLocked={isLocked(step)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

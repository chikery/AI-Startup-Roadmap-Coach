"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import StepCard from "@/app/components/StepCard";

interface StepStatus {
  step: number;
  is_completed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState<StepStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    if (!token || !u) { router.push("/login"); return; }
    setUser(JSON.parse(u));

    api.roadmap.getProgress()
      .then((data: any) => setProgress(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = progress.filter((s) => s.is_completed).length;

  function isLocked(step: number) {
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
            <span className="text-sm text-gray-500">{user?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            안녕하세요, {user?.name}님 👋
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

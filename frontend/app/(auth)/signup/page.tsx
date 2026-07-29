"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import Card from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import Button from "@/app/components/ui/Button";
import ProgressBar from "@/app/components/ui/ProgressBar";

const CATEGORIES = ["문화예술", "콘텐츠", "공예", "소셜임팩트", "기술/IT", "기타"];
const STAGES = ["아이디어", "예비창업", "초기창업"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "profile">("account");
  const [form, setForm] = useState({
    email: "", password: "", name: "",
    item_keyword: "", category: "", startup_stage: "", region: "", has_team: "solo",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "account") { setStep("profile"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await api.auth.register(form.email, form.password, form.name) as any;
      localStorage.setItem("access_token", res.access_token);
      const updatedUser = await api.auth.updateProfile({
        item_keyword: form.item_keyword,
        category: form.category,
        startup_stage: form.startup_stage,
        region: form.region,
        has_team: form.has_team,
      }, res.access_token) as any;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blurred color blobs — glass card needs something to refract */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 45%)," +
            "radial-gradient(circle at 88% 80%, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%, transparent 45%)," +
            "radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-secondary) 14%, transparent) 0%, transparent 50%)",
        }}
      />

      <Card variant="glass" padding="lg" className="relative z-10 w-full max-w-md p-10">
        <div className="mb-8">
          <ProgressBar variant="segmented" total={2} completed={step === "profile" ? 2 : 1} />
        </div>

        <h1 className="text-2xl font-bold text-text mb-2">
          {step === "account" ? "계정 만들기" : "아이템 정보 입력"}
        </h1>
        <p className="text-muted text-sm mb-8">
          {step === "account" ? "1분이면 시작할 수 있어요" : "맞춤 지원사업 추천에 활용됩니다"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === "account" ? (
            <>
              <Input
                label="이름"
                required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
              />
              <Input
                label="이메일"
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="hello@example.com"
              />
              <Input
                label="비밀번호"
                type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8자 이상"
                minLength={8}
              />
            </>
          ) : (
            <>
              <Input
                label="창업 아이템 키워드"
                required value={form.item_keyword}
                onChange={(e) => setForm({ ...form, item_keyword: e.target.value })}
                placeholder="예: 공예 작가를 위한 온라인 판매 플랫폼"
              />
              <Select
                label="분야"
                required value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">선택해주세요</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select
                label="창업 단계"
                required value={form.startup_stage}
                onChange={(e) => setForm({ ...form, startup_stage: e.target.value })}
              >
                <option value="">선택해주세요</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input
                label="지역"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="서울 (비워두면 전국)"
              />
              <div>
                <label className="block text-sm font-medium text-muted mb-2">팀 구성</label>
                <div className="flex gap-3">
                  {[{ v: "solo", l: "혼자" }, { v: "team", l: "팀 있음" }].map(({ v, l }) => (
                    <button
                      key={v} type="button"
                      onClick={() => setForm({ ...form, has_team: v })}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.has_team === v ? "border-primary text-primary" : "border-border text-muted"}`}
                      style={form.has_team === v ? { background: "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))" } : undefined}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-error text-sm">{error}</p>}

          <Button type="submit" disabled={loading} variant="primary" size="lg" className="mt-2 w-full">
            {loading ? "처리 중..." : step === "account" ? "다음 →" : "시작하기"}
          </Button>
        </form>

        {step === "account" && (
          <p className="text-center text-sm text-muted mt-6">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">로그인</Link>
          </p>
        )}
      </Card>
    </div>
  );
}

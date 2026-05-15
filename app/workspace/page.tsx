"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

interface PlanData {
  problem: string;
  target: string;
  features: string[];
  screens: string[];
  prompts: string[];
}

interface ErrorData {
  cause: string;
  solution: string;
  prompt: string;
}

const examples = [
  "학교 근처 맛집을 학생들끼리 공유하는 앱을 만들고 싶어요.",
  "동아리 신입 부원을 모집할 수 있는 웹사이트를 만들고 싶어요.",
  "중고 교재를 학교 학생들끼리 사고팔 수 있는 서비스를 만들고 싶어요.",
  "우리 학과 수업 후기를 모아볼 수 있는 커뮤니티를 만들고 싶어요.",
];

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export default function Workspace() {
  const [theme, setTheme] = useState<Theme>("light");
  const [idea, setIdea] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [errorText, setErrorText] = useState("");
  const [errorLoading, setErrorLoading] = useState(false);
  const [errorData, setErrorData] = useState<ErrorData | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [errorCopied, setErrorCopied] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const handleSubmit = async () => {
    if (!idea.trim() || idea.trim().length < 10) return;
    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, type: "plan" }),
      });
      const json = await res.json();
      if (json.success) {
        setPlanData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorSubmit = async () => {
    if (!errorText.trim()) return;
    setErrorLoading(true);
    setErrorData(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: errorText, type: "error" }),
      });
      const json = await res.json();
      if (json.success) {
        setErrorData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setErrorLoading(false);
    }
  };

  const handleReset = () => {
    setIdea("");
    setSubmitted(false);
    setPlanData(null);
    setErrorText("");
    setErrorData(null);
    setCopied(null);
    setErrorCopied(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleErrorCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setErrorCopied(true);
    setTimeout(() => setErrorCopied(false), 2000);
  };

  const currentStep = submitted ? 2 : 1;

  return (
    <main
      className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${
        isDark ? "bg-[#0c0c1d] text-white" : "bg-white text-slate-900"
      }`}
    >
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/25 blur-[120px]" />
          <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-[350px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        </div>
      )}

      {/* 헤더 */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? "border-white/5 bg-[#0c0c1d]/80" : "border-slate-100 bg-white/90"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link
            href="/"
            className={`text-base font-extrabold tracking-tight md:text-lg ${
              isDark
                ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
            }`}
          >
            VIBE PROJECT
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <div className={`flex overflow-hidden rounded-full border p-1 transition-all duration-300 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                aria-label="Light mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10 hover:text-white"}`}
              >
                <SunIcon />
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                aria-label="Dark mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <MoonIcon />
              </button>
            </div>

            <Link
              href="/"
              className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition ${
                isDark
                  ? "border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              처음으로
            </Link>
          </div>
        </div>
      </nav>

      {/* 단계 표시 */}
      <div className={`border-b transition-colors duration-500 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-0 overflow-x-auto px-6 py-4">
          {[
            { step: 1, label: "아이디어 입력" },
            { step: 2, label: "기획 정리" },
            { step: 3, label: "프롬프트 추천" },
            { step: 4, label: "에러 해석기" },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                    item.step <= currentStep
                      ? isDark
                        ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white"
                        : "bg-blue-600 text-white"
                      : isDark
                      ? "bg-white/10 text-white/30"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {item.step < currentStep ? "✓" : item.step}
                </div>
                <span className={`text-sm font-medium ${item.step <= currentStep ? isDark ? "text-white" : "text-blue-600" : isDark ? "text-white/30" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </div>
              {index < 3 && (
                <div className={`mx-3 h-px w-8 sm:w-12 ${item.step < currentStep ? isDark ? "bg-violet-500/50" : "bg-blue-300" : isDark ? "bg-white/10" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {!submitted ? (
          <>
            {/* Step 1 */}
            <div className="text-center">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
                Step 1 — 아이디어 입력
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                어떤 서비스를 만들고 싶나요?
              </h1>
              <p className={`mx-auto mt-4 max-w-xl text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                완벽하게 정리하지 않아도 괜찮아요.
                <br />
                평소 말하듯 편하게 적어주세요.
              </p>
            </div>

            <div className="mt-10">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="예) 학교 근처 맛집을 친구들과 공유하는 앱을 만들고 싶어요."
                rows={5}
                className={`w-full resize-none rounded-2xl border px-5 py-4 text-base leading-7 outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
                  {idea.length > 0 ? `${idea.length}자 입력됨` : "최소 10자 이상 입력해주세요"}
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={idea.trim().length < 10}
                  className={`rounded-xl px-6 py-3 text-sm font-bold transition ${
                    idea.trim().length >= 10
                      ? isDark
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-900/40 hover:opacity-90"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                      : isDark
                      ? "cursor-not-allowed bg-white/5 text-white/20"
                      : "cursor-not-allowed bg-slate-100 text-slate-400"
                  }`}
                >
                  AI 기획 정리 시작하기 →
                </button>
              </div>
            </div>

            <div className="mt-14">
              <p className={`mb-4 text-center text-sm font-semibold uppercase tracking-widest ${isDark ? "text-white/30" : "text-slate-400"}`}>
                이런 아이디어도 괜찮아요
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdea(example)}
                    className={`rounded-2xl border p-4 text-left text-sm leading-6 transition ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/60 hover:border-violet-500/50 hover:bg-white/10 hover:text-white"
                        : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 이후 */}
            <div className="text-center">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                loading
                  ? isDark ? "border-white/10 bg-white/5 text-white/60" : "border-blue-100 bg-blue-50 text-blue-600"
                  : isDark ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-green-100 bg-green-50 text-green-600"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-blue-400" : "bg-green-500"}`} />
                {loading ? "AI가 기획을 정리하는 중..." : "Step 2 — AI 기획 정리 완료"}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {loading ? "잠깐만요, AI가 정리 중이에요!" : "이렇게 기획해봤어요!"}
              </h1>
              <p className={`mx-auto mt-4 max-w-xl text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {loading
                  ? "아이디어를 분석해서 기획을 정리하고 있어요. 잠시만 기다려주세요."
                  : "아래 내용을 바탕으로 AI에게 요청하면 더 좋은 결과를 받을 수 있어요."}
              </p>
            </div>

            {/* 로딩 상태 */}
            {loading && (
              <div className="mt-16 flex flex-col items-center justify-center gap-6">
                <div className={`h-16 w-16 animate-spin rounded-full border-4 border-t-transparent ${isDark ? "border-violet-500" : "border-blue-600"}`} />
                <div className="space-y-3 text-center">
                  {["아이디어 분석 중...", "문제 정의하는 중...", "핵심 기능 정리 중...", "프롬프트 생성 중..."].map((text, i) => (
                    <p key={i} className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>{text}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 기획 결과 */}
            {!loading && planData && (
              <>
                {/* 입력한 아이디어 */}
                <div className={`mt-10 rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${isDark ? "text-white/30" : "text-slate-400"}`}>
                    내가 입력한 아이디어
                  </p>
                  <p className={`text-sm leading-7 ${isDark ? "text-white/70" : "text-slate-700"}`}>{idea}</p>
                </div>

                {/* 기획 카드 */}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[
                    {
                      num: "01",
                      title: "문제 정의",
                      gradient: "from-blue-500 to-cyan-400",
                      lightColor: "bg-blue-50 text-blue-600",
                      content: planData.problem,
                    },
                    {
                      num: "02",
                      title: "대상 사용자",
                      gradient: "from-violet-500 to-purple-400",
                      lightColor: "bg-violet-50 text-violet-600",
                      content: planData.target,
                    },
                    {
                      num: "03",
                      title: "핵심 기능",
                      gradient: "from-pink-500 to-rose-400",
                      lightColor: "bg-pink-50 text-pink-600",
                      list: planData.features,
                    },
                    {
                      num: "04",
                      title: "필요한 화면",
                      gradient: "from-orange-500 to-amber-400",
                      lightColor: "bg-orange-50 text-orange-600",
                      list: planData.screens,
                    },
                  ].map((card) => (
                    <div
                      key={card.num}
                      className={`group relative overflow-hidden rounded-2xl border p-6 transition ${
                        isDark
                          ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                          : "border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      {isDark && (
                        <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />
                      )}
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${isDark ? `bg-gradient-to-br ${card.gradient} text-white` : card.lightColor}`}>
                          {card.num}
                        </div>
                        <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{card.title}</h3>
                      </div>

                      {card.content && (
                        <p className={`text-sm leading-7 ${isDark ? "text-white/50" : "text-slate-500"}`}>{card.content}</p>
                      )}
                      {card.list && (
                        <ul className="space-y-2">
                          {card.list.map((item, i) => (
                            <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
                              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${isDark ? "bg-violet-400" : "bg-blue-400"}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* 추천 프롬프트 */}
                <div className={`mt-8 rounded-2xl border p-6 ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-100 bg-blue-50"}`}>
                  <p className={`mb-1 text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                    Step 3 — AI에게 이렇게 요청해보세요
                  </p>
                  <p className={`mb-4 text-xs ${isDark ? "text-white/30" : "text-blue-600/60"}`}>
                    아래 프롬프트를 복사해서 Cursor, ChatGPT 등에 붙여넣어 보세요.
                  </p>

                  <div className="space-y-3">
                    {planData.prompts.map((prompt, i) => (
                      <div
                        key={i}
                        className={`flex items-start justify-between gap-4 rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-white shadow-sm"}`}
                      >
                        <p className={`text-sm leading-6 ${isDark ? "text-white/70" : "text-slate-700"}`}>{prompt}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(prompt, i)}
                          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            copied === i
                              ? isDark
                                ? "border-green-500/30 bg-green-500/10 text-green-400"
                                : "border-green-200 bg-green-50 text-green-600"
                              : isDark
                              ? "border-white/10 text-white/50 hover:bg-white/10"
                              : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {copied === i ? "복사됨!" : "복사"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 에러 해석기 */}
                <div className={`mt-6 rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                  <p className={`mb-1 text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Step 4 — 에러가 생겼나요?
                  </p>
                  <p className={`mb-4 text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>
                    에러 메시지를 아래에 붙여넣으면 AI가 쉬운 말로 해석해드려요.
                  </p>

                  <textarea
                    value={errorText}
                    onChange={(e) => setErrorText(e.target.value)}
                    placeholder="예) Cannot read properties of undefined (reading 'map')"
                    rows={3}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500"
                        : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:border-blue-400"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handleErrorSubmit}
                    disabled={errorLoading || !errorText.trim()}
                    className={`mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                      errorText.trim()
                        ? isDark
                          ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90"
                          : "bg-slate-900 text-white hover:bg-slate-700"
                        : isDark
                        ? "cursor-not-allowed bg-white/5 text-white/20"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    {errorLoading ? "해석 중..." : "에러 해석하기 →"}
                  </button>

                  {/* 에러 해석 결과 */}
                  {errorData && (
                    <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                      <div className="mb-3">
                        <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isDark ? "text-red-400" : "text-red-600"}`}>
                          에러 원인
                        </p>
                        <p className={`text-sm leading-7 ${isDark ? "text-white/70" : "text-slate-700"}`}>
                          {errorData.cause}
                        </p>
                      </div>

                      <div className="mb-3">
                        <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${isDark ? "text-green-400" : "text-green-600"}`}>
                          해결 방법
                        </p>
                        <p className={`text-sm leading-7 ${isDark ? "text-white/70" : "text-slate-700"}`}>
                          {errorData.solution}
                        </p>
                      </div>

                      <div>
                        <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                          AI에게 이렇게 요청해보세요
                        </p>
                        <div className={`flex items-start justify-between gap-3 rounded-xl p-3 ${isDark ? "bg-white/5" : "bg-white"}`}>
                          <p className={`text-sm leading-6 ${isDark ? "text-white/70" : "text-slate-700"}`}>
                            {errorData.prompt}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleErrorCopy(errorData.prompt)}
                            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                              errorCopied
                                ? isDark
                                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                                  : "border-green-200 bg-green-50 text-green-600"
                                : isDark
                                ? "border-white/10 text-white/50 hover:bg-white/10"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {errorCopied ? "복사됨!" : "복사"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 다시 시작 */}
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`text-sm underline underline-offset-4 transition ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    다른 아이디어로 다시 시작하기
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* 푸터 */}
      <footer className={`relative z-10 border-t px-6 py-10 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">
            VIBE PROJECT
          </span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>
            누구나 자신의 아이디어를 현실로 구현하도록
          </span>
        </div>
      </footer>
    </main>
  );
}
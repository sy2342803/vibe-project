"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const features = [
  {
    number: "01",
    title: "바이브 코딩 첫걸음",
    description:
      "어떻게 질문해야 AI가 좋은 결과를 만들어주는지부터 안내합니다. 좋은 프롬프트를 만드는 감각을 자연스럽게 익힐 수 있습니다.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    number: "02",
    title: "아이디어 기획 훈련",
    description:
      "머릿속 아이디어를 핵심 기능, 사용자 흐름, 화면 구조로 나누는 방법을 배웁니다. 개발을 몰라도 기획을 구체화할 수 있습니다.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    number: "03",
    title: "실전 코드 적용 가이드",
    description:
      "AI가 만들어준 코드를 어디에 붙여넣고 어떤 파일을 수정해야 하는지 단계별로 설명합니다. 처음 보는 프로젝트 구조도 따라갈 수 있습니다.",
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    number: "04",
    title: "에러 극복 튜토리얼",
    description:
      "에러 메시지를 쉬운 말로 해석하고, AI에게 다시 질문해 해결하는 방법을 배웁니다. 막히는 순간을 학습의 기회로 바꿔줍니다.",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    number: "05",
    title: "1일 프로토타입 챌린지",
    description:
      "긴 이론 학습보다 하루 안에 눈에 보이는 첫 프로토타입을 만드는 데 집중합니다. 빠른 성취 경험이 가능합니다.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    number: "06",
    title: "비전공자 맞춤 설명",
    description:
      "어려운 개발 용어는 최대한 쉽게 풀어 설명합니다. 문과생도 일상어로 AI와 대화하며 개발 흐름을 이해할 수 있습니다.",
    gradient: "from-teal-500 to-emerald-400",
  },
];

const steps = [
  {
    number: "01",
    title: "아이디어 대화하기",
    description:
      "만들고 싶은 서비스를 AI 튜터에게 자연스럽게 설명하며 아이디어를 구체화합니다.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    number: "02",
    title: "프롬프트 다듬기",
    description:
      "막연한 요청을 AI가 이해하기 쉬운 바이브 코딩용 프롬프트로 바꾸는 방법을 배웁니다.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    number: "03",
    title: "코드 실행 및 확인",
    description:
      "생성된 코드를 실제 프로젝트에 적용하고, 화면에서 결과물을 확인하는 과정을 따라갑니다.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    number: "04",
    title: "에러 해결 및 완성",
    description:
      "막히는 부분을 AI와 함께 해결하며 개발 사이클을 끝까지 경험하고 결과물을 완성합니다.",
    gradient: "from-orange-500 to-amber-500",
  },
];

const userTypes = [
  {
    title: "창업 아이디어는 있지만 개발을 모르는 문과생",
    description:
      "머릿속 아이디어를 눈에 보이는 프로토타입으로 빠르게 만들어 검증해보고 싶은 학생에게 적합합니다.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "코딩 교육 기회가 부족했던 지역 대학생",
    description:
      "복잡한 개발 환경이나 비싼 강의 없이도, 웹브라우저와 AI를 활용해 실전 개발 경험을 시작할 수 있습니다.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    title: "혼자서도 무언가를 만들어보고 싶은 비전공자",
    description:
      "남이 대신 만들어주는 것이 아니라, 스스로 AI를 활용해 결과물을 완성하는 경험을 쌓고 싶은 사람에게 추천합니다.",
    gradient: "from-pink-500 to-rose-400",
  },
];

const faqs = [
  {
    question: "코딩을 한 번도 해본 적 없는데 정말 하루 만에 가능한가요?",
    answer:
      "네, 가능합니다. 문법을 외워 직접 코드를 모두 작성하는 방식이 아니라, AI에게 자연어로 요청하고 결과를 적용하는 바이브 코딩 방식으로 접근하기 때문입니다.",
  },
  {
    question: "기존 코딩 강의와 무엇이 다른가요?",
    answer:
      "이론이나 문법 중심이 아니라, 내 아이디어를 실제로 구현하기 위해 AI를 어떻게 활용하고 에러를 어떻게 해결하는지 배우는 실전형 튜터라는 점이 다릅니다.",
  },
  {
    question: "어떤 종류의 앱을 만들어볼 수 있나요?",
    answer:
      "맛집 리뷰, 게시판, 포트폴리오, 커뮤니티, 정보 정리 서비스 등 창업 아이디어 검증에 필요한 초기 프로토타입을 만들어볼 수 있습니다.",
  },
  {
    question: "과정을 마치면 혼자서도 개발할 수 있게 되나요?",
    answer:
      "완벽한 개발자가 되는 것보다, AI와 대화하며 문제를 해결하고 아이디어를 직접 구현하는 감각을 익히는 것이 목표입니다. 스스로 시작할 수 있는 자신감을 얻을 수 있습니다.",
  },
];

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");

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

  return (
    <main
      id="top"
      className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${
        isDark ? "bg-[#080812] text-white" : "bg-white text-slate-900"
      }`}
    >
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>
      )}

      {/* 헤더 */}
      <nav
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${
          isDark
            ? "border-white/5 bg-[#080812]/80"
            : "border-slate-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <a
            href="#top"
            className={`text-base font-extrabold tracking-tight md:text-lg ${
              isDark
                ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
            }`}
          >
            VIBE PROJECT
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className={`text-sm font-medium transition ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              학습 기능
            </a>
            <a
              href="#how"
              className={`text-sm font-medium transition ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              사용 방법
            </a>
            <a
              href="#faq"
              className={`text-sm font-medium transition ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div
              className={`flex overflow-hidden rounded-full border p-1 transition-all duration-300 ${
                isDark
                  ? "border-white/10 bg-white/10"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                aria-label="Light mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  !isDark
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                <SunIcon />
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                aria-label="Dark mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                  isDark
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MoonIcon />
              </button>
            </div>

            <a
              href="/workspace"
              className={`hidden rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition md:block lg:px-5 lg:py-2.5 ${
                isDark
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-900/40 hover:opacity-90"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              }`}
            >
              START
            </a>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative z-10 overflow-hidden px-4 pb-24 pt-16 text-center md:pb-28 md:pt-36">
        {!isDark && (
          <>
            <div
              className="absolute inset-0 -z-10 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/70 via-white to-white" />
            <div className="absolute -left-16 top-10 -z-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="absolute right-0 top-24 -z-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
          </>
        )}

        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${
            isDark
              ? "border-white/10 bg-white/5 text-white/60 backdrop-blur"
              : "border-slate-200 bg-white text-slate-600 shadow-sm"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDark ? "animate-pulse bg-blue-400" : "bg-blue-500"
            }`}
          />
          비전공자를 위한 실전 바이브 코딩 가이드
        </div>

        <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
          오늘 떠오른 아이디어,
          <br />
          <span
            className={
              isDark
                ? "bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent"
                : "text-blue-600"
            }
          >
            오늘 안에 완성하세요.
          </span>
        </h1>

        <p
          className={`mx-auto mt-6 max-w-2xl text-xl font-medium md:text-2xl ${
            isDark ? "text-white/55" : "text-slate-500"
          }`}
        >
          비전공자도, 1일 만에, 진짜 프로토타입.
        </p>

        <p
          className={`mx-auto mt-3 max-w-2xl text-base leading-relaxed ${
            isDark ? "text-white/35" : "text-slate-400"
          }`}
        >
          AI와 대화하며 개발하는 바이브 코딩을 가장 쉽게 배웁니다.
          <br className="hidden md:block" />
          당신의 첫 웹앱, 여기서 시작하세요.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/workspace"
            className={`rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wide transition sm:text-base ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl hover:scale-[1.02] hover:opacity-90"
                : "bg-blue-600 text-white shadow-xl hover:scale-[1.02] hover:bg-blue-700"
            }`}
          >
            바이브 코딩 시작하기 →
          </a>
          <a
            href="#how"
            className={`rounded-full border px-8 py-3 text-sm font-bold uppercase tracking-wide transition sm:text-base ${
              isDark
                ? "border-white/10 bg-white/5 text-white/70 backdrop-blur hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            }`}
          >
            사용 방법 보기
          </a>
        </div>

        {/* 채팅 미리보기 */}
        <div
          className={`mx-auto mt-20 max-w-2xl overflow-hidden rounded-[2rem] text-left transition-all duration-500 ${
            isDark
              ? "border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl"
              : "border border-slate-200 bg-white shadow-2xl shadow-slate-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 border-b px-5 py-3 ${
              isDark ? "border-white/10" : "border-slate-100 bg-slate-50"
            }`}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span
              className={`ml-2 text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-white/30" : "text-slate-400"
              }`}
            >
              VIBE PROJECT — AI 튜터
            </span>
          </div>

          <div className="space-y-4 p-6">
            {/* 사용자 - 오른쪽 */}
            <div className="flex flex-row-reverse gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDark
                    ? "bg-white/10 text-white/60"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                나
              </div>
              <div
                className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm ${
                  isDark
                    ? "bg-white/10 text-white/80"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                학교 근처 맛집을 공유하는 앱을 만들고 싶어요.
              </div>
            </div>

            {/* AI - 왼쪽 */}
            <div className="flex gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  isDark
                    ? "bg-gradient-to-br from-blue-500 to-violet-500"
                    : "bg-blue-600"
                }`}
              >
                AI
              </div>

              <div
                className={`max-w-sm rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white ${
                  isDark
                    ? "bg-gradient-to-br from-blue-600/80 to-violet-600/80"
                    : "bg-blue-600"
                }`}
              >
                <p className="font-semibold">
                  좋아요! AI에게는 이렇게 요청해보세요.
                </p>
                <p
                  className={`mt-2 rounded-xl px-3 py-2 text-xs ${
                    isDark
                      ? "bg-white/10 text-white/80"
                      : "bg-blue-700/50 text-blue-100"
                  }`}
                >
                  “사용자들이 사진과 별점을 남길 수 있는 맛집 리스트 웹앱을
                  React + Tailwind로 만들어줘.”
                </p>
                <p
                  className={`mt-2 text-xs ${
                    isDark ? "text-white/50" : "text-blue-200"
                  }`}
                >
                  구체적인 요청이 더 좋은 결과를 만듭니다.
                </p>
              </div>
            </div>

            {/* 사용자 - 오른쪽 */}
            <div className="flex flex-row-reverse gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDark
                    ? "bg-white/10 text-white/60"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                나
              </div>
              <div
                className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm ${
                  isDark
                    ? "bg-white/10 text-white/80"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                오, 이렇게 구체적으로 말해야 하는군요!
              </div>
            </div>

            {/* AI 입력 중 - 왼쪽 */}
            <div className="flex gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  isDark
                    ? "bg-gradient-to-br from-blue-500 to-violet-500"
                    : "bg-blue-600"
                }`}
              >
                AI
              </div>
              <div
                className={`inline-flex items-center rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${
                  isDark
                    ? "bg-white/10 text-white/60"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <span className="animate-pulse">입력 중...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 */}
      <section
        className={`relative z-10 border-y py-14 ${
          isDark
            ? "border-white/5 bg-white/[0.02] backdrop-blur"
            : "border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: "1일", label: "프로토타입 완성 목표" },
            { value: "0줄", label: "사전 코딩 지식 필요 없음" },
            { value: "자연어", label: "일상어로 배우는 개발" },
            { value: "자생력", label: "스스로 만들어내는 능력" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className={`text-3xl font-extrabold tracking-tight md:text-4xl ${
                  isDark
                    ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
                    : "text-slate-900"
                }`}
              >
                {stat.value}
              </div>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/30" : "text-slate-400"
                }`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 기능 */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className={`text-sm font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-violet-400" : "text-blue-600"
              }`}
            >
              Features
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              단순한 도구가 아닙니다.
              <br />
              <span
                className={
                  isDark
                    ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
                    : ""
                }
              >
                당신의 첫 바이브 코딩 튜터입니다.
              </span>
            </h2>
            <p
              className={`mt-4 text-base leading-7 ${
                isDark ? "text-white/40" : "text-slate-500"
              }`}
            >
              비전공자가 처음 AI로 개발을 시도할 때 막막한 지점들을 짚어주고,
              스스로 아이디어를 구현할 수 있도록 단계별로 안내합니다.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition ${
                  isDark
                    ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20 hover:bg-white/10"
                    : "border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-lg"
                }`}
              >
                {isDark && (
                  <div
                    className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />
                )}

                <div
                  className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                    isDark
                      ? `bg-gradient-to-br ${feature.gradient} text-white shadow-lg`
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {feature.number}
                </div>

                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-7 ${
                    isDark ? "text-white/50" : "text-slate-500"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section
        id="how"
        className={`relative z-10 px-6 py-24 ${isDark ? "" : "bg-slate-50"}`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className={`text-sm font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-violet-400" : "text-blue-600"
              }`}
            >
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              4단계면 충분합니다.
            </h2>
            <p
              className={`mt-4 text-base leading-7 ${
                isDark ? "text-white/40" : "text-slate-500"
              }`}
            >
              복잡한 이론 강의는 줄이고, 내 아이디어를 실제로 구현하는 과정
              자체를 하나의 학습 경험으로 설계했습니다.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition ${
                  isDark
                    ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20 hover:bg-white/10"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {isDark && (
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${step.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />
                )}

                <div
                  className={`text-3xl font-extrabold ${
                    isDark
                      ? `bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`
                      : "text-blue-600"
                  }`}
                >
                  {step.number}
                </div>
                <h3
                  className={`mt-4 text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-7 ${
                    isDark ? "text-white/50" : "text-slate-500"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 대상 */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p
              className={`text-sm font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-violet-400" : "text-blue-600"
              }`}
            >
              For You
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              이런 분들을 위해 만들었습니다.
            </h2>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {userTypes.map((user) => (
              <div
                key={user.title}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition ${
                  isDark
                    ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20 hover:bg-white/10"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
                }`}
              >
                {isDark && (
                  <div
                    className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${user.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />
                )}

                <div
                  className={`h-1 w-12 rounded-full ${
                    isDark
                      ? `bg-gradient-to-r ${user.gradient}`
                      : "bg-blue-600"
                  }`}
                />
                <h3
                  className={`mt-6 text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {user.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-7 ${
                    isDark ? "text-white/50" : "text-slate-500"
                  }`}
                >
                  {user.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className={`relative z-10 px-6 py-24 ${isDark ? "" : "bg-slate-50"}`}
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p
              className={`text-sm font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-violet-400" : "text-blue-600"
              }`}
            >
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              자주 묻는 질문
            </h2>
          </div>

          <div className="mt-16 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className={`rounded-2xl border px-6 py-5 transition ${
                  isDark
                    ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between font-semibold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {faq.question}
                  <span
                    className={`ml-4 shrink-0 ${
                      isDark ? "text-white/30" : "text-slate-400"
                    }`}
                  >
                    ↓
                  </span>
                </summary>
                <p
                  className={`mt-4 text-sm leading-7 ${
                    isDark ? "text-white/50" : "text-slate-500"
                  }`}
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10 px-6 py-32 text-center">
        <div
          className={`relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-8 py-20 ${
            isDark
              ? "border border-white/10 bg-white/5 backdrop-blur-xl"
              : "bg-slate-900 shadow-2xl"
          }`}
        >
          {isDark ? (
            <>
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
              <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />
            </>
          ) : (
            <>
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />
              <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
            </>
          )}

          <h2 className="relative text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            당신의 첫 웹앱,
            <br />
            <span
              className={
                isDark
                  ? "bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-blue-400"
              }
            >
              여기서 시작하세요.
            </span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg leading-8 text-white/60">
            막연했던 아이디어를 바이브 코딩으로 현실로 만들어보세요.
            지금 바로 첫 프로토타입을 시작할 수 있습니다.
          </p>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/workspace"
              className={`rounded-xl px-8 py-4 text-base font-semibold text-white transition ${
                isDark
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-2xl shadow-violet-900/50 hover:scale-[1.02] hover:opacity-90"
                  : "bg-blue-600 shadow-lg shadow-blue-900/50 hover:bg-blue-500"
              }`}
            >
              무료로 시작하기 →
            </a>
            <a
              href="#features"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/70 backdrop-blur transition hover:bg-white/10"
            >
              기능 다시 보기
            </a>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer
        className={`relative z-10 border-t px-6 py-10 ${
          isDark ? "border-white/5" : "border-slate-100"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">
            VIBE PROJECT
          </span>
          <span
            className={`text-sm ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            누구나 자신의 아이디어를 현실로 구현하도록
          </span>
          <span
            className={`text-sm ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            비전공자를 위한 실전 바이브 코딩 교육 웹앱
          </span>
        </div>
      </footer>
    </main>
  );
}
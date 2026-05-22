"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface TodayRouteItem {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  tip: string;
}

const STORAGE_KEY = "vibe-today-route-checks";

const TODAY_ROUTE_ITEMS: TodayRouteItem[] = [
  {
    id: "narrow-idea",
    title: "아이디어를 한 문장으로 줄이기",
    description:
      "너무 큰 앱이 되지 않도록 누구의 어떤 문제를 해결하는지 한 문장으로 정리합니다.",
    estimatedMinutes: 10,
    tip: "예: 우리 학교 학생들이 팀플 일정을 쉽게 정리하는 웹앱",
  },
  {
    id: "pick-features",
    title: "핵심 기능 3개만 고르기",
    description:
      "로그인, 결제, 실시간 채팅처럼 어려운 기능은 첫 버전에서 빼고 꼭 필요한 기능만 남깁니다.",
    estimatedMinutes: 15,
    tip: "처음 버전은 입력하기, 목록 보기, 결과 복사하기 정도면 충분합니다.",
  },
  {
    id: "make-ui",
    title: "v0 또는 Lovable로 첫 화면 만들기",
    description:
      "도구별 프롬프트를 복사해서 첫 화면과 기본 구조를 생성합니다.",
    estimatedMinutes: 30,
    tip: "처음에는 예쁜 디자인보다 화면 구조가 이해되는지가 더 중요합니다.",
  },
  {
    id: "run-code",
    title: "Cursor 또는 Replit에서 코드 실행하기",
    description:
      "생성된 코드를 실행하고, 브라우저에서 화면이 열리는지 확인합니다.",
    estimatedMinutes: 30,
    tip: "에러가 나도 당황하지 말고 가장 위에 나온 첫 번째 에러부터 확인하세요.",
  },
  {
    id: "fix-error",
    title: "에러 메시지 하나씩 해결하기",
    description:
      "에러가 나면 전체 코드를 바꾸지 말고 첫 번째 에러부터 해결합니다.",
    estimatedMinutes: 40,
    tip: "에러 메시지는 그대로 복사해서 에러 번역기에 붙여넣으면 됩니다.",
  },
  {
    id: "check-mobile",
    title: "모바일 화면 확인하기",
    description:
      "브라우저 개발자 도구에서 360px 화면으로 깨지는 부분이 없는지 확인합니다.",
    estimatedMinutes: 15,
    tip: "버튼이 너무 작거나 글자가 잘리면 모바일 사용자가 쓰기 어렵습니다.",
  },
  {
    id: "deploy",
    title: "Vercel에 배포하기",
    description:
      "GitHub에 올린 뒤 Vercel로 배포하고, 친구에게 링크를 공유해 테스트를 받습니다.",
    estimatedMinutes: 30,
    tip: "API 키는 GitHub에 올리지 말고 Vercel Environment Variables에 넣어야 합니다.",
  },
];

export default function TodayRoutePage() {
  const checklist = useMemo(() => TODAY_ROUTE_ITEMS, []);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setCheckedIds(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      setCheckedIds([]);
    }
  }, []);

  const totalMinutes = checklist.reduce(
    (sum, item) => sum + item.estimatedMinutes,
    0
  );

  const checkedMinutes = checklist
    .filter((item) => checkedIds.includes(item.id))
    .reduce((sum, item) => sum + item.estimatedMinutes, 0);

  const progress =
    checklist.length > 0
      ? Math.round((checkedIds.length / checklist.length) * 100)
      : 0;

  const toggleCheck = (id: string) => {
    setCheckedIds((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage를 사용할 수 없는 환경에서는 화면 상태만 유지합니다.
      }

      return next;
    });
  };

  const reset = () => {
    setCheckedIds([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage를 사용할 수 없는 환경에서는 무시합니다.
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-extrabold text-blue-600">
            VIBE PROJECT
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/error-helper"
              className="hidden rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 sm:inline-flex"
            >
              에러 번역기
            </Link>

            <Link
              href="/workspace"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
            >
              아이디어 만들기
            </Link>
          </div>
        </nav>

        <section className="mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white shadow-sm md:p-8">
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
            ✅ 오늘 완성 루트
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
            오늘 안에 MVP를 완성하는 체크리스트
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
            처음부터 완벽한 앱을 만들려고 하면 오래 걸립니다. 오늘은 작게
            만들고, 실행하고, 배포하는 것까지 가는 게 목표예요.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-bold text-white/70">진행률</p>
              <p className="mt-1 text-2xl font-extrabold">{progress}%</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-bold text-white/70">완료한 단계</p>
              <p className="mt-1 text-2xl font-extrabold">
                {checkedIds.length}/{checklist.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs font-bold text-white/70">예상 시간</p>
              <p className="mt-1 text-2xl font-extrabold">
                {checkedMinutes}/{totalMinutes}분
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>전체 진행 상황</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {!isMounted && (
          <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            체크 상태를 불러오는 중입니다.
          </section>
        )}

        <section className="space-y-4">
          {checklist.map((item, index) => {
            const isChecked = checkedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className={`w-full rounded-3xl border p-5 text-left shadow-sm transition ${
                  isChecked
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                aria-pressed={isChecked}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold ${
                      isChecked
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isChecked ? "✓" : index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`font-extrabold ${
                          isChecked ? "text-blue-700" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </h2>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                        약 {item.estimatedMinutes}분
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>

                    <div
                      className={`mt-3 rounded-2xl p-3 text-xs leading-6 ${
                        isChecked
                          ? "bg-white text-blue-700"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      <span className="font-bold">팁: </span>
                      {item.tip}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            체크 초기화
          </button>

          <Link
            href="/error-helper"
            className="rounded-2xl bg-red-500 px-5 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-red-600"
          >
            에러가 났다면 에러 번역기로 가기
          </Link>

          <Link
            href="/workspace"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            내 아이디어 다시 다듬기
          </Link>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decompressFromEncodedURIComponent } from "lz-string";

type Theme = "light" | "dark";

interface PlanData {
  idea: string;
  problem: string;
  target: string;
  features: string[];
  screens: string[];
  prompts: string[];
}

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

function PrintStyles() {
  return (
    <style jsx global>{`
      @page {
        size: A4;
        margin: 16mm 12mm 16mm 12mm;
      }

      @media print {
        html,
        body {
          width: 210mm;
          min-height: 297mm;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        * {
          box-sizing: border-box !important;
          text-shadow: none !important;
          filter: none !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
        }

        main {
          min-height: auto !important;
          background: #ffffff !important;
          color: #0f172a !important;
          overflow: visible !important;
        }

        nav,
        .print\\:hidden {
          display: none !important;
        }

        .pdf-page {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          overflow: visible !important;
        }

        .pdf-header {
          margin-bottom: 18px !important;
          padding-bottom: 14px !important;
          border-bottom: 3px solid #2563eb !important;
          text-align: left !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-badge {
          border: 0 !important;
          background: transparent !important;
          color: #2563eb !important;
          padding: 0 !important;
          margin-bottom: 8px !important;
          font-size: 11px !important;
          line-height: 1.6 !important;
        }

        .pdf-title {
          color: #0f172a !important;
          font-size: 24px !important;
          line-height: 1.45 !important;
          letter-spacing: -0.02em !important;
          margin: 0 !important;
          padding: 0 !important;
          word-break: keep-all !important;
          overflow-wrap: break-word !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-section-title {
          display: block !important;
          position: relative !important;
          overflow: visible !important;
          color: #2563eb !important;
          font-size: 18px !important;
          font-weight: 800 !important;
          line-height: 2 !important;
          min-height: 36px !important;
          margin: 24px 0 12px !important;
          padding-top: 8px !important;
          padding-bottom: 4px !important;
          break-inside: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          word-break: keep-all !important;
          overflow-wrap: break-word !important;
        }

        .pdf-section-title::before {
          content: "";
          display: block;
          height: 1px;
          margin-top: -1px;
        }

        .pdf-card,
        .pdf-small-card {
          width: 100% !important;
          display: block !important;
          overflow: visible !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          box-shadow: none !important;
          border-radius: 12px !important;
          margin-bottom: 12px !important;
          padding: 16px !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-summary-card {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
        }

        .pdf-prompt-section {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
          break-inside: auto !important;
          page-break-inside: auto !important;
        }

        .pdf-prompt-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-grid {
          display: block !important;
        }

        .pdf-grid > * {
          width: 100% !important;
          margin-bottom: 12px !important;
        }

        .pdf-num {
          background: #eff6ff !important;
          color: #2563eb !important;
          border: 1px solid #dbeafe !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        h1,
        h2,
        h3,
        p,
        li,
        span,
        div {
          color: inherit !important;
          overflow: visible !important;
        }

        h1,
        h2,
        h3 {
          line-height: 1.6 !important;
          padding-top: 2px !important;
          padding-bottom: 2px !important;
          break-inside: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          page-break-after: avoid !important;
          word-break: keep-all !important;
          overflow-wrap: break-word !important;
        }

        p,
        li {
          font-size: 12px !important;
          line-height: 1.85 !important;
          word-break: keep-all !important;
          overflow-wrap: break-word !important;
          orphans: 3 !important;
          widows: 3 !important;
        }

        ul {
          margin: 0 !important;
          padding: 0 !important;
          list-style: none !important;
        }

        li {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }

        .pdf-muted {
          color: #475569 !important;
        }

        .pdf-label {
          color: #64748b !important;
          font-size: 11px !important;
          line-height: 1.6 !important;
        }

        .pdf-dot {
          background: #2563eb !important;
        }

        .pdf-footer-space {
          display: none !important;
        }
      }
    `}</style>
  );
}

function decodeData(encoded: string): PlanData {
  const decompressed = decompressFromEncodedURIComponent(encoded);

  if (decompressed) {
    return normalizeSharedData(JSON.parse(decompressed));
  }

  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  const binaryString = atob(base64);
  const utf8String = Array.from(binaryString, (char) => {
    return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
  }).join("");

  return normalizeSharedData(JSON.parse(decodeURIComponent(utf8String)));
}

function normalizeSharedData(value: unknown): PlanData {
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const toText = (item: unknown) => {
    if (typeof item === "string") return item;

    if (item && typeof item === "object") {
      const itemRecord = item as Record<string, unknown>;

      return [itemRecord.name, itemRecord.desc || itemRecord.description]
        .filter(Boolean)
        .join(": ");
    }

    return "";
  };

  const toList = (list: unknown) =>
    Array.isArray(list) ? list.map(toText).filter(Boolean) : [];

  return {
    idea: typeof record.idea === "string" ? record.idea : "",
    problem:
      typeof record.problem === "string"
        ? record.problem
        : "공유된 기획서의 문제 정의를 읽을 수 없습니다.",
    target:
      typeof record.target === "string"
        ? record.target
        : "공유된 기획서의 대상 사용자 정보를 읽을 수 없습니다.",
    features: toList(record.features),
    screens: toList(record.screens),
    prompts: toList(record.prompts),
  };
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<Theme>("light");
  const [data, setData] = useState<PlanData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const savedTheme = localStorage.getItem("vibe-theme");

      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme as Theme);
      }

      const dataParam = searchParams.get("d");

      if (dataParam) {
        try {
          const decoded = decodeData(dataParam);
          setData(decoded);
        } catch (decodeError) {
          console.error("데이터 복원 실패", {
            message:
              decodeError instanceof Error
                ? decodeError.message
                : "Unknown decode error",
          });
          setError(true);
        }
      } else {
        setError(true);
      }
    });
  }, [searchParams]);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  if (error) {
    return (
      <>
        <PrintStyles />

        <div
          className={`brand-page flex min-h-screen flex-col items-center justify-center ${
            isDark ? "brand-dark text-white" : "text-slate-900"
          }`}
        >
          <h1 className="text-2xl font-bold">유효하지 않은 링크입니다 🥲</h1>

          <p className="mt-4 text-slate-500">
            데이터가 손상되었거나 주소가 잘못되었습니다.
          </p>

          <Link
            href="/workspace"
            className="brand-pill-primary mt-8 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            내 아이디어 기획하러 가기
          </Link>
        </div>
      </>
    );
  }

  if (!data) return null;

  return (
    <>
      <PrintStyles />

      <main
        className={`brand-page relative min-h-screen antialiased transition-colors duration-500 ${
          isDark ? "brand-dark text-white" : "text-slate-900"
        }`}
      >
        <nav
          className={`brand-nav sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 print:hidden ${
            isDark
              ? "border-white/5 bg-[#0c0c1d]/80"
              : "border-slate-200 bg-white/90"
          }`}
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <Link
              href="/"
              className={`brand-wordmark text-base font-extrabold tracking-tight md:text-lg ${
                isDark
                  ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
              }`}
            >
              VIBE PROJECT
            </Link>

            <div className="flex items-center gap-3">
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

              <Link
                href="/"
                className={`brand-pill-secondary hidden rounded-full px-4 py-1.5 text-xs font-bold transition sm:block ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                나도 만들기
              </Link>
            </div>
          </div>
        </nav>

        <div className="pdf-page mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
          <div className="pdf-header mb-10 text-center">
            <div
              className={`pdf-badge mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                isDark
                  ? "border-white/10 bg-white/5 text-blue-400"
                  : "border-blue-100 bg-blue-50 text-blue-600"
              }`}
            >
              🚀 VIBE PROJECT 기획서
            </div>

            <h1 className="pdf-title text-3xl font-extrabold tracking-tight md:text-4xl">
              우리가 만들 서비스
            </h1>
          </div>

          <div
            className={`pdf-card mb-8 rounded-2xl border p-6 md:p-8 ${
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-sm"
            }`}
          >
            <p
              className={`pdf-label mb-2 text-xs font-bold uppercase tracking-widest ${
                isDark ? "text-white/40" : "text-slate-400"
              }`}
            >
              💡 초기 아이디어
            </p>

            <p
              className={`pdf-muted text-base leading-relaxed md:text-lg ${
                isDark ? "text-white/90" : "text-slate-800"
              }`}
            >
              &ldquo;{data.idea}&rdquo;
            </p>
          </div>

          <div className="pdf-grid mb-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "문제 정의",
                content: data.problem,
                darkGradient: "from-blue-500 to-cyan-400",
                lightClass: "bg-blue-50 text-blue-600",
                num: "01",
              },
              {
                title: "대상 사용자",
                content: data.target,
                darkGradient: "from-violet-500 to-purple-400",
                lightClass: "bg-violet-50 text-violet-600",
                num: "02",
              },
            ].map((card) => (
              <div
                key={card.num}
                className={`pdf-small-card rounded-2xl border p-6 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`pdf-num flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                      isDark
                        ? `bg-gradient-to-br ${card.darkGradient} text-white`
                        : card.lightClass
                    }`}
                  >
                    {card.num}
                  </div>

                  <h3
                    className={`font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {card.title}
                  </h3>
                </div>

                <p
                  className={`pdf-muted text-sm leading-7 ${
                    isDark ? "text-white/60" : "text-slate-600"
                  }`}
                >
                  {card.content}
                </p>
              </div>
            ))}
          </div>

          <h2 className="pdf-section-title text-xl font-extrabold text-blue-600">
            3. 사용자가 실제로 하는 일
          </h2>

          <div className="mb-8 space-y-3">
            {data.screens.map((item, index) => (
              <div
                key={index}
                className={`pdf-small-card flex items-start gap-4 rounded-2xl border p-4 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <div className="pdf-num flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold bg-blue-50 text-blue-600">
                  {index + 1}
                </div>

                <p
                  className={`pdf-muted text-sm leading-7 ${
                    isDark ? "text-white/60" : "text-slate-600"
                  }`}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>

          <h2 className="pdf-section-title text-xl font-extrabold text-blue-600">
            4. 첫 버전 핵심 기능과 검수 기준
          </h2>

          <div className="mb-8 space-y-4">
            {data.features.map((item, index) => (
              <div
                key={index}
                className={`pdf-small-card rounded-2xl border p-6 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="pdf-num flex h-8 shrink-0 items-center justify-center rounded-xl px-3 text-xs font-bold bg-blue-50 text-blue-600">
                    기능 {index + 1}
                  </div>

                  <h3
                    className={`font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item}
                  </h3>
                </div>

                <p
                  className={`pdf-muted text-sm leading-7 ${
                    isDark ? "text-white/60" : "text-slate-600"
                  }`}
                >
                  사용자가 이 기능을 문제없이 사용할 수 있어야 합니다.
                </p>
              </div>
            ))}
          </div>

          <h2 className="pdf-section-title text-xl font-extrabold text-blue-600">
            5. 필요한 화면 구성
          </h2>

          <div className="pdf-grid mb-8 grid gap-4 sm:grid-cols-2">
            {data.screens.map((screen, index) => (
              <div
                key={index}
                className={`pdf-small-card rounded-2xl border p-6 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <h3
                  className={`mb-2 font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {index + 1}. {screen}
                </h3>

                <p
                  className={`pdf-muted text-sm leading-7 ${
                    isDark ? "text-white/60" : "text-slate-600"
                  }`}
                >
                  이 화면에서 사용자가 필요한 정보를 확인하고 다음 행동을 할 수
                  있어야 합니다.
                </p>
              </div>
            ))}
          </div>

          <h2 className="pdf-section-title text-xl font-extrabold text-blue-600">
            6. AI 구현 도구에 붙여넣을 프롬프트
          </h2>

          <div
            className={`pdf-card pdf-prompt-section mb-12 rounded-2xl border p-6 md:p-8 ${
              isDark
                ? "border-blue-500/20 bg-blue-500/5"
                : "border-blue-100 bg-blue-50"
            }`}
          >
            <p
              className={`pdf-label mb-4 text-sm font-bold ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}
            >
              ✨ AI 생성 가이드 프롬프트
            </p>

            <div className="space-y-3">
              {data.prompts.map((prompt, i) => (
                <div
                  key={i}
                  className={`pdf-prompt-card rounded-xl p-4 ${
                    isDark ? "bg-white/5" : "bg-white shadow-sm"
                  }`}
                >
                  <p
                    className={`pdf-muted text-sm leading-relaxed ${
                      isDark ? "text-white/80" : "text-slate-700"
                    }`}
                  >
                    {prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`pdf-footer-space flex flex-col items-center justify-center gap-4 border-t pt-8 sm:flex-row print:hidden ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={handlePrint}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition sm:w-auto ${
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              🖨️ PDF로 저장 / 인쇄
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Result() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResultContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
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

// ✅ [수정 완료] 브라우저 환경에서 안전하게 한글을 복원해내는 디코딩 함수
function decodeData(encoded: string): PlanData {
  // 1. URL 안전 문자를 원래 Base64 문자로 복구
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  
  // 2. 패딩 부족 시 자릿수 맞추기
  while (base64.length % 4) {
    base64 += "=";
  }
  
  // 3. 디코딩 및 한글(% 엔티티) 복원
  const binaryString = atob(base64);
  const utf8String = Array.from(binaryString, (char) => {
    return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
  }).join("");
  
  return JSON.parse(decodeURIComponent(utf8String));
}

function ResultContent() {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<Theme>("light");
  const [data, setData] = useState<PlanData | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme as Theme);
    }

    const dataParam = searchParams.get("d");
    if (dataParam) {
      try {
        const decoded = decodeData(dataParam);
        setData(decoded);
      } catch (e) {
        console.error("데이터 복원 실패", e);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const handleCopyLink = () => {
    try {
      const dataParam = searchParams.get("d");
      if (!dataParam) {
        alert("공유할 데이터가 유효하지 않습니다.");
        return;
      }

      const origin = window.location.origin;
      const shareUrl = `${origin}/result?d=${dataParam}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          fallbackCopyText(shareUrl);
        });
      } else {
        fallbackCopyText(shareUrl);
      }
    } catch (err) {
      alert("링크 복사 중 에러가 발생했습니다.");
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("링크 복사에 실패했습니다. 주소창 링크를 복사해주세요.");
    }
    document.body.removeChild(textArea);
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center ${isDark ? "bg-[#0c0c1d] text-white" : "bg-white text-slate-900"}`}>
        <h1 className="text-2xl font-bold">유효하지 않은 링크입니다 🥲</h1>
        <p className="mt-4 text-slate-500">데이터가 손상되었거나 주소가 잘못되었습니다.</p>
        <Link href="/workspace" className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
          내 아이디어 기획하러 가기
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className={`relative min-h-screen antialiased transition-colors duration-500 ${isDark ? "bg-[#0c0c1d] text-white" : "bg-slate-50 text-slate-900"}`}>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 print:hidden ${isDark ? "border-white/5 bg-[#0c0c1d]/80" : "border-slate-200 bg-white/90"}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className={`text-base font-extrabold tracking-tight md:text-lg ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"}`}>
            VIBE PROJECT
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex overflow-hidden rounded-full border p-1 transition-all duration-300 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} aria-label="Light mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10 hover:text-white"}`}>
                <SunIcon />
              </button>
              <button type="button" onClick={() => handleThemeChange("dark")} aria-label="Dark mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
                <MoonIcon />
              </button>
            </div>
            <Link href="/" className={`hidden rounded-lg px-4 py-1.5 text-xs font-bold transition sm:block ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}>
              나도 만들기
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 text-center">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/5 text-blue-400" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
            🚀 VIBE PROJECT 기획서
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            우리가 만들 서비스
          </h1>
        </div>

        <div className={`mb-8 rounded-2xl border p-6 md:p-8 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
          <p className={`mb-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>
            💡 초기 아이디어
          </p>
          <p className={`text-base leading-relaxed md:text-lg ${isDark ? "text-white/90" : "text-slate-800"}`}>
            "{data.idea}"
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {[
            { title: "문제 정의", content: data.problem, darkGradient: "from-blue-500 to-cyan-400", lightClass: "bg-blue-50 text-blue-600", num: "01" },
            { title: "대상 사용자", content: data.target, darkGradient: "from-violet-500 to-purple-400", lightClass: "bg-violet-50 text-violet-600", num: "02" },
          ].map((card) => (
            <div key={card.num} className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${isDark ? `bg-gradient-to-br ${card.darkGradient} text-white` : card.lightClass}`}>
                  {card.num}
                </div>
                <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{card.title}</h3>
              </div>
              <p className={`text-sm leading-7 ${isDark ? "text-white/60" : "text-slate-600"}`}>{card.content}</p>
            </div>
          ))}

          {[
            { title: "핵심 기능", list: data.features, darkGradient: "from-pink-500 to-rose-400", lightClass: "bg-pink-50 text-pink-600", dot: isDark ? "bg-pink-400" : "bg-pink-500", num: "03" },
            { title: "필요한 화면", list: data.screens, darkGradient: "from-orange-500 to-amber-400", lightClass: "bg-orange-50 text-orange-600", dot: isDark ? "bg-orange-400" : "bg-orange-500", num: "04" },
          ].map((card) => (
            <div key={card.num} className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${isDark ? `bg-gradient-to-br ${card.darkGradient} text-white` : card.lightClass}`}>
                  {card.num}
                </div>
                <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{card.title}</h3>
              </div>
              <ul className="space-y-2">
                {card.list && card.list.map((item, j) => (
                  <li key={j} className={`flex items-start gap-2 text-sm leading-6 ${isDark ? "text-white/60" : "text-slate-600"}`}>
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${card.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`mb-12 rounded-2xl border p-6 md:p-8 ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-100 bg-blue-50"}`}>
          <p className={`mb-4 text-sm font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>
            ✨ AI 생성 가이드 프롬프트
          </p>
          <div className="space-y-3">
            {data.prompts && data.prompts.map((prompt, i) => (
              <div key={i} className={`rounded-xl p-4 ${isDark ? "bg-white/5" : "bg-white shadow-sm"}`}>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-slate-700"}`}>{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center gap-4 border-t pt-8 sm:flex-row print:hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <button onClick={handleCopyLink}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition sm:w-auto ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"}`}>
            {copied ? "✓ 링크 복사 완료!" : "🔗 공유 링크 복사하기"}
          </button>
          <button onClick={handlePrint}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition sm:w-auto ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            🖨️ PDF로 저장 / 인쇄
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Result() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResultContent />
    </Suspense>
  );
}
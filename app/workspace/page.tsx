"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Theme = "light" | "dark";

interface PlanData {
  problem: any;
  target: any;
  features: any[];
  screens: any[];
  prompts: any[];
}

interface ErrorData {
  cause: string;
  solution: string;
  prompt: string;
}

interface PromptData {
  original: string;
  improved: string;
  reason: string;
  tips: string[];
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

const renderContent = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.text || val.content || val.value || JSON.stringify(val);
  }
  return String(val);
};

export default function Workspace() {
  const [theme, setTheme] = useState<Theme>("light");
  const [idea, setIdea] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [errorText, setErrorText] = useState("");
  const [errorLoading, setErrorLoading] = useState(false);
  const [errorData, setErrorData] = useState<ErrorData | null>(null);
  const [errorCopied, setErrorCopied] = useState(false);

  const [promptInput, setPromptInput] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  const [copied, setCopied] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"error" | "prompt">("error");

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme as Theme);
    }

    const savedIdea = localStorage.getItem("vibe-idea");
    const savedPlan = localStorage.getItem("vibe-plan");
    if (savedIdea && savedPlan) {
      setIdea(savedIdea);
      setPlanData(JSON.parse(savedPlan));
      setSubmitted(true);
      setCurrentStep(2);
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
    setPlanData(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, type: "plan" }),
      });
      const json = await res.json();
      if (json.success) {
        setPlanData(json.data);
        localStorage.setItem("vibe-idea", idea);
        localStorage.setItem("vibe-plan", JSON.stringify(json.data));
        setCurrentStep(2);
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
      if (json.success) setErrorData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setErrorLoading(false);
    }
  };

  const handlePromptSubmit = async () => {
    if (!promptInput.trim()) return;
    setPromptLoading(true);
    setPromptData(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: promptInput, type: "prompt" }),
      });
      const json = await res.json();
      if (json.success) setPromptData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleReset = () => {
    setIdea("");
    setSubmitted(false);
    setPlanData(null);
    setErrorText("");
    setErrorData(null);
    setPromptInput("");
    setPromptData(null);
    setCopied(null);
    setErrorCopied(false);
    setPromptCopied(false);
    setCurrentStep(1);
    
    localStorage.removeItem("vibe-idea");
    localStorage.removeItem("vibe-plan");
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

  const handlePromptCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setPdfDownloading(true);

    try {
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const doc = new jsPDF("p", "mm", "a4");
      let position = 0;

      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save("서비스_구축_및_신규기획안.pdf");
    } catch (error) {
      console.error("PDF 생성 에러:", error);
      alert("PDF 리포트 빌드 중 문제가 발생했습니다.");
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleStepNavClick = (step: number) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (planData) {
      setCurrentStep(step);
    }
  };

  return (
    <main className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${isDark ? "bg-[#0c0c1d] text-white" : "bg-white text-slate-900"}`}>
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/25 blur-[120px]" />
        </div>
      )}

      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? "border-white/5 bg-[#0c0c1d]/80" : "border-slate-100 bg-white/90"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className={`text-base font-extrabold tracking-tight md:text-lg ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"}`}>
            VIBE PROJECT
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
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
            <Link href="/" className={`rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition ${isDark ? "border border-white/10 text-white/60 hover:bg-white/10 hover:text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              처음으로
            </Link>
          </div>
        </div>
      </nav>

      <div className={`border-b transition-colors duration-500 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
        <div className="mx-auto flex max-w-6xl items-center gap-0 overflow-x-auto px-6 py-4">
          {[
            { step: 1, label: "아이디어 입력" },
            { step: 2, label: "기획 정리" },
            { step: 3, label: "프롬프트 추천" },
            { step: 4, label: "AI 도구 활용" },
          ].map((item, index) => {
            const isCompleted = planData ? true : item.step <= currentStep;
            const isActive = item.step === currentStep;

            return (
              <div key={item.step} className="flex items-center">
                <button 
                  type="button"
                  disabled={item.step !== 1 && !planData}
                  onClick={() => handleStepNavClick(item.step)}
                  className={`flex items-center gap-2 whitespace-nowrap focus:outline-none transition ${item.step !== 1 && !planData ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                    isActive 
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/20" 
                      : isCompleted 
                        ? isDark ? "bg-violet-500 text-white" : "bg-blue-500 text-white"
                        : isDark ? "bg-white/10 text-white/30" : "bg-slate-200 text-slate-400"
                  }`}>
                    {isCompleted && !isActive && item.step < currentStep ? "✓" : item.step}
                  </div>
                  <span className={`text-sm font-semibold transition ${
                    isActive 
                      ? isDark ? "text-white font-bold" : "text-blue-600 font-bold" 
                      : isCompleted 
                        ? isDark ? "text-white/80" : "text-slate-700"
                        : isDark ? "text-white/30" : "text-slate-400"
                  }`}>
                    {item.label}
                  </span>
                </button>
                {index < 3 && (
                  <div className={`mx-3 h-px w-8 sm:w-12 ${planData || item.step < currentStep ? isDark ? "bg-violet-500/50" : "bg-blue-300" : isDark ? "bg-white/10" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {loading && (
          <div className="mt-16 flex flex-col items-center justify-center gap-6">
            <div className={`h-16 w-16 animate-spin rounded-full border-4 border-t-transparent ${isDark ? "border-violet-500" : "border-blue-600"}`} />
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold">잠깐만요, AI가 정리 중이에요!</h2>
              {["아이디어 분석 중...", "문제 정의하는 중...", "핵심 기능 정리 중..."].map((text, i) => (
                <p key={i} className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>{text}</p>
              ))}
            </div>
          </div>
        )}

        {!loading && currentStep === 1 && (
          <>
            <div className="text-center">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
                Step 1 — 아이디어 입력
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">어떤 서비스를 만들고 싶나요?</h1>
              <p className={`mx-auto mt-4 max-w-xl text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                완벽하게 정리하지 않아도 괜찮아요. 편하게 적어주세요.
              </p>
            </div>

            <div className="mt-10">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="예) 학교 근처 맛집을 친구들과 공유하는 앱을 만들고 싶어요."
                rows={5}
                className={`w-full resize-none rounded-2xl border px-5 py-4 text-base leading-7 outline-none transition ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500" : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-300 focus:border-blue-400"}`}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
                  {idea.length > 0 ? `${idea.length}자 입력됨` : "최소 10자 이상 입력해주세요"}
                </span>
                
                <div className="flex gap-2">
                  {planData && (
                    <button type="button" onClick={() => setCurrentStep(2)}
                      className={`rounded-xl px-5 py-3 text-sm font-semibold border ${isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      기획서로 돌아가기
                    </button>
                  )}
                  <button type="button" onClick={handleSubmit} disabled={idea.trim().length < 10}
                    className={`rounded-xl px-6 py-3 text-sm font-bold transition ${idea.trim().length >= 10 ? isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-blue-600 text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}>
                    AI 기획 정리 시작하기 →
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-14">
              <p className={`mb-4 text-center text-sm font-semibold uppercase tracking-widest ${isDark ? "text-white/30" : "text-slate-400"}`}>
                이런 아이디어도 괜찮아요
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {examples.map((example, i) => (
                  <button key={i} type="button" onClick={() => setIdea(example)}
                    className={`rounded-2xl border p-4 text-left text-sm leading-6 transition ${isDark ? "border-white/10 bg-white/5 text-white/60 hover:border-violet-500" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"}`}>
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && planData && (
          <div className="mt-2">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {currentStep === 2 && "📋 Step 2 — AI 기획 정리 결과물"}
                  {currentStep === 3 && "✨ Step 3 — 맞춤형 개발 프롬프트 추천"}
                  {currentStep === 4 && "🛠️ Step 4 — AI 연동 도구 워크스페이스"}
                </h2>
                <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                  상단의 단계 버튼을 클릭하면 완성된 각 결과물 페이지로 점프할 수 있습니다.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={pdfDownloading}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {pdfDownloading ? "보고서 빌드 중..." : "📄 실무 제안서 PDF 다운로드"}
              </button>
            </div>

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">내가 제출한 원래 생각</p>
                  <p className={`text-sm leading-7 ${isDark ? "text-slate-200" : "text-slate-700"}`}>{idea}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { num: "01", title: "문제 정의", gradient: "from-blue-500 to-cyan-400", lightColor: "bg-blue-50 text-blue-600", content: planData.problem },
                    { num: "02", title: "대상 사용자", gradient: "from-violet-500 to-purple-400", lightColor: "bg-violet-50 text-violet-600", content: planData.target },
                    { num: "03", title: "핵심 기능", gradient: "from-pink-500 to-rose-400", lightColor: "bg-pink-50 text-pink-600", list: planData.features },
                    { num: "04", title: "필요한 화면", gradient: "from-orange-500 to-amber-400", lightColor: "bg-orange-50 text-orange-600", list: planData.screens },
                  ].map((card) => (
                    <div key={card.num} className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                      <div className="mb-3 flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${isDark ? `bg-gradient-to-br ${card.gradient} text-white` : card.lightColor}`}>
                          {card.num}
                        </div>
                        <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{card.title}</h3>
                      </div>
                      {"content" in card && card.content && (
                        <p className={`text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{renderContent(card.content)}</p>
                      )}
                      {"list" in card && card.list && Array.isArray(card.list) && (
                        <ul className="space-y-2">
                          {card.list.map((item, i) => (
                            <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${isDark ? "bg-violet-400" : "bg-blue-400"}`} />
                              {renderContent(item)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="button" onClick={() => setCurrentStep(3)}
                    className="rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-md hover:bg-blue-700 transition">
                    Step 3 프롬프트 확인하러 가기 →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className={`rounded-2xl border p-6 ${isDark ? "border-blue-500/20 bg-blue-500/5" : "border-blue-100 bg-blue-50"}`}>
                  <h3 className={`text-base font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>개발 툴에 그대로 복사 붙여넣기 하세요</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-blue-600/70"}`}>Cursor, v0, ChatGPT 등에 입력하면 기획대로 코드를 바로 짜줍니다.</p>
                </div>
                
                <div className="space-y-3">
                  {Array.isArray(planData.prompts) && planData.prompts.map((prompt, i) => {
                    const textContent = renderContent(prompt);
                    return (
                      <div key={i} className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                        <p className={`text-sm leading-6 ${isDark ? "text-slate-200" : "text-slate-700"}`}>{textContent}</p>
                        <button type="button" onClick={() => handleCopy(textContent, i)}
                          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${copied === i ? "border-green-500 bg-green-500/10 text-green-500" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                          {copied === i ? "복사완료" : "복사"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 flex justify-between">
                  <button type="button" onClick={() => setCurrentStep(2)} className={`text-sm font-semibold underline ${isDark ? "text-white/50" : "text-slate-500"}`}>← 기획 카드로 복귀</button>
                  <button type="button" onClick={() => setCurrentStep(4)} className="rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-bold shadow-md hover:bg-blue-700 transition">
                    Step 4 AI 디버깅 도구 가기 →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"} animate-fadeIn`}>
                <div className={`flex border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <button type="button" onClick={() => setActiveTab("error")}
                    className={`flex-1 rounded-tl-2xl px-6 py-4 text-sm font-bold transition ${activeTab === "error" ? isDark ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900" : "text-slate-400"}`}>
                    🛟 에러 해석기
                  </button>
                  <button type="button" onClick={() => setActiveTab("prompt")}
                    className={`flex-1 rounded-tr-2xl px-6 py-4 text-sm font-bold transition ${activeTab === "prompt" ? isDark ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900" : "text-slate-400"}`}>
                    ✨ 프롬프트 코치
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "error" ? (
                    <>
                      <p className="mb-1 text-sm font-bold">코딩 중 에러가 발생했나요?</p>
                      <p className={`mb-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>콘솔에 찍힌 복잡한 에러 코드를 붙여넣으시면 초보자용 해결 방법을 매핑해 드립니다.</p>
                      <textarea value={errorText} onChange={(e) => setErrorText(e.target.value)} placeholder="예) Cannot read properties of undefined (reading 'map')" rows={3}
                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`} />
                      <button type="button" onClick={handleErrorSubmit} disabled={errorLoading || !errorText.trim()}
                        className="mt-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold">
                        {errorLoading ? "해석 중..." : "에러 원인 분석 →"}
                      </button>

                      {errorData && (
                        <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                          <div className="mb-3">
                            <p className="text-xs font-bold text-red-500">원인</p>
                            <p className="text-sm mt-1">{errorData.cause}</p>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-bold text-green-500">해결 가이드</p>
                            <p className="text-sm mt-1">{errorData.solution}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-500">AI 입력용 프롬프트</p>
                            <div className="flex items-center justify-between gap-2 mt-1 p-2 border rounded-lg bg-white dark:bg-zinc-800">
                              <p className="text-xs">{errorData.prompt}</p>
                              <button type="button" onClick={() => handleErrorCopy(errorData.prompt)} className="text-xs text-blue-500 shrink-0 font-bold">{errorCopied ? "복사됨" : "복사"}</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-1 text-sm font-bold">내 프롬프트 튜닝하기</p>
                      <p className={`mb-4 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>생각나는 간단한 프롬프트를 입력하시면 AI 전문 프롬프트로 밸류업해 드립니다.</p>
                      <textarea value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="예) 맛집 추천 사이트 디자인 코드 짜줘" rows={3}
                        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`} />
                      <button type="button" onClick={handlePromptSubmit} disabled={promptLoading || !promptInput.trim()}
                        className="mt-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-sm font-semibold">
                        {promptLoading ? "강화 중..." : "프롬프트 빌드 업 →"}
                      </button>

                      {promptData && (
                        <div className="mt-4 space-y-3 rounded-xl border p-4 bg-slate-50 dark:bg-zinc-900">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="p-3 border rounded-lg bg-white dark:bg-zinc-800">
                              <p className="text-xs font-bold text-slate-400">원본</p>
                              <p className="text-xs mt-1">{promptData.original}</p>
                            </div>
                            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                              <p className="text-xs font-bold text-blue-500">강화본</p>
                              <p className="text-xs mt-1">{promptData.improved}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => handlePromptCopy(promptData.improved)} className="w-full text-center py-2 text-xs border rounded-lg font-semibold bg-white dark:bg-zinc-800">
                            {promptCopied ? "✓ 최적화 프롬프트 복사 완료" : "최적화 프롬프트 복사하기"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-12 text-center border-t pt-6 border-slate-100 dark:border-white/5">
              <button type="button" onClick={handleReset}
                className={`text-xs underline underline-offset-4 transition ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
                다른 새 아이디어 빌드하기 (초기화)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📥 실무형 기획 사양서용 고품격 PDF 전용 히든 돔 영역 (Step 2 완성본 전용) */}
      {planData && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={reportRef} style={{ 
            width: "800px", 
            padding: "55px 50px", 
            backgroundColor: "#ffffff", 
            color: "#1e293b", 
            fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" 
          }}>
            {/* 공공기관/대기업 제출용 최고급 격식 마스터 헤더 */}
            <div style={{ borderBottom: "3px solid #1e3a8a", paddingBottom: "20px", marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "bold", color: "#2563eb", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  Product Requirement Document (PRD)
                </span>
                <span style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#f1f5f9", borderRadius: "4px", fontWeight: "600", color: "#475569" }}>
                  문서등급: 대외비 (Confidential)
                </span>
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginTop: "10px", marginBottom: "15px", letterSpacing: "-1.5px" }}>
                신규 서비스 구축을 위한 비즈니스 기획 사양서
              </h1>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <div><strong>기획 발의자:</strong> VIBE 비즈니스 파트너 AI</div>
                <div><strong>보고일자:</strong> {new Date().toLocaleDateString('ko-KR')}</div>
                <div><strong>검토버전:</strong> v1.0.0 (최종 승인본)</div>
              </div>
            </div>

            {/* 1. 프로젝트 배경 및 요구사항 개요 */}
            <div style={{ marginBottom: "45px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e3a8a", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <span style={{ width: "4px", height: "18px", backgroundColor: "#1e3a8a", display: "inline-block", marginRight: "10px" }}></span>
                1. 프로젝트 배경 및 초기 요구사항 개요
              </h2>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px", lineHeight: "1.65", color: "#334155", fontSize: "13.5px" }}>
                <span style={{ display: "block", fontSize: "11.5px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" }}>[최초 비즈니스 가설 및 발의 내용]</span>
                "{idea}"
              </div>
            </div>

            {/* 2. 시장 문제 정의 및 목표 타겟 분석 */}
            <div style={{ marginBottom: "45px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e3a8a", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <span style={{ width: "4px", height: "18px", backgroundColor: "#1e3a8a", display: "inline-block", marginRight: "10px" }}></span>
                2. 핵심 가치 제안 및 타겟 시장 분석
              </h2>
              <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px", borderLeft: "5px solid #2563eb", backgroundColor: "#fbfcfe" }}>
                  <strong style={{ fontSize: "14px", color: "#0f172a", display: "block", marginBottom: "6px" }}>🔍 해결하고자 하는 핵심 페인포인트 (Problem Definition)</strong>
                  <p style={{ fontSize: "13.5px", lineHeight: "1.65", color: "#475569", margin: 0 }}>{renderContent(planData.problem)}</p>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px", borderLeft: "5px solid #7c3aed", backgroundColor: "#fafbfe" }}>
                  <strong style={{ fontSize: "14px", color: "#0f172a", display: "block", marginBottom: "6px" }}>🎯 주 타겟 고객층 및 가치 전달 대상 (Target Audience)</strong>
                  <p style={{ fontSize: "13.5px", lineHeight: "1.65", color: "#475569", margin: 0 }}>{renderContent(planData.target)}</p>
                </div>
              </div>
            </div>

            {/* 3. 상세 기능 요건 명세 (Functional Requirements) */}
            <div style={{ marginBottom: "45px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e3a8a", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <span style={{ width: "4px", height: "18px", backgroundColor: "#1e3a8a", display: "inline-block", marginRight: "10px" }}></span>
                3. 서비스 시스템 기능 요구 명세서 (Functional Requirements)
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderTop: "2px solid #cbd5e1", borderBottom: "1px solid #cbd5e1" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", width: "90px", color: "#334155", fontWeight: "700" }}>요구 사양 ID</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", color: "#334155", fontWeight: "700" }}>기능 요건 세부 정의 (System Requirement Specification)</th>
                    <th style={{ padding: "12px 14px", textAlign: "center", width: "70px", color: "#334155", fontWeight: "700" }}>중요도</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.features?.map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "14px", color: "#2563eb", fontWeight: "bold" }}>SYS-REQ-{String(i+1).padStart(2, '0')}</td>
                      <td style={{ padding: "14px", color: "#334155", lineHeight: "1.6" }}>{renderContent(f)}</td>
                      <td style={{ padding: "14px", textAlign: "center", color: "#f59e0b", fontWeight: "bold" }}>전략 필수</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. 서비스 정보 구조 및 화면 구성 기획 (UI Architecture) */}
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1e3a8a", marginBottom: "16px", display: "flex", alignItems: "center" }}>
                <span style={{ width: "4px", height: "18px", backgroundColor: "#1e3a8a", display: "inline-block", marginRight: "10px" }}></span>
                4. 인터페이스 설계 및 화면 구성 기획 (UI Architecture)
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderTop: "2px solid #cbd5e1", borderBottom: "1px solid #cbd5e1" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", width: "90px", color: "#334155", fontWeight: "700" }}>인터페이스 ID</th>
                    <th style={{ padding: "12px 14px", textAlign: "left", color: "#334155", fontWeight: "700" }}>화면 구성 요건 및 사용자 인터랙션 시나리오</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.screens?.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "14px", color: "#475569", fontWeight: "bold" }}>UI-SCR-{String(i+1).padStart(2, '0')}</td>
                      <td style={{ padding: "14px", color: "#334155", lineHeight: "1.6" }}>{renderContent(s)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 문서 하단 승인 란 */}
            <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                <div>기획 파트: (인)</div>
                <div>개발 파트: (인)</div>
                <div>총괄 부서: (승인)</div>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer className={`relative z-10 border-t px-6 py-8 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">VIBE PROJECT</span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>누구나 자신의 아이디어를 현실로 구현하도록</span>
        </div>
      </footer>
    </main>
  );
}
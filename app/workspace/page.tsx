"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Theme = "light" | "dark";
type MentorTone = "kind" | "tsundere";

interface FeatureItem {
  id: string;
  name: string;
  desc: string;
  criteria: string[];
}

interface ScreenItem {
  id: string;
  name: string;
  desc: string;
}

interface PlanData {
  summary: string;
  problem: string;
  target: string;
  userStories: string[];
  features: FeatureItem[];
  screens: ScreenItem[];
  prompts: {
    ui: string[];
    ide: string[];
    db: string;
  };
}

const platformOptions = ["Web 웹사이트", "iOS 앱", "Android 앱", "Cross-Platform", "Chrome 익스텐션"];
const bmOptions = ["구독형 SaaS", "플랫폼 및 중개 수수료", "인앱 결제 및 광고", "수수료 + 프리미엄 모델"];

const examples = [
  "학교 근처 맛집을 학생들끼리 공유하고 실시간 빈자리 확인하는 앱",
  "동아리 신입 부원 모집부터 면접 일정, 합격 공지까지 통합 관리하는 웹",
  "전공 서적 및 중고 교재를 같은 대학 학생들끼리 인증 후 직거래하는 서비스",
  "우리 학과 전공 수업의 로드맵과 진짜 솔직한 강의평을 익명으로 모아보는 커뮤니티",
];

// 🚀 킬러 요소 3: 실시간 영감 보드 가짜 데이터
const reviewFeeds = [
  { major: "경영학과 김*현", text: "에러 해결사 비서 덕분에 코딩 1도 모르는데 밤새우고 과제 앱 제출 성공했습니다ㅠㅠ" },
  { major: "시각디자인과 이*은", text: "v0 치트키 복붙하니까 사이트 화면이 3분 만에 눈앞에 뽑히네요. 진짜 신세계..." },
  { major: "컴공 복전생 박*우", text: "무료 배포 가이드 보고 Vercel에 링크 올렸어요! 친구들한테 주소 공유하니까 소름 돋는대요." },
];

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

export default function Workspace() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mentorTone, setMentorTone] = useState<MentorTone>("kind");
  const [idea, setIdea] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("Web 웹사이트");
  const [selectedBM, setSelectedBM] = useState("구독형 SaaS");
  
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // 🚀 킬러 요소 1: 가동 완료 후 체크박스 상태값들
  const [progressDesign, setProgressDesign] = useState(false);
  const [progressCode, setProgressCode] = useState(false);
  const [progressDeploy, setProgressDeploy] = useState(false);

  const [step2Tab, setStep2Tab] = useState<"impact" | "features" | "stories" | "screens" | "tips">("impact");
  const [step3Tab, setStep3Tab] = useState<"ui" | "ide" | "db">("ui");
  const [step4Tool, setStep4Tool] = useState<"error" | "refiner" | "mock" | "commit">("error");

  const [errorInput, setErrorInput] = useState("");
  const [errorResult, setErrorResult] = useState<{ cause: string; solution: string; prompt: string } | null>(null);
  const [errorLoading, setErrorLoading] = useState(false);

  const [refinerInput, setRefinerInput] = useState("");
  const [refinerResult, setRefinerResult] = useState<{ original: string; improved: string } | null>(null);
  const [refinerLoading, setRefinerLoading] = useState(false);

  const [mockInput, setMockInput] = useState("");
  const [mockResult, setMockResult] = useState<string>("");
  const [mockLoading, setMockLoading] = useState(false);

  const [commitInput, setCommitInput] = useState("");
  const [commitResult, setCommitResult] = useState<string>("");
  const [commitLoading, setCommitLoading] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme as Theme);

    const savedIdea = localStorage.getItem("vibe-idea");
    const savedPlan = localStorage.getItem("vibe-plan");
    if (savedIdea && savedPlan) {
      setIdea(savedIdea);
      setPlanData(JSON.parse(savedPlan));
      setCurrentStep(2);
    }
  }, []);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const handleMainSubmit = async () => {
    if (!idea.trim() || idea.trim().length < 10) return;
    setLoading(true);
    setPlanData(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, type: "plan", platform: selectedPlatform, bm: selectedBM, tone: mentorTone }),
      });
      const json = await res.json();
      if (json.success || json.data) {
        const targetData = json.data || json;
        setPlanData(targetData);
        localStorage.setItem("vibe-idea", idea);
        localStorage.setItem("vibe-plan", JSON.stringify(targetData));
        setCurrentStep(2);
      }
    } catch (e) {
      console.error(e);
      alert("기획서 빌드 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubToolSubmit = async (toolType: "error" | "prompt" | "mock" | "commit", payload: string) => {
    if (!payload.trim()) return;
    if (toolType === "error") { setErrorLoading(true); setErrorResult(null); }
    if (toolType === "prompt") { setRefinerLoading(true); setRefinerResult(null); }
    if (toolType === "mock") { setMockLoading(true); setMockResult(""); }
    if (toolType === "commit") { setCommitLoading(true); setCommitResult(""); }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: payload, type: toolType, tone: mentorTone }),
      });
      const json = await res.json();
      if (json.success) {
        if (toolType === "error") setErrorResult(json.data);
        if (toolType === "prompt") setRefinerResult(json.data);
        if (toolType === "mock") setMockResult(json.data.jsonCode || JSON.stringify(json.data, null, 2));
        if (toolType === "commit") setCommitResult(json.data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setErrorLoading(false); setRefinerLoading(false); setMockLoading(false); setCommitLoading(false);
    }
  };

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleReset = () => {
    if(!confirm("작성 중인 데이터가 초기화됩니다. 계속할까요?")) return;
    setIdea(""); setPlanData(null);
    setErrorInput(""); setErrorResult(null);
    setRefinerInput(""); setRefinerResult(null);
    setMockInput(""); setMockResult("");
    setCommitInput(""); setCommitResult("");
    setCurrentStep(1);
    setProgressDesign(false); setProgressCode(false); setProgressDeploy(false);
    localStorage.removeItem("vibe-idea"); localStorage.removeItem("vibe-plan");
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setPdfDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
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
      doc.save(`VIBE_하루만에_실현하는_기획서.pdf`);
    } catch (error) {
      console.error(error);
      alert("PDF 생성 중 오류가 발생했습니다.");
    } finally {
      setPdfDownloading(false);
    }
  };

  // 진척도 퍼센트 계산
  const totalChecked = [planData ? true : false, progressDesign, progressCode, progressDeploy].filter(Boolean).length;
  const progressPercent = Math.round((totalChecked / 4) * 100);

  return (
    <main className={`relative min-h-screen antialiased transition-colors duration-300 ${isDark ? "bg-[#0a0a16] text-white" : "bg-slate-50/50 text-slate-900"}`}>
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-20 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
      )}

      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${isDark ? "border-white/5 bg-[#0a0a16]/80" : "border-slate-200 bg-white/90"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-black tracking-tighter bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            🚀 VIBE 1일 완성 바이브코딩 메이커
          </Link>
          <div className="flex items-center gap-4">
            <div className={`flex rounded-xl border p-0.5 text-xs font-bold ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" onClick={() => setMentorTone("kind")} className={`px-2 py-1 rounded-lg ${mentorTone === "kind" ? "bg-blue-500 text-white" : "text-slate-400"}`}>😇 천사 멘토</button>
              <button type="button" onClick={() => setMentorTone("tsundere")} className={`px-2 py-1 rounded-lg ${mentorTone === "tsundere" ? "bg-amber-600 text-white" : "text-slate-400"}`}>🦊 츤데레 선배</button>
            </div>

            <div className={`flex rounded-full border p-0.5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} className={`p-1.5 rounded-full ${!isDark ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}><SunIcon /></button>
              <button type="button" onClick={() => handleThemeChange("dark")} className={`p-1.5 rounded-full ${isDark ? "bg-white/10 shadow-sm text-violet-400" : "text-slate-400"}`}><MoonIcon /></button>
            </div>
            <button type="button" onClick={handleReset} className="text-xs font-bold border rounded-lg px-3 py-1.5 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20">새로 만들기</button>
          </div>
        </div>
      </nav>

      {/* 🚀 킬러 요소 1: 실시간 퀘스트 진척도 대시보드 바 */}
      {planData && (
        <div className={`border-b text-xs py-2.5 px-6 transition-colors ${isDark ? "bg-blue-950/20 border-white/5" : "bg-blue-50/50 border-slate-200"}`}>
          <div className="mx-auto max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold">
              <span>🎯 나의 앱 빌드 완성도:</span>
              <div className="w-24 bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-blue-500 font-black">{progressPercent}%</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center font-medium text-slate-500 dark:text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 dark:hover:text-white">
                <input type="checkbox" checked={true} readOnly className="rounded border-slate-300 accent-blue-500" /> ✨ 설계도 완성
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 dark:hover:text-white">
                <input type="checkbox" checked={progressDesign} onChange={(e) => setProgressDesign(e.target.checked)} className="rounded border-slate-300 accent-blue-500" /> 🎨 v0 디자인 복붙완료
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 dark:hover:text-white">
                <input type="checkbox" checked={progressCode} onChange={(e) => setProgressCode(e.target.checked)} className="rounded border-slate-300 accent-blue-500" /> 💻 Cursor 기능연결
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 dark:hover:text-white">
                <input type="checkbox" checked={progressDeploy} onChange={(e) => setProgressDeploy(e.target.checked)} className="rounded border-slate-300 accent-blue-500" /> 🚀 인터넷 전세계 무료배포
              </label>
            </div>
          </div>
        </div>
      )}

      <div className={`border-b sticky top-[69px] z-40 transition-colors ${isDark ? "border-white/5 bg-[#0f0f23]" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5 overflow-x-auto">
          {[
            { step: 1, label: "💡 1. 아이디어 다듬기" },
            { step: 2, label: "📋 2. 초쉬운 기획 요건 확인" },
            { step: 3, label: "✨ 3. AI 전용 복사-붙여넣기 치트키" },
            { step: 4, label: "🛠️ 4. 뚝딱뚝딱 개발 헬퍼 룸" },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isAccessible = item.step === 1 || planData !== null;
            return (
              <button
                key={item.step}
                disabled={!isAccessible}
                onClick={() => setCurrentStep(item.step)}
                className={`flex items-center gap-2 font-bold text-xs md:text-sm whitespace-nowrap transition border-b-2 py-1.5 focus:outline-none ${
                  isActive ? "border-blue-500 text-blue-500 font-extrabold" : isAccessible ? "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white" : "border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 relative z-10">
        
        {loading && (
          <div className="my-20 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <h3 className="text-lg font-bold">인공지능 튜터가 당신의 아이디어를 1초 만에 조립하고 있어요! 🛠️</h3>
            <p className="text-sm text-slate-400">{mentorTone === "kind" ? "비전공자도 하루 만에 구현할 수 있는 가장 쉬운 방식의 뼈대를 짜는 중입니다." : "형편없는 주석 달기 전에 알아서 굴러가게 아키텍처 뽑고 있으니까 잠깐만 기다려 봐."}</p>
          </div>
        )}

        {/* STEP 1 */}
        {!loading && currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-black md:text-3xl tracking-tight">머릿속 아이디어를 하루 만에 현실로 만들어보세요!</h1>
              <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">코딩을 몰라도 괜찮습니다. 만들고 싶은 서비스의 형태와 종류를 고르고 툭 던져만 주세요.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">어디서 작동하는 서비스인가요?</label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((p) => (
                    <button key={p} type="button" onClick={() => setSelectedPlatform(p)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${selectedPlatform === p ? "bg-blue-600 border-blue-600 text-white" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">수익은 어떻게 내고 싶으신가요?</label>
                <div className="flex flex-wrap gap-2">
                  {bmOptions.map((b) => (
                    <button key={b} type="button" onClick={() => setSelectedBM(b)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${selectedBM === b ? "bg-violet-600 border-violet-600 text-white" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">나의 기획 아이디어 자유롭게 적기</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="예) 우리 학교 학생들끼리 안 쓰는 물건을 서로 빌려주고 소정의 대여료를 받는 따뜻한 당근마켓 같은 앱"
                rows={5}
                className="w-full rounded-2xl border p-4 text-base leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>자세하게 적을수록 AI가 더 쉽고 친절하게 기획서를 완성해 줍니다.</span>
                <button type="button" onClick={handleMainSubmit} disabled={idea.trim().length < 10}
                  className="px-6 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-slate-300">
                  하루 만에 완성하는 설계도 뽑기 →
                </button>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-xs font-bold text-slate-400 block mb-3 text-center">할 말이 떠오르지 않는다면? 아래 예시를 클릭해 보세요!</span>
              <div className="grid gap-3 md:grid-cols-2">
                {examples.map((ex) => (
                  <button key={ex} type="button" onClick={() => setIdea(ex)}
                    className="p-4 rounded-xl border text-left text-xs leading-relaxed transition bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500">
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* 🚀 킬러 요소 3: 실시간 영감 피드 한줄 자랑방 */}
            <div className="pt-6 border-t dark:border-white/5">
              <span className="text-xs font-black text-slate-400 block mb-3">🔥 오늘 VIBE를 거쳐 간 선배 메이커들의 생생한 한줄 발자취</span>
              <div className="grid gap-3 md:grid-cols-3">
                {reviewFeeds.map((feed, i) => (
                  <div key={i} className="p-3.5 border rounded-xl bg-slate-50 dark:bg-white/[0.02] dark:border-white/5 text-xs">
                    <span className="font-bold text-blue-500 block mb-1">{feed.major}</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">"{feed.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {!loading && planData && currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight">📋 2. 초쉬운 기획 요건 확인방</h1>
                <p className="text-xs text-slate-400 mt-0.5">선택한 설정: <span className="text-blue-500 font-bold">{selectedPlatform}</span> | <span className="text-violet-500 font-bold">{selectedBM}</span></p>
              </div>
              <button type="button" onClick={handleDownloadPDF} disabled={pdfDownloading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm">
                {pdfDownloading ? "설계도 다운로드 중..." : "📄 내 기획안 한눈에 보기 (PDF 저장)"}
              </button>
            </div>

            {/* 비전공자 안심용 3줄 웰컴 보드 시스템 - 다크모드 가독성 패치 반영 완료 */}
            {planData.summary && (
              <div className={`p-4 rounded-2xl border ${mentorTone === "kind" ? "bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-500/20 bg-white dark:bg-[#12122c]" : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 bg-white dark:bg-[#1a1424]"}`}>
                <span className={`text-xs font-black block mb-1.5 ${mentorTone === "kind" ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {mentorTone === "kind" ? "😇 인공지능 튜터의 초속성 마인드셋 레슨:" : "🦊 한마디만 하겠는데 귀담아들어라:"}
                </span>
                <p className="text-xs leading-relaxed font-bold text-slate-800 dark:text-slate-100">
                  {mentorTone === "kind" 
                    ? planData.summary 
                    : "어려운 용어 안 썼으니까 쫄지 말고 딱 지시한 대로만 v0랑 Cursor에 순서대로 복붙해. 복붙만 제때 해도 오늘 밤안에 배포까지 무조건 끝나니까 딴짓하지 말고 집중해라."}
                </p>
              </div>
            )}

            <div className="flex border-b border-slate-200 dark:border-white/10 gap-2 overflow-x-auto">
              {[
                { id: "impact", label: "🎯 목표와 사용자" },
                { id: "features", label: "⚙️ 핵심 기능 목록" },
                { id: "stories", label: "👤 사용 시나리오" },
                { id: "screens", label: "📱 필요한 화면" },
                { id: "tips", label: "💰 초고속 무료 서버 배포 팁" },
              ].map((tab) => (
                <button key={tab.id} type="button" onClick={() => setStep2Tab(tab.id as any)}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition focus:outline-none whitespace-nowrap ${step2Tab === tab.id ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 min-h-[250px]">
              {step2Tab === "impact" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-black text-blue-500 mb-2">🔍 유저들이 겪고 있는 진짜 문제점은 무엇인가요?</h3>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-4 rounded-xl">{planData.problem}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-violet-500 mb-2">👥 이 서비스를 가장 먼저 반길 최우선 타겟은 누구인가요?</h3>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-4 rounded-xl">{planData.target}</p>
                  </div>
                </div>
              )}

              {step2Tab === "features" && (
                <div className="space-y-4">
                  {planData.features?.map((f, i) => (
                    <div key={i} className="p-4 border rounded-xl border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">기능 {i+1}</span>
                        <h4 className="text-xs font-black">{f.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{f.desc}</p>
                      <div className="bg-white dark:bg-black/20 p-3 rounded-lg border dark:border-white/5">
                        <span className="text-[10px] font-bold text-blue-500 block mb-1.5">🚨 AI 코딩 메이킹이 끝난 후 눈으로 직접 확인할 체크리스트</span>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                          {f.criteria?.map((c, ci) => <li key={ci}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step2Tab === "stories" && (
                <div className="space-y-2">
                  {planData.userStories?.map((story, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="h-5 w-5 shrink-0 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">{idx+1}</span>
                      <p className="mt-0.5">{story}</p>
                    </div>
                  ))}
                </div>
              )}

              {step2Tab === "screens" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {planData.screens?.map((scr, i) => (
                    <div key={i} className="p-4 border rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-900">
                      <h4 className="text-xs font-black mb-1.5">{scr.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{scr.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {step2Tab === "tips" && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-black text-amber-500">💰 지갑 보호! 비전공자 대학생을 위한 0원 배포 가이드</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-white/5">
                      <h4 className="font-bold text-blue-500 mb-1">💻 화면 배포: Vercel (완전 무료)</h4>
                      <p className="text-slate-500 leading-relaxed">깃허브 저장소와 단 3번의 클릭으로 연결됩니다. 결제 카드 등록 없이도 전 세계 누구나 접속할 수 있는 공짜 주소(.vercel.app)를 즉시 발급해 줍니다.</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-white/5">
                      <h4 className="font-bold text-emerald-500 mb-1">🗄️ 데이터 저장고: Supabase (프리 티어)</h4>
                      <p className="text-slate-500 leading-relaxed">엑셀처럼 쓸 수 있는 웹 데이터베이스 상자입니다. 동시 접속자 수백 명이 들어와도 끄떡없는 용량을 평생 비용 없이 무료 범위 안에서 제공합니다.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-[11px] text-slate-500 text-center">
                    📢 <strong>꿀팁:</strong> Cursor AI 에디터에게 <strong>\"이 프로젝트를 Vercel에 무료로 올리는 구조로 세팅해줘\"</strong> 라고 치면 세팅까지 알아서 다 해줍니다.
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-bold underline text-slate-400">← 다시 작성하기</button>
              <button type="button" onClick={() => setCurrentStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                Step 03 AI 복사 치트키 얻으러 가기 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {!loading && planData && currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-black tracking-tight">✨ 3. AI 전용 복사-붙여넣기 치트키</h1>
              <p className="text-xs text-slate-400 mt-1">원하는 AI 제작 도구를 선택하고 버튼을 누르세요. 복사한 텍스트를 해당 AI에게 던지면 서비스가 하루 만에 구축됩니다.</p>
            </div>

            <div className="flex border-b border-slate-200 dark:border-white/10 gap-2 overflow-x-auto">
              <button type="button" onClick={() => setStep3Tab("ui")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ui" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400"}`}>🎨 1단계: 테마 디자인 (v0.dev 용)</button>
              <button type="button" onClick={() => setStep3Tab("ide")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ide" ? "border-violet-500 text-violet-500" : "border-transparent text-slate-400"}`}>💻 2단계: 기능 연결 (Cursor 에디터 용)</button>
              <button type="button" onClick={() => setStep3Tab("db")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "db" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-400"}`}>🗄️ 3단계: 정보 창고 (Supabase 용)</button>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 min-h-[200px]">
              {step3Tab === "ui" && (
                <div className="space-y-3">
                  <div className="text-[11px] text-blue-500 font-bold mb-2">💡 사용법: 아래 박스의 프롬프트를 복사한 뒤 v0.dev 혹은 Bolt.new 사이트의 입력창에 그대로 붙여넣으세요!</div>
                  {planData.prompts?.ui?.map((p, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-black/20">
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">{p}</p>
                      <button type="button" onClick={() => triggerCopy(p)} className="shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded bg-white dark:bg-neutral-800 text-blue-500">
                        {copiedText === p ? "복사 완료! 👍" : "치트키 복사하기"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {step3Tab === "ide" && (
                <div className="space-y-3">
                  <div className="text-[11px] text-violet-500 font-bold mb-2">💡 사용법: 아래 명령어를 복사하여 Cursor 프로그램 우측의 AI 채팅창(Ctrl+L)에 넣으세요!</div>
                  {planData.prompts?.ide?.map((p, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-black/20">
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">{p}</p>
                      <button type="button" onClick={() => triggerCopy(p)} className="shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded bg-white dark:bg-neutral-800 text-violet-500">
                        {copiedText === p ? "복사 완료! 👍" : "명령어 복사하기"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {step3Tab === "db" && (
                <div className="space-y-3">
                  <div className="text-[11px] text-emerald-500 font-bold mb-2">💡 사용법: 데이터 보관함 스크립트입니다.</div>
                  <div className="flex justify-between items-start gap-4 p-4 border rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap flex-1">{planData.prompts?.db || "정보를 준비하고 있습니다."}</pre>
                    <button type="button" onClick={() => triggerCopy(planData.prompts?.db)} className="shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded bg-slate-800 text-white">
                      {copiedText === planData.prompts?.db ? "복사 완료!" : "코드 전체 복사"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 🚀 킬러 요소 2: 초보자 안심 유의사항 가이드 박스 */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-amber-600 block mb-1">⚠️ 복붙 전 꼭 읽어두면 주머니와 멘탈에 좋은 가이드</span>
              AI 도구 화면에 빨간 불이 아니라 <strong className="text-amber-600">노란색 느낌표 경고(Warning)</strong>가 뜨는 건 컴퓨터가 혼자 잔소리하는 거라 가볍게 무시하셔도 완벽하게 작동합니다! 또한 무료 범위 내에서 카드를 등록하라는 알림이 오더라도 당황하지 마시고 창을 닫은 후 무료 등급으로 계속 사용하시면 지갑 방어가 완료됩니다.
            </div>

            <div className="flex justify-between items-center pt-4">
              <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-bold underline text-slate-400">← 기획서 다시보기</button>
              <button type="button" onClick={() => setCurrentStep(4)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                Step 04 나만의 비밀 개발 에이드 비서방 이동 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {!loading && planData && currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b pb-4">
              <h1 className="text-2xl font-black tracking-tight">🛠️ 4. 뚝딱뚝딱 개발 헬퍼 룸</h1>
              <p className="text-xs text-slate-400 mt-1">
                바이브코딩 도중 에러가 나거나 막힐 때 도움을 요청하세요. (현재 모드: <span className="text-amber-500 font-bold">{mentorTone === "kind" ? "👼 천사 코치" : "🦊 츤데레 선배"}</span>)
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b dark:border-white/5 pb-2">
              {[
                { id: "error", title: "🚨 빨간 에러글 해결사" },
                { id: "refiner", title: "✍️ 프롬프트 깎기" },
                { id: "mock", title: "📦 가짜 데이터 상자" },
                { id: "commit", title: "🌿 깃허브 제출 일기" },
              ].map((tool) => (
                <button key={tool.id} type="button" onClick={() => setStep4Tool(tool.id as any)}
                  className={`p-3 text-xs font-bold rounded-xl text-center border transition ${step4Tool === tool.id ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900" : "bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"}`}>
                  {tool.title}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              
              {step4Tool === "error" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black mb-1 text-red-500">화면에 뜬 무서운 영어 에러 문장을 그대로 복사해서 넣어주세요</h3>
                    <textarea value={errorInput} onChange={(e) => setErrorInput(e.target.value)} placeholder="예) TypeError: Cannot read properties of undefined..." rows={3}
                      className="w-full text-xs font-mono p-3 rounded-xl border bg-slate-50 dark:bg-neutral-900 outline-none" />
                    <button type="button" onClick={() => handleSubToolSubmit("error", errorInput)} disabled={errorLoading || !errorInput.trim()}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white disabled:bg-slate-300">
                      {errorLoading ? "무슨 일인지 분석 중..." : "마법 해결사 호출"}
                    </button>
                  </div>
                  {errorResult && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/40 text-xs space-y-3 border dark:border-white/5">
                      <div>
                        <strong className="text-red-500 font-bold block">
                          {mentorTone === "kind" ? "💡 컴퓨터가 화난 진짜 이유:" : "🦊 선배의 팩트 폭행:"}
                        </strong>
                        <p className="mt-1 leading-relaxed">
                          {mentorTone === "kind" 
                            ? errorResult.cause 
                            : `어디서 이상한 데서 코드 끊어먹고 가져왔냐? 비어 있는 정보 바구니에서 혼자 멋대로 아이템 꺼내 쓰려고 하니까 크래시가 난 거잖아.`}
                        </p>
                      </div>
                      <div>
                        <strong className="text-emerald-500 font-bold block">🛠️ 이렇게 고쳐보세요:</strong>
                        <p className="mt-1 leading-relaxed">
                          {mentorTone === "kind" 
                            ? errorResult.solution 
                            : `거기 코드 창 열고 데이터 검사하는 if문 한 줄만 추가해. 모르면 아래 치트키 복사해서 Cursor에 그대로 먹여.`}
                        </p>
                      </div>
                      <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">AI에게 줄 치트키: <strong>{errorResult.prompt}</strong></span>
                        <button type="button" onClick={() => triggerCopy(errorResult.prompt)} className="text-blue-500 font-bold shrink-0">{copiedText === errorResult.prompt ? "복사됨!" : "명령어 복사"}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step4Tool === "refiner" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black mb-1">내가 적은 러프한 질문을 AI가 가장 좋아하는 똑똑한 질문으로 리모델링합니다</h3>
                    <textarea value={refinerInput} onChange={(e) => setRefinerInput(e.target.value)} placeholder="예) 로그인 화면 하나 이쁘게 리액트로 짜줘" rows={3}
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 dark:bg-neutral-900 outline-none" />
                    <button type="button" onClick={() => handleSubToolSubmit("prompt", refinerInput)} disabled={refinerLoading || !refinerInput.trim()}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white disabled:bg-slate-300">
                      {refinerLoading ? "멋지게 수정하는 중..." : "말 바꾸기 치트키 가공"}
                    </button>
                  </div>
                  {refinerResult && (
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 border rounded-xl bg-slate-50 dark:bg-white/5"><span className="text-slate-400 block mb-1">내가 쓴 글</span>{refinerResult.original}</div>
                      <div className="p-3 border border-violet-500/30 rounded-xl bg-violet-500/5 relative">
                        <span className="text-violet-500 font-bold block mb-1">AI 찰떡 저격 글</span>{refinerResult.improved}
                        <button type="button" onClick={() => triggerCopy(refinerResult.improved)} className="absolute bottom-2 right-2 text-[10px] bg-neutral-800 text-white px-2 py-1 rounded">
                          {copiedText === refinerResult.improved ? "복사 성공!" : "이걸로 복사하기"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step4Tool === "mock" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black mb-1">화면을 가득 채워줄 임시 가짜 정보 데이터 샘플 상자입니다</h3>
                    <input type="text" value={mockInput} onChange={(e) => setMockInput(e.target.value)} placeholder="예) 대학생 중고 물품 대여 리스트 5개"
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 dark:bg-neutral-900 outline-none" />
                    <button type="button" onClick={() => handleSubToolSubmit("mock", mockInput || idea)} disabled={mockLoading}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:bg-slate-300">
                      {mockLoading ? "정보 상자 만드는 중..." : "샘플 정보 상자 사출"}
                    </button>
                  </div>
                  {mockResult && (
                    <div className="p-3 border rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs relative overflow-x-auto">
                      <pre className="whitespace-pre-wrap max-h-60 overflow-y-auto">{mockResult}</pre>
                      <button type="button" onClick={() => triggerCopy(mockResult)} className="absolute top-2 right-2 text-[10px] bg-slate-800 text-white px-2 py-1 rounded">
                        {copiedText === mockResult ? "복사완료!" : "전체복사"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step4Tool === "commit" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-black mb-1">방금 무슨 작업을 완료했는지 한글로 적어주시면 멋진 깃 메시지로 바꿔드려요</h3>
                    <input type="text" value={commitInput} onChange={(e) => setCommitInput(e.target.value)} placeholder="예) 메인 페이지에 배너 이미지 넣기 성공"
                      className="w-full text-xs p-3 rounded-xl border bg-slate-50 dark:bg-neutral-900 outline-none" />
                    <button type="button" onClick={() => handleSubToolSubmit("commit", commitInput)} disabled={commitLoading || !commitInput.trim()}
                      className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white disabled:bg-slate-300">
                      {commitLoading ? "번역 중..." : "멋진 개발용 메시지 완성"}
                    </button>
                  </div>
                  {commitResult && (
                    <div className="p-3 border rounded-xl bg-slate-50 dark:bg-white/5 flex justify-between items-center text-xs font-mono">
                      <span className="text-blue-500 font-bold">{commitResult}</span>
                      <button type="button" onClick={() => triggerCopy(commitResult)} className="text-slate-500 font-bold text-[11px]">
                        {copiedText === commitResult ? "복사 성공!" : "복사"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="text-center pt-8 border-t dark:border-white/5">
              <button type="button" onClick={handleReset} className="text-xs text-slate-400 underline hover:text-red-500">
                현재 기획 비우고 새로운 서비스 구상하러 가기
              </button>
            </div>
          </div>
        )}

      </div>

      {/* PDF 전용 Hidden 돔 */}
      {planData && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={reportRef} style={{ width: "800px", padding: "50px", backgroundColor: "#ffffff", color: "#1e293b", fontFamily: "sans-serif" }}>
            <div style={{ borderBottom: "3px solid #2563eb", paddingBottom: "15px", marginBottom: "35px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#2563eb" }}>
                <span>VIBE 1-DAY APP BUILDER SPECIFICATION</span>
                <span>하루 완성 비밀 설계도</span>
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", marginTop: "10px", marginBottom: "10px" }}>
                비전공자 초속성 서비스 구현 사업 기획서 및 개발 스펙 가이드
              </h1>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                <div><strong>선택 구동 플랫폼:</strong> {selectedPlatform} | <strong>선택 수익 모델:</strong> {selectedBM}</div>
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px" }}>💡 멘토의 요약 레슨</h2>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "12px", lineHeight: "1.6" }}>{planData.summary}</div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px" }}>1. 해결하고자 하는 우리 주변의 불편함</h2>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "12px", lineHeight: "1.6" }}>{planData.problem}</div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px" }}>2. 이 서비스를 가장 먼저 사용할 고마운 주인공들</h2>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "12px", lineHeight: "1.6" }}>{planData.target}</div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "bold", color: "#2563eb", marginBottom: "10px" }}>3. 우리가 무조건 만들어야 할 기능과 눈으로 검사할 체크리스트</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                    <th style={{ padding: "8px", textAlign: "left", width: "180px" }}>핵심 기능 목록</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>개발 완료 후 눈으로 직접 확인할 체크리스트</th>
                  </tr>
                </thead>
                <tbody>
                  {planData.features?.map((f, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>{f.name}<br/><span style={{ fontSize: "10px", fontWeight: "normal", color: "#64748b" }}>{f.desc}</span></td>
                      <td style={{ padding: "8px" }}>
                        <ul style={{ margin: 0, paddingLeft: "15px" }}>
                          {f.criteria?.map((cr, cidx) => <li key={cidx}>{cr}</li>)}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "15px", textAlign: "right", fontSize: "10px", color: "#64748b" }}>
              <span>본 문서는 비전공자의 창업을 돕는 VIBE 패키지에 의해 빌드되었습니다.</span>
            </div>
          </div>
        </div>
      )}

      <footer className={`border-t py-6 text-center text-xs mt-10 transition-colors ${isDark ? "border-white/5 text-slate-600" : "border-slate-200 text-slate-400"}`}>
        <p>© VIBE PROJECT 1-Day VibeCoding Canvas. 비전공자도 아이디어를 하루 만에 실현하는 1등 플랫폼.</p>
      </footer>
    </main>
  );
}
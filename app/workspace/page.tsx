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
  id: string;
  timestamp: string;
  idea: string;
  platform: string;
  bm: string;
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

interface AiComment {
  sectionKey: string;
  content: string;
  loading: boolean;
}

const platformOptions = ["Web 웹사이트", "iOS 앱", "Android 앱", "Cross-Platform", "Chrome 익스텐션"];
const bmOptions = ["구독형 SaaS", "플랫폼 및 중개 수수료", "인앱 결제 및 광고", "수수료 + 프리미엄 모델"];

const examples = [
  "학교 근처 맛집을 학생들끼리 공유하고 실시간 빈자리 확인하는 앱",
  "동아리 신입 부원 모집부터 면접 일정, 합격 공지까지 통합 관리하는 웹",
  "전공 서적 및 중고 교재를 같은 대학 학생들끼리 인증 후 직거래하는 서비스",
  "우리 학과 전공 수업의 로드맵과 진짜 솔직한 강의평을 익명으로 모아보는 커뮤니티",
];

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

// ── AI 코멘트 버튼 + 결과 컴포넌트 ──
function AiCommentBox({
  sectionKey, sectionLabel, content, tone, isDark, comment, onRequest, onClose,
}: {
  sectionKey: string; sectionLabel: string; content: string; tone: MentorTone;
  isDark: boolean; comment: AiComment | null;
  onRequest: (key: string, content: string, label: string) => void;
  onClose: (key: string) => void;
}) {
  const isLoading = comment?.sectionKey === sectionKey && comment.loading;
  const result = comment?.sectionKey === sectionKey && !comment.loading ? comment.content : null;

  return (
    <div className="mt-3">
      {!result && (
        <button type="button" onClick={() => onRequest(sectionKey, content, sectionLabel)} disabled={isLoading}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
            isDark ? "border-violet-500/30 text-violet-400 bg-violet-500/5 hover:bg-violet-500/10" : "border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100"
          }`}>
          {isLoading ? (
            <><div className="h-3 w-3 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />멘토가 읽는 중...</>
          ) : (
            <>{tone === "kind" ? "😇" : "🦊"} AI 멘토 피드백 받기</>
          )}
        </button>
      )}
      {result && (
        <div className={`mt-2 p-3 rounded-xl border text-xs leading-relaxed ${
          tone === "kind"
            ? isDark ? "bg-blue-500/5 border-blue-500/20 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-800"
            : isDark ? "bg-amber-500/5 border-amber-500/20 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-black text-[10px] ${
              tone === "kind" ? isDark ? "text-blue-400" : "text-blue-600" : isDark ? "text-amber-400" : "text-amber-600"
            }`}>
              {tone === "kind" ? "😇 천사 멘토의 피드백" : "🦊 츤데레 선배의 팩트 폭행"}
            </span>
            <button type="button" onClick={() => onClose(sectionKey)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
              닫기
            </button>
          </div>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
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
  const [historyList, setHistoryList] = useState<PlanData[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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

  const [aiComment, setAiComment] = useState<AiComment | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme as Theme);
    const savedHistory = localStorage.getItem("vibe-history");
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory) as PlanData[];
      setHistoryList(parsed);
      if (parsed.length > 0) {
        const latest = parsed[0];
        setPlanData(latest);
        setIdea(latest.idea);
        setSelectedPlatform(latest.platform);
        setSelectedBM(latest.bm);
        setCurrentStep(2);
      }
    }
  }, []);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const handleMainSubmit = async () => {
    if (!idea.trim() || idea.trim().length < 10) return;
    loading || setLoading(true);
    setPlanData(null);
    setAiComment(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, type: "plan", platform: selectedPlatform, bm: selectedBM, tone: mentorTone }),
      });
      const json = await res.json();
      if (json.success || json.data) {
        const targetData = json.data || json;
        const newPlan: PlanData = {
          ...targetData,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          idea, platform: selectedPlatform, bm: selectedBM,
        };
        const updatedHistory = [newPlan, ...historyList];
        setHistoryList(updatedHistory);
        setPlanData(newPlan);
        localStorage.setItem("vibe-history", JSON.stringify(updatedHistory));
        setCurrentStep(2);
      }
    } catch (e) {
      console.error(e);
      alert("기획서 빌드 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: PlanData) => {
    setPlanData(item);
    setIdea(item.idea);
    setSelectedPlatform(item.platform);
    setSelectedBM(item.bm);
    setCurrentStep(2);
    setErrorResult(null); setRefinerResult(null); setMockResult(""); setCommitResult("");
    setAiComment(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("선택한 기획 아이디어를 삭제하시겠습니까?")) return;
    const updatedHistory = historyList.filter((item) => item.id !== id);
    setHistoryList(updatedHistory);
    localStorage.setItem("vibe-history", JSON.stringify(updatedHistory));
    setActiveMenuId(null);
    if (planData?.id === id) {
      setPlanData(null); setIdea(""); setCurrentStep(1);
      setProgressDesign(false); setProgressCode(false); setProgressDeploy(false);
      setAiComment(null);
    }
  };

  const handleGoToNewPlan = () => {
    setPlanData(null); setIdea(""); setCurrentStep(1);
    setProgressDesign(false); setProgressCode(false); setProgressDeploy(false);
    setAiComment(null);
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
    } catch (e) { console.error(e); }
    finally { setErrorLoading(false); setRefinerLoading(false); setMockLoading(false); setCommitLoading(false); }
  };

  const handleAiCommentRequest = async (sectionKey: string, content: string, sectionLabel: string) => {
    setAiComment({ sectionKey, content: "", loading: true });
    try {
      const prompt = `
다음은 비전공자 대학생이 작성한 서비스 기획서의 "${sectionLabel}" 섹션 내용입니다:
"${content}"

이 섹션을 집중적으로 리뷰해주세요.
- 잘된 점 1가지
- 개선하면 더 좋을 점 1-2가지
- 구체적인 보완 제안 1가지
3-5문장으로 짧고 명확하게 답해주세요.
      `;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: prompt, type: "guide", tone: mentorTone }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiComment({ sectionKey, content: typeof json.data === "string" ? json.data : JSON.stringify(json.data), loading: false });
      } else {
        setAiComment(null);
      }
    } catch (e) {
      console.error(e);
      setAiComment(null);
    }
  };

  const handleAiCommentClose = (key: string) => {
    if (aiComment?.sectionKey === key) setAiComment(null);
  };

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setPdfDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210, pageHeight = 297;
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

  const totalChecked = [planData ? true : false, progressDesign, progressCode, progressDeploy].filter(Boolean).length;
  const progressPercent = Math.round((totalChecked / 4) * 100);

  return (
    <main className={`relative min-h-screen antialiased transition-colors duration-300 ${isDark ? "bg-[#0a0a16] text-white" : "bg-slate-50 text-slate-900"}`}>
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-20 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
      )}

      {/* 네비 */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${isDark ? "border-white/5 bg-white/5" : "border-slate-200 bg-white/90"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-black tracking-tighter bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent hover:opacity-80 transition">
              🚀 VIBE 바이브코딩
            </Link>
            <Link href="/learn" className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              🎓 바이브 코딩 배우러가기
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex rounded-xl border p-0.5 text-xs font-bold ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" onClick={() => setMentorTone("kind")} className={`px-2 py-1 rounded-lg transition ${mentorTone === "kind" ? "bg-blue-500 text-white" : isDark ? "text-slate-400" : "text-slate-500"}`}>😇 천사 멘토</button>
              <button type="button" onClick={() => setMentorTone("tsundere")} className={`px-2 py-1 rounded-lg transition ${mentorTone === "tsundere" ? "bg-amber-600 text-white" : isDark ? "text-slate-400" : "text-slate-500"}`}>🦊 츤데레 선배</button>
            </div>
            <div className={`flex rounded-full border p-0.5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} className={`p-1.5 rounded-full transition ${!isDark ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}><SunIcon /></button>
              <button type="button" onClick={() => handleThemeChange("dark")} className={`p-1.5 rounded-full transition ${isDark ? "bg-white/10 shadow-sm text-violet-400" : "text-slate-400"}`}><MoonIcon /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex mx-auto max-w-7xl min-h-[calc(100vh-69px)]">

        {/* 사이드바 */}
        <aside className={`w-64 border-r shrink-0 hidden md:block p-4 overflow-y-auto space-y-4 ${isDark ? "border-white/5 bg-[#0d0d1f]" : "border-slate-200 bg-white"}`}>
          <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <span className="text-xs font-black tracking-wider text-slate-400 uppercase">🗂️ 나의 기획 보관함</span>
            <button onClick={handleGoToNewPlan} className="text-[11px] px-2 py-1 font-bold bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">+ 새 기획</button>
          </div>
          <div className="space-y-2">
            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">작성된 기획이 없습니다.</p>
            ) : (
              historyList.map((item) => (
                <div key={item.id} onClick={() => handleSelectHistoryItem(item)}
                  className={`group relative p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    planData?.id === item.id ? "border-blue-500 bg-blue-500/5" : isDark ? "border-white/5 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50"
                  }`}>
                  <div className="pr-5">
                    <p className="text-xs font-bold line-clamp-2 leading-snug">{item.idea}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{item.timestamp}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                      className={`p-1 rounded text-slate-400 focus:outline-none ${isDark ? "hover:text-white" : "hover:text-slate-700"}`}>⋮</button>
                    {activeMenuId === item.id && (
                      <div className={`absolute right-0 mt-1 w-20 rounded-md shadow-lg border text-xs z-50 overflow-hidden ${isDark ? "bg-neutral-900 border-white/10" : "bg-white border-slate-200"}`}>
                        <button onClick={(e) => handleDeleteHistoryItem(item.id, e)} className="w-full text-left px-2 py-1.5 text-red-500 hover:bg-red-500/10 font-bold">삭제하기</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* 메인 */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 진척도 */}
          {planData && (
            <div className={`border-b text-xs py-2.5 px-6 transition-colors ${isDark ? "bg-blue-950/20 border-white/5" : "bg-blue-50 border-slate-200"}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold">
                  <span>🎯 나의 앱 빌드 완성도:</span>
                  <div className={`w-24 h-2.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-blue-500 font-black">{progressPercent}%</span>
                </div>
                <div className={`flex flex-wrap gap-4 items-center font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {[
                    { label: "✨ 설계도 완성", checked: true, readOnly: true, onChange: undefined },
                    { label: "🎨 v0 디자인 복붙완료", checked: progressDesign, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressDesign(e.target.checked) },
                    { label: "💻 Cursor 기능연결", checked: progressCode, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressCode(e.target.checked) },
                    { label: "🚀 전세계 무료배포", checked: progressDeploy, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressDeploy(e.target.checked) },
                  ].map((item) => (
                    <label key={item.label} className={`flex items-center gap-1.5 cursor-pointer ${isDark ? "hover:text-white" : "hover:text-slate-800"}`}>
                      <input type="checkbox" checked={item.checked} readOnly={item.readOnly} onChange={item.onChange} className="rounded border-slate-300 accent-blue-500" />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 스텝 탭 */}
          <div className={`border-b sticky top-[69px] z-40 transition-colors ${isDark ? "border-white/5 bg-[#0f0f23]" : "border-slate-200 bg-white shadow-sm"}`}>
            <div className="flex items-center px-6 py-3.5 overflow-x-auto gap-4">
              {[
                { step: 1, label: "💡 1. 아이디어 다듬기" },
                { step: 2, label: "📋 2. 초쉬운 기획 요건 확인" },
                { step: 3, label: "✨ 3. AI 전용 복사-붙여넣기 치트키" },
                { step: 4, label: "🛠️ 4. 뚝딱뚝딱 개발 헬퍼 룸" },
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isAccessible = item.step === 1 || planData !== null;
                return (
                  <button key={item.step} disabled={!isAccessible} onClick={() => setCurrentStep(item.step)}
                    className={`flex items-center gap-2 font-bold text-xs md:text-sm whitespace-nowrap transition border-b-2 py-1.5 focus:outline-none ${
                      isActive ? "border-blue-500 text-blue-500 font-extrabold"
                        : isAccessible ? isDark ? "border-transparent text-slate-500 hover:text-white" : "border-transparent text-slate-500 hover:text-slate-800"
                        : "border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed"
                    }`}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="px-6 py-10 relative z-10 flex-1">

            {loading && (
              <div className="my-20 flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                <h3 className="text-lg font-bold">인공지능 튜터가 당신의 아이디어를 1초 만에 조립하고 있어요! 🛠️</h3>
                <p className="text-sm text-slate-400">
                  {mentorTone === "kind" ? "비전공자도 하루 만에 구현할 수 있는 가장 쉬운 방식의 뼈대를 짜는 중입니다." : "형편없는 주석 달기 전에 알아서 굴러가게 아키텍처 뽑고 있으니까 잠깐만 기다려 봐."}
                </p>
              </div>
            )}

            {/* ── STEP 1 ── */}
            {!loading && currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">머릿속 아이디어를 하루 만에 현실로 만들어보세요!</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>코딩을 몰라도 괜찮습니다. 만들고 싶은 서비스의 형태와 종류를 고르고 툭 던져만 주세요.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">어디서 작동하는 서비스인가요?</label>
                    <div className="flex flex-wrap gap-2">
                      {platformOptions.map((p) => (
                        <button key={p} type="button" onClick={() => setSelectedPlatform(p)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${selectedPlatform === p ? "bg-blue-600 border-blue-600 text-white" : isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700 hover:border-blue-400"}`}>
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
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${selectedBM === b ? "bg-violet-600 border-violet-600 text-white" : isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-700 hover:border-violet-400"}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">나의 기획 아이디어 자유롭게 적기</label>
                  <textarea value={idea} onChange={(e) => setIdea(e.target.value)}
                    placeholder="예) 우리 학교 학생들끼리 안 쓰는 물건을 서로 빌려주고 소정의 대여료를 받는 따뜻한 당근마켓 같은 앱"
                    rows={5}
                    className={`w-full rounded-2xl border p-4 text-base leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 transition ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>자세하게 적을수록 AI가 더 쉽고 친절하게 기획서를 완성해 줍니다.</span>
                    <button type="button" onClick={handleMainSubmit} disabled={idea.trim().length < 10}
                      className="px-6 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed">
                      하루 만에 완성하는 설계도 뽑기 →
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <span className="text-xs font-bold text-slate-400 block mb-3 text-center">할 말이 떠오르지 않는다면? 아래 예시를 클릭해 보세요!</span>
                  <div className="grid gap-3 md:grid-cols-2">
                    {examples.map((ex) => (
                      <button key={ex} type="button" onClick={() => setIdea(ex)}
                        className={`p-4 rounded-xl border text-left text-xs leading-relaxed transition ${isDark ? "bg-white/5 border-white/10 text-slate-300 hover:border-blue-500" : "bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:bg-blue-50/50"}`}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={`pt-6 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
                  <span className="text-xs font-black text-slate-400 block mb-3">🔥 오늘 VIBE를 거쳐 간 선배 메이커들의 생생한 한줄 발자취</span>
                  <div className="grid gap-3 md:grid-cols-3">
                    {reviewFeeds.map((feed, i) => (
                      <div key={i} className={`p-3.5 border rounded-xl text-xs ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"}`}>
                        <span className="font-bold text-blue-500 block mb-1">{feed.major}</span>
                        <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>"{feed.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {!loading && planData && currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`border-b pb-4 flex flex-wrap items-center justify-between gap-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <div>
                    <h1 className="text-2xl font-black md:text-3xl tracking-tight">📋 2. 초쉬운 기획 요건 확인방</h1>
                    <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      선택한 설정: <span className="text-blue-500 font-bold">{selectedPlatform}</span> | <span className="text-violet-500 font-bold">{selectedBM}</span>
                    </p>
                  </div>
                  <button type="button" onClick={handleDownloadPDF} disabled={pdfDownloading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${isDark ? "bg-white text-slate-900 hover:opacity-90" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                    {pdfDownloading ? "설계도 다운로드 중..." : "📄 내 기획안 한눈에 보기 (PDF 저장)"}
                  </button>
                </div>

                {planData.summary && (
                  <div className={`p-4 rounded-2xl border ${mentorTone === "kind" ? isDark ? "bg-[#12122c] border-blue-500/20" : "bg-blue-50 border-blue-200" : isDark ? "bg-[#1a1424] border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
                    <span className={`text-xs font-black block mb-1.5 ${mentorTone === "kind" ? isDark ? "text-blue-400" : "text-blue-600" : isDark ? "text-amber-400" : "text-amber-600"}`}>
                      {mentorTone === "kind" ? "😇 인공지능 튜터의 초속성 마인드셋 레슨:" : "🦊 한마디만 하겠는데 귀담아들어라:"}
                    </span>
                    <p className={`text-xs leading-relaxed font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                      {mentorTone === "kind" ? planData.summary : "솔직히 기획 수준이 갈 길이 멀긴 한데, 그래도 뼈대는 갖췄으니까 눈 똑바로 뜨고 확인해봐."}
                    </p>
                  </div>
                )}

                <div className={`flex border-b gap-2 overflow-x-auto ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  {[
                    { id: "impact", label: "🎯 목표와 사용자" },
                    { id: "features", label: "⚙️ 핵심 기능 목록" },
                    { id: "stories", label: "👤 사용 시나리오" },
                    { id: "screens", label: "📱 필요한 화면" },
                    { id: "tips", label: "💰 무료 배포 팁" },
                  ].map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setStep2Tab(tab.id as any)}
                      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition focus:outline-none whitespace-nowrap ${
                        step2Tab === tab.id ? "border-blue-500 text-blue-500" : isDark ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-slate-400 hover:text-slate-700"
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className={`p-4 rounded-2xl border min-h-[250px] ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>

                  {step2Tab === "impact" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-black text-blue-500 mb-2">🔍 유저들이 겪고 있는 진짜 문제점은 무엇인가요?</h3>
                        <p className={`text-xs leading-relaxed p-4 rounded-xl ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>{planData.problem}</p>
                        <AiCommentBox sectionKey="problem" sectionLabel="문제 정의" content={planData.problem}
                          tone={mentorTone} isDark={isDark} comment={aiComment}
                          onRequest={handleAiCommentRequest} onClose={handleAiCommentClose} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-violet-500 mb-2">👥 이 서비스를 가장 먼저 반길 최우선 타겟은 누구인가요?</h3>
                        <p className={`text-xs leading-relaxed p-4 rounded-xl ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>{planData.target}</p>
                        <AiCommentBox sectionKey="target" sectionLabel="타겟 사용자" content={planData.target}
                          tone={mentorTone} isDark={isDark} comment={aiComment}
                          onRequest={handleAiCommentRequest} onClose={handleAiCommentClose} />
                      </div>
                    </div>
                  )}

                  {step2Tab === "features" && (
                    <div className="space-y-4">
                      {planData.features?.map((f, i) => (
                        <div key={i} className={`p-4 border rounded-xl ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">기능 {i + 1}</span>
                            <h4 className="text-xs font-black">{f.name}</h4>
                          </div>
                          <p className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{f.desc}</p>
                          <div className={`p-3 rounded-lg border ${isDark ? "bg-black/20 border-white/5" : "bg-white border-slate-200"}`}>
                            <span className="text-[10px] font-bold text-blue-500 block mb-1.5">🚨 AI 코딩 메이킹이 끝난 후 눈으로 직접 확인할 체크리스트</span>
                            <ul className={`space-y-1 text-xs list-disc pl-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              {f.criteria?.map((c, ci) => <li key={ci}>{c}</li>)}
                            </ul>
                          </div>
                          <AiCommentBox
                            sectionKey={`feature-${i}`} sectionLabel={`기능 ${i + 1}: ${f.name}`}
                            content={`기능명: ${f.name}\n설명: ${f.desc}\n체크리스트: ${f.criteria?.join(", ")}`}
                            tone={mentorTone} isDark={isDark} comment={aiComment}
                            onRequest={handleAiCommentRequest} onClose={handleAiCommentClose} />
                        </div>
                      ))}
                    </div>
                  )}

                  {step2Tab === "stories" && (
                    <div className="space-y-2">
                      {planData.userStories?.map((story, idx) => (
                        <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl text-xs leading-relaxed ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
                          <span className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center font-bold text-slate-500 ${isDark ? "bg-white/10" : "bg-slate-200"}`}>{idx + 1}</span>
                          <p className="mt-0.5">{story}</p>
                        </div>
                      ))}
                      <AiCommentBox sectionKey="stories" sectionLabel="사용자 시나리오 전체"
                        content={planData.userStories?.join("\n")} tone={mentorTone} isDark={isDark}
                        comment={aiComment} onRequest={handleAiCommentRequest} onClose={handleAiCommentClose} />
                    </div>
                  )}

                  {step2Tab === "screens" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {planData.screens?.map((scr, i) => (
                          <div key={i} className={`p-4 border rounded-xl ${isDark ? "border-white/10 bg-neutral-900" : "border-slate-200 bg-white"}`}>
                            <h4 className="text-xs font-black mb-1.5">{scr.name}</h4>
                            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{scr.desc}</p>
                            <AiCommentBox
                              sectionKey={`screen-${i}`} sectionLabel={`화면: ${scr.name}`}
                              content={`화면명: ${scr.name}\n설명: ${scr.desc}`}
                              tone={mentorTone} isDark={isDark} comment={aiComment}
                              onRequest={handleAiCommentRequest} onClose={handleAiCommentClose} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step2Tab === "tips" && (
                    <div className="space-y-4 text-xs">
                      <h3 className="text-sm font-black text-amber-500">💰 지갑 보호! 비전공자 대학생을 위한 0원 배포 가이드</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className={`p-4 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <h4 className="font-bold text-blue-500 mb-1">💻 화면 배포: Vercel (완전 무료)</h4>
                          <p className={isDark ? "text-slate-400 leading-relaxed" : "text-slate-500 leading-relaxed"}>깃허브 저장소와 단 3번의 클릭으로 연결됩니다. 결제 카드 등록 없이도 전 세계 누구나 접속할 수 있는 공짜 주소(.vercel.app)를 즉시 발급해 줍니다.</p>
                        </div>
                        <div className={`p-4 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <h4 className="font-bold text-emerald-500 mb-1">🗄️ 데이터 저장고: Supabase (프리 티어)</h4>
                          <p className={isDark ? "text-slate-400 leading-relaxed" : "text-slate-500 leading-relaxed"}>엑셀처럼 쓸 수 있는 웹 데이터베이스 상자입니다. 동시 접속자 수백 명이 들어와도 끄떡없는 용량을 평생 비용 없이 무료 범위 안에서 제공합니다.</p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-[11px] text-center text-slate-500">
                        📢 <strong>꿀팁:</strong> Cursor AI 에디터에게 <strong>"이 프로젝트를 Vercel에 무료로 올리는 구조로 세팅해줘"</strong> 라고 치면 세팅까지 알아서 다 해줍니다.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={handleGoToNewPlan} className={`text-xs font-bold underline ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>← 새 기획 작성화면 이동</button>
                  <button type="button" onClick={() => setCurrentStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                    Step 03 AI 복사 치트키 얻으러 가기 →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {!loading && planData && currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">✨ 3. AI 전용 복사-붙여넣기 치트키</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>원하는 AI 제작 도구를 선택하고 버튼을 누르세요.</p>
                </div>

                <div className={`flex border-b gap-2 overflow-x-auto ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <button type="button" onClick={() => setStep3Tab("ui")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ui" ? "border-blue-500 text-blue-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>🎨 1단계: 테마 디자인 (v0.dev 용)</button>
                  <button type="button" onClick={() => setStep3Tab("ide")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ide" ? "border-violet-500 text-violet-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>💻 2단계: 기능 연결 (Cursor 에디터 용)</button>
                  <button type="button" onClick={() => setStep3Tab("db")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "db" ? "border-emerald-500 text-emerald-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>🗄️ 3단계: 정보 창고 (Supabase 용)</button>
                </div>

                <div className={`p-5 rounded-2xl border min-h-[200px] ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                  {step3Tab === "ui" && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-blue-500 font-bold mb-2">💡 사용법: 아래 박스의 프롬프트를 복사한 뒤 v0.dev 혹은 Bolt.new 사이트의 입력창에 그대로 붙여넣으세요!</div>
                      {planData.prompts?.ui?.map((p, i) => (
                        <div key={i} className={`flex justify-between items-start gap-4 p-4 border rounded-xl ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
                          <button type="button" onClick={() => triggerCopy(p)} className={`shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded transition ${isDark ? "bg-neutral-800 border-white/10 text-blue-400" : "bg-white border-slate-200 text-blue-500 hover:bg-blue-50"}`}>
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
                        <div key={i} className={`flex justify-between items-start gap-4 p-4 border rounded-xl ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
                          <button type="button" onClick={() => triggerCopy(p)} className={`shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded transition ${isDark ? "bg-neutral-800 border-white/10 text-violet-400" : "bg-white border-slate-200 text-violet-500 hover:bg-violet-50"}`}>
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

                {/* ✅ 주의사항 박스 (딱 하나만!) */}
                <div className={`p-4 rounded-xl border border-amber-500/20 text-xs leading-relaxed ${isDark ? "bg-amber-500/5 text-white/60" : "bg-amber-50 text-slate-600"}`}>
                  <span className="font-bold text-amber-600 block mb-1">⚠️ 복붙 전 꼭 읽어두면 주머니와 멘탈에 좋은 가이드</span>
                  AI 도구 화면에 빨간 불이 아니라{" "}
                  <strong className="text-amber-600">노란색 느낌표 경고(Warning)</strong>
                  가 뜨는 건 컴퓨터가 혼자 잔소리하는 거라 가볍게 무시하셔도 완벽하게 작동합니다!
                  또한 무료 범위 내에서 카드를 등록하라는 알림이 오더라도 당황하지 마시고 창을 닫은 후
                  무료 등급으로 계속 사용하시면 지갑 방어가 완료됩니다.
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setCurrentStep(2)} className={`text-xs font-bold underline ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>← 기획서 다시보기</button>
                  <button type="button" onClick={() => setCurrentStep(4)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">Step 04 나만의 비밀 개발 에이드 비서방 이동 →</button>
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {!loading && planData && currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">🛠️ 4. 뚝딱뚝딱 개발 헬퍼 룸</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    바이브코딩 도중 에러가 나거나 막힐 때 도움을 요청하세요. (현재 모드: <span className="text-amber-500 font-bold">{mentorTone === "kind" ? "👼 천사 코치" : "🦊 츤데레 선배"}</span>)
                  </p>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 border-b pb-2 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                  {[
                    { id: "error", title: "🚨 빨간 에러글 해결사" },
                    { id: "refiner", title: "✍️ 프롬프트 깎기" },
                    { id: "mock", title: "📦 가짜 데이터 상자" },
                    { id: "commit", title: "🌿 깃허브 제출 일기" },
                  ].map((tool) => (
                    <button key={tool.id} type="button" onClick={() => setStep4Tool(tool.id as any)}
                      className={`p-3 text-xs font-bold rounded-xl text-center border transition ${
                        step4Tool === tool.id
                          ? isDark ? "bg-white text-slate-900 border-white shadow-sm" : "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : isDark ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}>
                      {tool.title}
                    </button>
                  ))}
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                  {step4Tool === "error" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black mb-1 text-red-500">화면에 뜬 무서운 영어 에러 문장을 그대로 복사해서 넣어주세요</h3>
                        <textarea value={errorInput} onChange={(e) => setErrorInput(e.target.value)}
                          placeholder="예) TypeError: Cannot read properties of undefined..." rows={3}
                          className={`w-full text-xs font-mono p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("error", errorInput)} disabled={errorLoading || !errorInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {errorLoading ? "무슨 일인지 분석 중..." : "마법 해결사 호출"}
                        </button>
                      </div>
                      {errorResult && (
                        <div className={`p-4 rounded-xl text-xs space-y-3 border ${isDark ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                          <div>
                            <strong className="text-red-500 font-bold block">{mentorTone === "kind" ? "💡 컴퓨터가 화난 진짜 이유:" : "🦊 선배의 팩트 폭행:"}</strong>
                            <p className="mt-1 leading-relaxed">{mentorTone === "kind" ? errorResult.cause : "어디서 이상한 데서 코드 끊어먹고 가져왔냐? 비어 있는 정보 바구니에서 혼자 멋대로 아이템 꺼내 쓰려고 하니까 크래시가 난 거잖아."}</p>
                          </div>
                          <div>
                            <strong className="text-emerald-500 font-bold block">🛠️ 이렇게 고쳐보세요:</strong>
                            <p className="mt-1 leading-relaxed">{mentorTone === "kind" ? errorResult.solution : "거기 코드 창 열고 데이터 검사하는 if문 한 줄만 추가해. 모르면 아래 치트키 복사해서 Cursor에 그대로 먹여."}</p>
                          </div>
                          <div className={`pt-2 border-t flex justify-between items-center ${isDark ? "border-white/10" : "border-slate-200"}`}>
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
                        <textarea value={refinerInput} onChange={(e) => setRefinerInput(e.target.value)}
                          placeholder="예) 로그인 화면 하나 이쁘게 리액트로 짜줘" rows={3}
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("prompt", refinerInput)} disabled={refinerLoading || !refinerInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {refinerLoading ? "멋지게 수정하는 중..." : "말 바꾸기 치트키 가공"}
                        </button>
                      </div>
                      {refinerResult && (
                        <div className="grid md:grid-cols-2 gap-3 text-xs">
                          <div className={`p-3 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                            <span className="text-slate-400 block mb-1">내가 쓴 글</span>{refinerResult.original}
                          </div>
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
                        <input type="text" value={mockInput} onChange={(e) => setMockInput(e.target.value)}
                          placeholder="예) 대학생 중고 물품 대여 리스트 5개"
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("mock", mockInput || idea)} disabled={mockLoading}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
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
                        <input type="text" value={commitInput} onChange={(e) => setCommitInput(e.target.value)}
                          placeholder="예) 메인 페이지에 배너 이미지 넣기 성공"
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("commit", commitInput)} disabled={commitLoading || !commitInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {commitLoading ? "번역 중..." : "멋진 개발용 메시지 완성"}
                        </button>
                      </div>
                      {commitResult && (
                        <div className={`p-3 border rounded-xl flex justify-between items-center text-xs font-mono ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <span className="text-blue-500 font-bold">{commitResult}</span>
                          <button type="button" onClick={() => triggerCopy(commitResult)} className={`font-bold text-[11px] ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>
                            {copiedText === commitResult ? "복사 성공!" : "복사"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <footer className={`border-t py-6 text-center text-xs transition-colors ${isDark ? "border-white/5 text-slate-600" : "border-slate-200 text-slate-400"}`}>
            <p>© VIBE PROJECT 1-Day VibeCoding Canvas. 비전공자도 아이디어를 하루 만에 실현하는 1등 플랫폼.</p>
          </footer>
        </div>
      </div>

      {/* PDF Hidden DOM */}
      {planData && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={reportRef} style={{ width: "800px", padding: "50px", backgroundColor: "#ffffff", color: "#1e293b", fontFamily: "sans-serif" }}>
            <div style={{ borderBottom: "3px solid #2563eb", paddingBottom: "15px", marginBottom: "35px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#2563eb" }}>
                <span>VIBE 1-DAY APP BUILDER SPECIFICATION</span><span>하루 완성 비밀 설계도</span>
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", marginTop: "10px", marginBottom: "10px" }}>비전공자 초속성 서비스 구현 사업 기획서 및 개발 스펙 가이드</h1>
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
                      <td style={{ padding: "8px", fontWeight: "bold" }}>{f.name}<br /><span style={{ fontSize: "10px", fontWeight: "normal", color: "#64748b" }}>{f.desc}</span></td>
                      <td style={{ padding: "8px" }}><ul style={{ margin: 0, paddingLeft: "15px" }}>{f.criteria?.map((cr, cidx) => <li key={cidx}>{cr}</li>)}</ul></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "15px", textAlign: "right", fontSize: "10px", color: "#64748b" }}>
              <span>본 문서는 비전공자의 창업 스펙 빌딩 가이드라인입니다.</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
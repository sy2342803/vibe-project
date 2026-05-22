"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type {
  ErrorGuideData,
  MentorTone,
  PlanContent,
  PlanData,
  PromptCoachData,
  Theme,
} from "@/lib/vibe-types";

import {
  buildPremiumStep3Prompts,
  buildPresentationSummary,
  buildToolPrompts,
} from "@/lib/vibe-extra";
interface AiComment {
  sectionKey: string;
  content: string;
  loading: boolean;
}

type ToastVariant = "error" | "success" | "info";
type Step2Tab =
  | "impact"
  | "features"
  | "stories"
  | "screens"
  | "presentation"
  | "tips";

type Step3Tab = "ui" | "ide" | "db" | "tools";
type Step4Tool = "error" | "refiner" | "mock" | "commit";

interface Step3Guide {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
  links: { label: string; href: string }[];
  note: string;
}

const platformOptions = ["Web 웹사이트", "iOS 앱", "Android 앱", "Cross-Platform", "Chrome 익스텐션"];
const bmOptions = ["구독형 SaaS", "플랫폼 및 중개 수수료", "인앱 결제 및 광고", "수수료 + 프리미엄 모델"];
const loadingSteps = [
  { icon: "🔍", text: "아이디어의 핵심 문제를 분석하고 있어요." },
  { icon: "🧩", text: "첫 버전에 필요한 기능을 고르고 있어요." },
  { icon: "📋", text: "기획서 구조를 정리하고 있어요." },
  { icon: "✨", text: "AI 코딩 도구용 프롬프트를 만들고 있어요." },
  { icon: "✅", text: "제출용으로 읽기 좋게 다듬고 있어요." },
];
const step2Tabs: { id: Step2Tab; label: string }[] = [
  { id: "impact", label: "목표와 사용자" },
  { id: "features", label: "핵심 기능" },
  { id: "stories", label: "사용 시나리오" },
  { id: "screens", label: "필요한 화면" },
  { id: "presentation", label: "발표 자료" },
  { id: "tips", label: "무료 배포 팁" },
];
const step4Tools: { id: Step4Tool; title: string }[] = [
  { id: "error", title: "에러 해석기" },
  { id: "refiner", title: "프롬프트 코치" },
  { id: "mock", title: "샘플 데이터" },
  { id: "commit", title: "커밋 메시지" },
];
const step3Guides: Record<Exclude<Step3Tab, "tools">, Step3Guide> = {
  ui: {
    eyebrow: "v0.dev 또는 Bolt.new",
    title: "화면 초안을 먼저 만듭니다",
    description: "로그인 없이도 둘러볼 수 있지만, 결과를 저장하려면 계정 로그인이 필요합니다. 새 프로젝트 화면의 큰 입력창에 아래 프롬프트를 그대로 붙여넣으세요.",
    steps: [
      "v0.dev 또는 Bolt.new에 접속한 뒤 새 채팅/새 프로젝트를 엽니다.",
      "화면 중앙의 입력창에 UI 초안 프롬프트를 붙여넣고 생성 버튼을 누릅니다.",
      "빨간 터미널 에러가 나오면 Step 4의 에러 해석기에 그대로 붙여넣습니다.",
      "마음에 드는 화면이 나오면 코드를 복사하거나 GitHub/Cursor로 이어갑니다.",
    ],
    links: [
      { label: "v0.dev 열기", href: "https://v0.dev" },
      { label: "Bolt.new 열기", href: "https://bolt.new" },
    ],
    note: "처음에는 결제, 로그인, 실제 DB 연결을 한 번에 요구하지 않는 편이 안정적입니다. 먼저 화면과 흐름을 만든 뒤 기능을 연결하세요.",
  },
  ide: {
    eyebrow: "Cursor",
    title: "Cursor에서 기능을 연결합니다",
    description: "Cursor는 VS Code처럼 생긴 AI 코드 편집기입니다. 프로젝트 폴더를 열고 오른쪽 AI 채팅창 또는 Composer에 아래 프롬프트를 붙여넣으세요.",
    steps: [
      "Cursor를 설치하고 프로젝트 폴더를 엽니다.",
      "AI 채팅창에서 먼저 현재 파일 구조를 읽어달라고 요청합니다.",
      "아래 Cursor 프롬프트를 붙여넣고, 한 번에 한 기능씩 적용합니다.",
      "수정 후 npm run lint, npm run build 결과를 Cursor에게 함께 보여주며 고칩니다.",
    ],
    links: [
      { label: "Cursor 다운로드", href: "https://cursor.com" },
      { label: "Vercel 열기", href: "https://vercel.com" },
    ],
    note: "Cursor에는 “내 기존 파일을 삭제하지 말고 필요한 파일만 수정해줘”라는 조건을 함께 넣는 것이 좋습니다.",
  },
  db: {
    eyebrow: "Supabase",
    title: "데이터 저장 구조를 준비합니다",
    description: "Supabase는 웹에서 쓰는 데이터베이스입니다. 프로젝트를 만든 뒤 SQL Editor 화면에 아래 SQL을 붙여넣고 실행합니다.",
    steps: [
      "Supabase에 접속해 New project를 만듭니다.",
      "왼쪽 메뉴에서 SQL Editor를 열고 New query를 누릅니다.",
      "아래 SQL 초안을 붙여넣고 Run을 누릅니다.",
      "실패하면 에러 문장을 복사해 Step 4 에러 해석기에 넣습니다.",
    ],
    links: [
      { label: "Supabase 열기", href: "https://supabase.com/dashboard" },
      { label: "SQL Editor 안내", href: "https://supabase.com/docs/guides/database/overview" },
    ],
    note: "처음에는 개인정보, 결제 정보처럼 민감한 데이터를 넣지 말고 샘플 데이터로 연결을 확인하세요.",
  },
};

const examples = [
  "학교 근처 맛집을 학생들끼리 공유하고 실시간 빈자리 확인하는 앱",
  "동아리 신입 부원 모집부터 면접 일정, 합격 공지까지 통합 관리하는 웹",
  "전공 서적 및 중고 교재를 같은 대학 학생들끼리 인증 후 직거래하는 서비스",
  "우리 학과 전공 수업의 로드맵과 진짜 솔직한 강의평을 익명으로 모아보는 커뮤니티",
];

const reviewFeeds = [
  { major: "경영학과 김*현", text: "에러 해결사 비서 덕분에 코딩 1도 모르는데 밤새우고 과제 앱 제출 성공했습니다ㅠㅠ" },
  { major: "시각디자인과 이*은", text: "v0 프롬프트를 그대로 적용하니 사이트 화면을 빠르게 만들 수 있었어요." },
  { major: "컴공 복전생 박*우", text: "무료 배포 가이드 보고 Vercel에 링크 올렸어요! 친구들한테 주소 공유하니까 소름 돋는대요." },
];
const mentorTips: Record<MentorTone, { name: string; label: string; tips: string[] }> = {
  kind: {
    name: "천사멘토",
    label: "따뜻한 코칭",
    tips: [
      "처음부터 완성형 앱을 요구하지 않아도 괜찮아요. 화면, 기능, 데이터 순서로 나누면 성공 확률이 훨씬 올라갑니다.",
      "AI가 만든 결과가 마음에 들지 않으면 실패가 아니라 재료가 생긴 거예요. 어떤 점을 바꾸고 싶은지 한 문장씩 추가해보세요.",
      "에러가 나오면 당황하지 말고 에러 문장, 하려던 일, 관련 파일을 함께 AI에게 보여주세요.",
    ],
  },
  tsundere: {
    name: "츤데레 선배",
    label: "현실 조언",
    tips: [
      "솔직히 한 번에 로그인, 결제, DB까지 다 시키면 터질 가능성이 높아. 먼저 화면부터 제대로 만들고 기능을 붙여.",
      "프롬프트가 짧으면 AI도 대충 만든다. 역할, 기술스택, 금지사항, 완료 기준까지 적어야 결과물이 쓸만해져.",
      "에러를 숨기지 말고 그대로 복사해. 에러 메시지는 네가 망했다는 뜻이 아니라 어디를 고칠지 알려주는 주소야.",
    ],
  },
};

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

// ── 로딩 단계 애니메이션 컴포넌트 ──
function LoadingSteps({ isDark }: { isDark: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm space-y-2">
      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000"
          style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
        />
      </div>
      <div className={`flex items-center justify-center gap-2 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        <span className="text-lg">{loadingSteps[currentStep].icon}</span>
        <span>{loadingSteps[currentStep].text}</span>
      </div>
      <div className="flex justify-center gap-2 pt-2">
        {loadingSteps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentStep
                ? "w-6 bg-blue-500"
                : i < currentStep
                ? isDark ? "w-1.5 bg-white/30" : "w-1.5 bg-slate-300"
                : isDark ? "w-1.5 bg-white/10" : "w-1.5 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
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
  const mentorName = mentorTips[tone].name;

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
            <>{mentorName} 피드백 받기</>
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
              {mentorName}의 피드백
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

function StatusToast({
  message,
  variant,
  onClose,
  isDark,
}: {
  message: string;
  variant: ToastVariant;
  onClose: () => void;
  isDark: boolean;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toneClass = {
    error: isDark ? "bg-red-950 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700",
    success: isDark ? "bg-emerald-950 border-emerald-500/30 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-700",
    info: isDark ? "bg-blue-950 border-blue-500/30 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-700",
  }[variant];
  const icon = { error: "!", success: "✓", info: "i" }[variant];

  return (
    <div role="status" className={`fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-bold shadow-2xl transition-all animate-fadeIn ${toneClass}`}>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs">{icon}</span>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="알림 닫기" className="ml-auto opacity-60 hover:opacity-100 text-xs">닫기</button>
    </div>
  );
}

interface ChatApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  recovered?: boolean;
  warning?: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function toPlanContent(value: unknown): PlanContent {
  return value as PlanContent;
}

function HistoryArchive({
  historyList,
  selectedId,
  activeMenuId,
  isDark,
  onNewPlan,
  onSelect,
  onDelete,
  onToggleMenu,
}: {
  historyList: PlanData[];
  selectedId?: string;
  activeMenuId: string | null;
  isDark: boolean;
  onNewPlan: () => void;
  onSelect: (item: PlanData) => void;
  onDelete: (id: string, event: React.SyntheticEvent) => void;
  onToggleMenu: (id: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">나의 기획 보관함</span>
        <button
          type="button"
          onClick={onNewPlan}
          className="rounded-md bg-blue-500 px-2 py-1 text-[11px] font-bold text-white transition hover:bg-blue-600"
        >
          + 새 기획
        </button>
      </div>
      <div className="space-y-2">
        {historyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <span className="text-4xl" aria-hidden="true">□</span>
            <p className="whitespace-pre-line text-center text-xs text-slate-400">아직 작성된 기획이 없어요.{"\n"}첫 번째 아이디어를 입력해보세요.</p>
          </div>
        ) : (
          historyList.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(item);
                }
              }}
              className={`group relative flex w-full cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition ${
                selectedId === item.id ? "border-blue-500 bg-blue-500/5" : isDark ? "border-white/5 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="pr-5">
                <span className="block line-clamp-2 text-xs font-bold leading-snug">{item.idea}</span>
                <span className="mt-1 block text-[10px] text-slate-400">{item.timestamp}</span>
              </span>
              <span className="absolute right-2 top-2">
                <button
                  type="button"
                  aria-label="기획 메뉴 열기"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleMenu(activeMenuId === item.id ? null : item.id);
                  }}
                  className={`block rounded p-1 text-slate-400 focus:outline-none ${isDark ? "hover:text-white" : "hover:text-slate-700"}`}
                >
                  ⋮
                </button>
                {activeMenuId === item.id && (
                  <span className={`absolute right-0 z-50 mt-1 block w-20 overflow-hidden rounded-md border text-xs shadow-lg ${isDark ? "border-white/10 bg-neutral-900" : "border-slate-200 bg-white"}`}>
                    <button
                      type="button"
                      onClick={(event) => onDelete(item.id, event)}
                      className="block w-full px-2 py-1.5 text-left font-bold text-red-500 hover:bg-red-500/10"
                    >
                      삭제하기
                    </button>
                  </span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ToolGuidePanel({ guide, isDark }: { guide: Step3Guide; isDark: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-500">{guide.eyebrow}</span>
          <h2 className={`mt-1 text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>{guide.title}</h2>
          <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{guide.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {guide.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"}`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <ol className={`mt-4 grid gap-2 text-xs leading-relaxed md:grid-cols-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {guide.steps.map((step, index) => (
          <li key={step} className={`rounded-lg border px-3 py-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
            <strong className="mr-2 text-blue-500">{index + 1}</strong>
            {step}
          </li>
        ))}
      </ol>
      <p className={`mt-3 rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${isDark ? "border-amber-500/20 bg-amber-500/5 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        {guide.note}
      </p>
    </div>
  );
}

function MentorTipBox({ tone, isDark }: { tone: MentorTone; isDark: boolean }) {
  const mentor = mentorTips[tone];
  const palette = tone === "kind"
    ? isDark ? "border-blue-500/20 bg-blue-500/5 text-blue-100" : "border-blue-200 bg-blue-50 text-blue-900"
    : isDark ? "border-amber-500/20 bg-amber-500/5 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div className={`rounded-2xl border p-4 ${palette}`}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-black">{mentor.name}의 중간 팁</h2>
        <span className="text-[11px] font-bold opacity-70">{mentor.label}</span>
      </div>
      <ul className="grid gap-2 text-xs leading-relaxed md:grid-cols-3">
        {mentor.tips.map((tip) => (
          <li key={tip} className={`rounded-xl border px-3 py-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-white/70 bg-white/70"}`}>
            {tip}
          </li>
        ))}
      </ul>
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

  const [step2Tab, setStep2Tab] = useState<Step2Tab>("impact");
  const [step3Tab, setStep3Tab] = useState<Step3Tab>("ui");
  const [step4Tool, setStep4Tool] = useState<Step4Tool>("error");

  const [errorInput, setErrorInput] = useState("");
  const [errorResult, setErrorResult] = useState<ErrorGuideData | null>(null);
  const [errorLoading, setErrorLoading] = useState(false);

  const [refinerInput, setRefinerInput] = useState("");
  const [refinerResult, setRefinerResult] = useState<PromptCoachData | null>(null);
  const [refinerLoading, setRefinerLoading] = useState(false);

  const [mockInput, setMockInput] = useState("");
  const [mockResult, setMockResult] = useState<string>("");
  const [mockLoading, setMockLoading] = useState(false);

  const [commitInput, setCommitInput] = useState("");
  const [commitResult, setCommitResult] = useState<string>("");
  const [commitLoading, setCommitLoading] = useState(false);

  const [aiComment, setAiComment] = useState<AiComment | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedTheme = localStorage.getItem("vibe-theme");
        if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme as Theme);

        const savedHistory = localStorage.getItem("vibe-history");
        if (!savedHistory) return;

        const parsed = JSON.parse(savedHistory);
        if (!Array.isArray(parsed)) return;

        const history = parsed.filter((item): item is PlanData => Boolean(item && typeof item === "object"));
        setHistoryList(history);

        if (history.length > 0) {
          const latest = history[0];
          setPlanData(latest);
          setIdea(latest.idea || "");
          setSelectedPlatform(latest.platform || "Web 웹사이트");
          setSelectedBM(latest.bm || "구독형 SaaS");
          setCurrentStep(2);
        }
      } catch {
        localStorage.removeItem("vibe-history");
        setToast({
          message: "저장된 기획 기록이 손상되어 초기화했습니다. 새 기획은 정상적으로 저장됩니다.",
          variant: "info",
        });
      }
    });
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
    setAiComment(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, type: "plan", platform: selectedPlatform, bm: selectedBM, tone: mentorTone }),
      });
      const json = (await res.json()) as ChatApiResponse<PlanContent>;
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "기획서 생성에 실패했습니다.");
      }
      const targetData = toPlanContent(json.data);
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
      if (json.recovered || json.warning) {
        setToast({
          message: json.warning || "AI 응답 일부를 보정해 기획서 구조를 안전하게 채웠습니다.",
          variant: "info",
        });
      } else {
        setToast({ message: "기획서가 완성되었습니다. 이제 필요한 부분을 복사해 사용해보세요.", variant: "success" });
      }
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      if (msg.includes("rate") || msg.includes("429") || msg.includes("limit")) {
        setToast({ message: "지금 요청이 잠시 몰렸습니다. 10초 뒤 다시 시도해주세요.", variant: "error" });
      } else {
        setToast({ message: `기획서 생성 중 오류가 발생했습니다: ${msg}`, variant: "error" });
      }
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
    setMobileHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string, e: React.SyntheticEvent) => {
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
    setMobileHistoryOpen(false);
  };

  const handleGoToNewPlan = () => {
    setPlanData(null); setIdea(""); setCurrentStep(1);
    setProgressDesign(false); setProgressCode(false); setProgressDeploy(false);
    setAiComment(null);
    setMobileHistoryOpen(false);
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
      const json = (await res.json()) as ChatApiResponse<unknown>;
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "AI 요청에 실패했습니다.");
      }
      if (toolType === "error") setErrorResult(json.data as ErrorGuideData);
      if (toolType === "prompt") setRefinerResult(json.data as PromptCoachData);
      if (toolType === "mock") {
        const mockData = json.data as { jsonCode?: string };
        setMockResult(mockData.jsonCode || JSON.stringify(json.data, null, 2));
      }
      if (toolType === "commit") {
        const commitData = json.data as { message?: string };
        setCommitResult(commitData.message || "chore: update project");
      }
      setToast({ message: "요청 결과가 준비되었습니다.", variant: "success" });
    } catch (e: unknown) {
      setToast({ message: getErrorMessage(e) || "도구 실행 중 오류가 발생했습니다.", variant: "error" });
    } finally {
      setErrorLoading(false); setRefinerLoading(false); setMockLoading(false); setCommitLoading(false);
    }
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
      const json = (await res.json()) as ChatApiResponse<string>;
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

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const triggerCopy = async (text?: string, successMessage = "복사되었습니다.") => {
    if (!text) {
      setToast({ message: "복사할 내용이 아직 준비되지 않았습니다.", variant: "error" });
      return;
    }

    try {
      await copyToClipboard(text);
      setCopiedText(text);
      setToast({ message: successMessage, variant: "success" });
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setToast({ message: "클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.", variant: "error" });
    }
  };

  const handleDownloadPDF = async () => {
  if (!reportRef.current) return;

  setPdfDownloading(true);

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageMargin = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - pageMargin * 2;
    const contentHeight = pageHeight - pageMargin * 2;

    const reportElement = reportRef.current;

    const blocks = Array.from(
      reportElement.querySelectorAll<HTMLElement>("[data-pdf-block='true']")
    );

    const targets = blocks.length > 0 ? blocks : [reportElement];

    let cursorY = pageMargin;

    const addNewPageIfNeeded = (heightMm: number) => {
      if (cursorY > pageMargin && cursorY + heightMm > pageHeight - pageMargin) {
        doc.addPage();
        cursorY = pageMargin;
      }
    };

    for (const target of targets) {
      const originalOverflow = target.style.overflow;
      const originalHeight = target.style.height;
      const originalMaxHeight = target.style.maxHeight;

      target.style.overflow = "visible";
      target.style.height = "auto";
      target.style.maxHeight = "none";

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: target.scrollWidth,
        height: target.scrollHeight + 24,
        windowWidth: Math.max(reportElement.scrollWidth, target.scrollWidth),
        windowHeight: Math.max(reportElement.scrollHeight, target.scrollHeight + 300),
        onclone: (clonedDocument) => {
          const clonedBody = clonedDocument.body;
          clonedBody.style.fontFamily =
            `"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", Arial, sans-serif`;

          clonedDocument.querySelectorAll<HTMLElement>("*").forEach((element) => {
            element.style.boxSizing = "border-box";
            element.style.wordBreak = "keep-all";
            element.style.overflowWrap = "anywhere";
            element.style.textRendering = "geometricPrecision";
          });

          clonedDocument.querySelectorAll<HTMLElement>("p, li, span, strong, pre").forEach((element) => {
            element.style.lineHeight = "1.9";
          });

          clonedDocument.querySelectorAll<HTMLElement>("pre").forEach((element) => {
            element.style.whiteSpace = "pre-wrap";
            element.style.wordBreak = "break-word";
            element.style.overflow = "visible";
            element.style.maxHeight = "none";
          });
        },
      });

      target.style.overflow = originalOverflow;
      target.style.height = originalHeight;
      target.style.maxHeight = originalMaxHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const blockHeightMm = (canvas.height * contentWidth) / canvas.width;

      if (blockHeightMm <= contentHeight) {
        addNewPageIfNeeded(blockHeightMm);

        doc.addImage(
          canvas.toDataURL("image/png", 1),
          "PNG",
          pageMargin,
          cursorY,
          contentWidth,
          blockHeightMm,
          undefined,
          "FAST"
        );

        cursorY += blockHeightMm + 5;
        continue;
      }

      const pxPerMm = canvas.width / contentWidth;
      const safeSliceHeightPx = Math.floor((contentHeight - 6) * pxPerMm);
      const overlapPx = 28;

      let sourceY = 0;

      while (sourceY < canvas.height) {
        const currentSliceHeight = Math.min(
          safeSliceHeightPx,
          canvas.height - sourceY
        );

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeight + 24;

        const context = pageCanvas.getContext("2d");

        if (!context) {
          throw new Error("PDF 이미지를 준비하지 못했습니다.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        if (cursorY > pageMargin) {
          doc.addPage();
          cursorY = pageMargin;
        }

        const sliceHeightMm = (pageCanvas.height * contentWidth) / pageCanvas.width;

        doc.addImage(
          pageCanvas.toDataURL("image/png", 1),
          "PNG",
          pageMargin,
          cursorY,
          contentWidth,
          sliceHeightMm,
          undefined,
          "FAST"
        );

        sourceY += Math.max(currentSliceHeight - overlapPx, currentSliceHeight);

        if (sourceY < canvas.height) {
          doc.addPage();
          cursorY = pageMargin;
        }
      }
    }

    doc.save("VIBE_하루만에_실현하는_기획서.pdf");
    setToast({ message: "PDF 저장이 완료되었습니다.", variant: "success" });
  } catch (error) {
    console.error(error);
    setToast({
      message:
        "PDF 생성 중 오류가 발생했습니다. 글씨가 잘리면 브라우저 인쇄 기능도 함께 확인해주세요.",
      variant: "error",
    });
  } finally {
    setPdfDownloading(false);
  }
};

  const totalChecked = [
    planData ? true : false,
    progressDesign,
    progressCode,
    progressDeploy,
  ].filter(Boolean).length;

  const progressPercent = Math.round((totalChecked / 4) * 100);

  const toolPrompts = planData ? buildToolPrompts(planData) : [];
  const premiumStep3Prompts = planData ? buildPremiumStep3Prompts(planData) : null;
  const presentationSummary = planData
    ? buildPresentationSummary(planData)
    : null;

  return (
    <main className={`relative min-h-screen antialiased transition-colors duration-300 ${isDark ? "bg-[#0a0a16] text-white" : "bg-slate-50 text-slate-900"}`}>

      {toast && (
        <StatusToast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          isDark={isDark}
        />
      )}

      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -right-20 bottom-20 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        </div>
      )}

      {/* 네비 */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${isDark ? "border-white/5 bg-white/5" : "border-slate-200 bg-white/90"}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="text-lg font-black tracking-tighter bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent hover:opacity-80 transition">
              VIBE PROJECT
            </Link>
            <Link href="/learn" className={`hidden text-xs font-bold px-3 py-1.5 rounded-xl transition sm:inline-flex ${isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              학습 센터
            </Link>
            <Link
              href="/today-route"
              className={`hidden rounded-xl px-3 py-1.5 text-xs font-bold transition lg:inline-flex ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              오늘 완성 루트
            </Link>

            <Link
              href="/error-helper"
              className={`hidden rounded-xl px-3 py-1.5 text-xs font-bold transition lg:inline-flex ${
                isDark
                  ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              에러 번역기
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className={`flex rounded-xl border p-0.5 text-[11px] font-bold sm:text-xs ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" aria-label="천사멘토 말투" onClick={() => setMentorTone("kind")} className={`px-2 py-1 rounded-lg transition ${mentorTone === "kind" ? "bg-blue-500 text-white" : isDark ? "text-slate-400" : "text-slate-500"}`}>천사멘토</button>
              <button type="button" aria-label="츤데레 선배 말투" onClick={() => setMentorTone("tsundere")} className={`px-2 py-1 rounded-lg transition ${mentorTone === "tsundere" ? "bg-amber-600 text-white" : isDark ? "text-slate-400" : "text-slate-500"}`}>츤데레 선배</button>
            </div>
            <div className={`flex rounded-full border p-0.5 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <button type="button" aria-label="라이트 모드" onClick={() => handleThemeChange("light")} className={`p-1.5 rounded-full transition ${!isDark ? "bg-white shadow-sm text-blue-600" : "text-slate-400"}`}><SunIcon /></button>
              <button type="button" aria-label="다크 모드" onClick={() => handleThemeChange("dark")} className={`p-1.5 rounded-full transition ${isDark ? "bg-white/10 shadow-sm text-violet-400" : "text-slate-400"}`}><MoonIcon /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`mx-auto max-w-7xl border-b px-4 py-3 md:hidden ${isDark ? "border-white/5 bg-[#0d0d1f]" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileHistoryOpen(true)}
            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${isDark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}
          >
            기획 보관함 <span className="text-blue-500">{historyList.length}</span>
          </button>
          <button
            type="button"
            onClick={handleGoToNewPlan}
            className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white"
          >
            새 기획
          </button>
        </div>
      </div>

      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="기획 보관함">
          <button
            type="button"
            aria-label="기획 보관함 닫기"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className={`absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-3xl border-t p-4 shadow-2xl ${isDark ? "border-white/10 bg-[#0d0d1f]" : "border-slate-200 bg-white"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black">저장한 기획안</h2>
              <button
                type="button"
                onClick={() => setMobileHistoryOpen(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}
              >
                닫기
              </button>
            </div>
            <HistoryArchive
              historyList={historyList}
              selectedId={planData?.id}
              activeMenuId={activeMenuId}
              isDark={isDark}
              onNewPlan={handleGoToNewPlan}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteHistoryItem}
              onToggleMenu={setActiveMenuId}
            />
          </div>
        </div>
      )}

      <div className="flex mx-auto max-w-7xl min-h-[calc(100vh-69px)]">

        {/* 사이드바 */}
        <aside className={`w-64 border-r shrink-0 hidden md:block p-4 overflow-y-auto space-y-4 ${isDark ? "border-white/5 bg-[#0d0d1f]" : "border-slate-200 bg-white"}`}>
          <HistoryArchive
            historyList={historyList}
            selectedId={planData?.id}
            activeMenuId={activeMenuId}
            isDark={isDark}
            onNewPlan={handleGoToNewPlan}
            onSelect={handleSelectHistoryItem}
            onDelete={handleDeleteHistoryItem}
            onToggleMenu={setActiveMenuId}
          />
        </aside>

        {/* 메인 */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* 진척도 */}
          {planData && (
            <div className={`border-b text-xs py-2.5 px-6 transition-colors ${isDark ? "bg-blue-950/20 border-white/5" : "bg-blue-50 border-slate-200"}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold">
                  <span>앱 빌드 완성도:</span>
                  <div className={`w-24 h-2.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-blue-500 font-black">{progressPercent}%</span>
                </div>
                <div className={`flex flex-wrap gap-4 items-center font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {[
                    { label: "설계도 완성", checked: true, readOnly: true, onChange: undefined },
                    { label: "v0 디자인 적용", checked: progressDesign, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressDesign(e.target.checked) },
                    { label: "Cursor 기능 연결", checked: progressCode, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressCode(e.target.checked) },
                    { label: "Vercel 배포", checked: progressDeploy, readOnly: false, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProgressDeploy(e.target.checked) },
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
          <div className={`border-b sticky top-[58px] z-40 transition-colors md:top-[69px] ${isDark ? "border-white/5 bg-[#0f0f23]" : "border-slate-200 bg-white shadow-sm"}`}>
            <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 md:px-6 md:py-3.5">
              {[
                { step: 1, label: "1. 아이디어 입력" },
                { step: 2, label: "2. 기획서 확인" },
                { step: 3, label: "3. 복사 프롬프트" },
                { step: 4, label: "4. 개발 도움 도구" },
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
          <div className="relative z-10 flex-1 px-4 py-8 md:px-6 md:py-10">

            {/* 로딩 */}
            {loading && (
              <div className="my-20 flex flex-col items-center justify-center gap-6 text-center px-4">
                <div className="relative">
                  <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
                    🚀
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                    {mentorTone === "kind"
                      ? "천사멘토가 기획서를 정리하고 있어요"
                      : "츤데레 선배가 구현 범위를 점검하고 있어요"}
                  </h3>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {mentorTone === "kind"
                      ? "비전공자도 바로 복사해서 쓸 수 있도록 단계별로 나누는 중입니다."
                      : "한 번에 욕심내지 않도록 첫 버전 기준으로 현실적인 범위를 잡는 중입니다."}
                  </p>
                </div>
                <LoadingSteps isDark={isDark} />
              </div>
            )}

            {/* ── STEP 1 ── */}
            {!loading && currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">아이디어를 실행 가능한 기획서로 바꿔보세요</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>서비스 형태와 수익 모델을 고른 뒤, 만들고 싶은 내용을 편하게 적어주세요.</p>
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
                  <div className="mt-1 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>{idea.length < 10 ? `${10 - idea.length}자 더 입력하면 시작할 수 있어요.` : "준비되었습니다. 기획서를 생성해보세요."}</span>
                    <button type="button" onClick={handleMainSubmit} disabled={idea.trim().length < 10 || loading}
                      className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto">
                      기획서 생성하기 →
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <span className="text-xs font-bold text-slate-400 block mb-3 text-center">어떻게 적을지 막막하다면 예시를 눌러 시작해보세요.</span>
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
                  <span className="text-xs font-black text-slate-400 block mb-3">먼저 사용해본 학생들의 짧은 후기</span>
                  <div className="grid gap-3 md:grid-cols-3">
                    {reviewFeeds.map((feed, i) => (
                      <div key={i} className={`p-3.5 border rounded-xl text-xs ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"}`}>
                        <span className="font-bold text-blue-500 block mb-1">{feed.major}</span>
                        <p className={`leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>&ldquo;{feed.text}&rdquo;</p>
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
                    <h1 className="text-2xl font-black md:text-3xl tracking-tight">2. 기획 요건 확인</h1>
                    <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      선택한 설정: <span className="text-blue-500 font-bold">{selectedPlatform}</span> | <span className="text-violet-500 font-bold">{selectedBM}</span>
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button type="button" onClick={handleDownloadPDF} disabled={pdfDownloading}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${isDark ? "bg-white text-slate-900 hover:opacity-90" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                      {pdfDownloading ? "PDF 저장 중..." : "PDF 저장"}
                    </button>
                  </div>
                </div>

                {planData.summary && (
                  <div className={`p-4 rounded-2xl border ${mentorTone === "kind" ? isDark ? "bg-[#12122c] border-blue-500/20" : "bg-blue-50 border-blue-200" : isDark ? "bg-[#1a1424] border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
                    <span className={`text-xs font-black block mb-1.5 ${mentorTone === "kind" ? isDark ? "text-blue-400" : "text-blue-600" : isDark ? "text-amber-400" : "text-amber-600"}`}>
                      {mentorTips[mentorTone].name}의 요약
                    </span>
                    <p className={`text-xs leading-relaxed font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{planData.summary}</p>
                  </div>
                )}

                <MentorTipBox tone={mentorTone} isDark={isDark} />

                <div className={`flex border-b gap-2 overflow-x-auto ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  {step2Tabs.map((tab) => (
                    <button key={tab.id} type="button" onClick={() => setStep2Tab(tab.id)}
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
                                    {step2Tab === "presentation" && presentationSummary && (
                    <div className="space-y-4">
                      <div className={`rounded-2xl border p-4 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-100 bg-emerald-50"}`}>
                        <span className={`mb-2 block text-xs font-black ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                          🎤 발표/과제용 요약
                        </span>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          팀 회의록, 과제 제출 자료, 발표 자료에 바로 옮겨 적기 좋게 정리했습니다.
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { label: "서비스명", value: presentationSummary.serviceName },
                          { label: "한 줄 소개", value: presentationSummary.oneLiner },
                          { label: "문제 상황", value: presentationSummary.problem },
                          { label: "대상 사용자", value: presentationSummary.target },
                          { label: "기대 효과", value: presentationSummary.expectedEffect },
                          { label: "향후 발전 방향", value: presentationSummary.futurePlan },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`rounded-xl border p-4 ${
                              isDark
                                ? "border-white/10 bg-black/20"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <span className={`mb-1.5 block text-[10px] font-black uppercase tracking-wider ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                              {item.label}
                            </span>
                            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
                        <span className={`mb-3 block text-[10px] font-black uppercase tracking-wider ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                          핵심 기능 3개
                        </span>
                        <ul className="space-y-2">
                          {presentationSummary.mainFeatures.map((feature, index) => (
                            <li
                              key={feature}
                              className={`flex gap-2 text-xs leading-relaxed ${
                                isDark ? "text-slate-300" : "text-slate-600"
                              }`}
                            >
                              <span className="font-black text-emerald-500">{index + 1}.</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`rounded-xl border p-4 ${isDark ? "border-emerald-500/20 bg-black/20" : "border-emerald-100 bg-white"}`}>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                            1분 발표 대본
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              triggerCopy(
                                presentationSummary.oneMinuteScript,
                                "발표 대본이 복사되었습니다."
                              )
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            대본 복사
                          </button>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {presentationSummary.oneMinuteScript}
                        </p>
                      </div>
                    </div>
                  )}
                  {step2Tab === "tips" && (
                    <div className="space-y-4 text-xs">
                      <h3 className="text-sm font-black text-amber-500">비전공자 대학생을 위한 0원 배포 가이드</h3>
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
                        <strong>팁:</strong> Cursor AI 에디터에게 <strong>&ldquo;이 프로젝트를 Vercel에 무료로 올리는 구조로 세팅해줘&rdquo;</strong> 라고 요청하면 배포 설정까지 함께 점검할 수 있습니다.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center">
                  <button type="button" onClick={handleGoToNewPlan} className={`text-xs font-bold underline ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>← 새 기획 작성화면 이동</button>
                  <button type="button" onClick={() => setCurrentStep(3)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                    Step 03 복사 프롬프트 확인 →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {!loading && planData && currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">3. AI 도구용 복사 프롬프트</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    어디에 붙여넣어야 하는지부터, 에러를 줄이는 순서까지 함께 정리했습니다.
                  </p>
                </div>

                <div className={`flex border-b gap-2 overflow-x-auto ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <button type="button" onClick={() => setStep3Tab("ui")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ui" ? "border-blue-500 text-blue-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>1단계: UI 초안</button>
                  <button type="button" onClick={() => setStep3Tab("ide")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "ide" ? "border-violet-500 text-violet-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>2단계: 기능 연결</button>
                  <button type="button" onClick={() => setStep3Tab("db")} className={`px-4 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${step3Tab === "db" ? "border-emerald-500 text-emerald-500" : isDark ? "border-transparent text-slate-400" : "border-transparent text-slate-400 hover:text-slate-700"}`}>3단계: 데이터 설계</button>
                                    <button
                    type="button"
                    onClick={() => setStep3Tab("tools")}
                    className={`whitespace-nowrap border-b-2 px-4 py-2 text-xs font-bold transition ${
                      step3Tab === "tools"
                        ? "border-pink-500 text-pink-500"
                        : isDark
                        ? "border-transparent text-slate-400"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    4단계: 도구별 프롬프트
                  </button>
                </div>

                <MentorTipBox tone={mentorTone} isDark={isDark} />

                {step3Tab !== "tools" && (
                  <ToolGuidePanel guide={step3Guides[step3Tab]} isDark={isDark} />
                )}

                <div className={`p-5 rounded-2xl border min-h-[200px] ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                  {step3Tab === "ui" && (
                    <div className="space-y-4">
                      <div className="text-[11px] text-blue-500 font-bold">먼저 1번 프롬프트로 화면 골격을 만들고, 결과가 뜬 뒤 2번 프롬프트로 완성도를 올리세요.</div>
                      {(premiumStep3Prompts?.ui || planData.prompts?.ui || []).map((p, i) => (
                        <div key={i} className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-start ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <div className="min-w-0 flex-1">
                            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-blue-500">UI 프롬프트 {i + 1}</span>
                            <p className={`whitespace-pre-line text-xs leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
                          </div>
                          <button type="button" aria-label={`UI 프롬프트 ${i + 1} 복사`} onClick={() => triggerCopy(p)} className={`shrink-0 rounded border px-2.5 py-1.5 text-xs font-bold transition ${isDark ? "bg-neutral-800 border-white/10 text-blue-400" : "bg-white border-slate-200 text-blue-500 hover:bg-blue-50"}`}>
                            {copiedText === p ? "복사 완료" : "프롬프트 복사"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {step3Tab === "ide" && (
                    <div className="space-y-4">
                      <div className="text-[11px] text-violet-500 font-bold">Cursor에서는 파일을 먼저 읽게 한 뒤, 아래 프롬프트를 한 번에 하나씩 적용하면 충돌이 줄어듭니다.</div>
                      {(premiumStep3Prompts?.ide || planData.prompts?.ide || []).map((p, i) => (
                        <div key={i} className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-start ${isDark ? "bg-black/20 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <div className="min-w-0 flex-1">
                            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-violet-500">Cursor 프롬프트 {i + 1}</span>
                            <p className={`whitespace-pre-line text-xs leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>{p}</p>
                          </div>
                          <button type="button" aria-label={`Cursor 프롬프트 ${i + 1} 복사`} onClick={() => triggerCopy(p)} className={`shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded transition ${isDark ? "bg-neutral-800 border-white/10 text-violet-400" : "bg-white border-slate-200 text-violet-500 hover:bg-violet-50"}`}>
                            {copiedText === p ? "복사 완료" : "프롬프트 복사"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {step3Tab === "db" && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-emerald-500 font-bold mb-2">Supabase SQL Editor의 New query 화면에 붙여넣을 데이터 설계 초안입니다.</div>
                      <div className="flex flex-col justify-between gap-4 overflow-x-auto rounded-xl border bg-slate-900 p-4 font-mono text-xs text-emerald-400 sm:flex-row sm:items-start">
                        <pre className="whitespace-pre-wrap flex-1">
                          {premiumStep3Prompts?.db || planData.prompts?.db || "정보를 준비하고 있습니다."}
                        </pre>
                        <button type="button" aria-label="Supabase SQL 전체 복사" onClick={() =>
                          triggerCopy(
                          premiumStep3Prompts?.db || planData.prompts?.db,
                          "Supabase DB 설계 프롬프트가 복사되었습니다."
                          )
                        } className="shrink-0 text-xs px-2.5 py-1.5 font-bold border rounded bg-slate-800 text-white">
                          {copiedText === (premiumStep3Prompts?.db || planData.prompts?.db)
                            ? "복사 완료!"
                            : "프롬프트 전체 복사"}
                        </button>
                      </div>
                    </div>
                  )}
                                    {step3Tab === "tools" && (
                    <div className="space-y-4">
                      <div className="text-[11px] font-bold text-pink-500">
                        v0, Lovable, Cursor, Replit, ChatGPT에 바로 붙여넣을 수 있는 맞춤 프롬프트입니다.
                      </div>

                      {toolPrompts.map((item) => (
                        <div
                          key={item.tool}
                          className={`rounded-xl border p-4 ${
                            isDark
                              ? "border-white/10 bg-black/20"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                                  isDark
                                    ? "bg-white/10 text-white"
                                    : "bg-white text-slate-700"
                                }`}>
                                  {item.tool}
                                </span>
                                <span className="text-[10px] font-black text-pink-500">
                                  {item.badge}
                                </span>
                              </div>
                              <p className={`mt-2 text-xs leading-relaxed ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}>
                                {item.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                triggerCopy(
                                  item.prompt,
                                  `${item.tool}용 프롬프트가 복사되었습니다.`
                                )
                              }
                              className="shrink-0 rounded-lg bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700"
                            >
                              복사
                            </button>
                          </div>

                          <pre className={`max-h-60 overflow-auto whitespace-pre-wrap rounded-xl p-4 text-xs leading-relaxed ${
                            isDark
                              ? "bg-neutral-950 text-slate-300"
                              : "bg-white text-slate-700"
                          }`}>
                            {item.prompt}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border border-amber-500/20 text-xs leading-relaxed ${isDark ? "bg-amber-500/5 text-white/60" : "bg-amber-50 text-slate-600"}`}>
                  <span className="font-bold text-amber-600 block mb-1">복사 전 확인할 점</span>
                  AI 도구 화면에 빨간 오류가 아니라{" "}
                  <strong className="text-amber-600">노란색 느낌표 경고(Warning)</strong>
                  가 뜬다면 우선 실행 결과를 확인하세요. 실제 오류인지, 단순 안내인지 구분하는 것이 중요합니다.
                </div>

                <div className="flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => setCurrentStep(2)} className={`text-xs font-bold underline ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>← 기획서 다시보기</button>
                  <button type="button" onClick={() => setCurrentStep(4)} className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 shadow-md">Step 04 개발 도움 도구로 이동 →</button>
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {!loading && planData && currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h1 className="text-2xl font-black md:text-3xl tracking-tight">4. 개발 도움 도구</h1>
                  <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    에러를 해석하고, 프롬프트를 개선하고, 샘플 데이터와 커밋 메시지를 준비하세요. 현재 멘토: <span className="text-amber-500 font-bold">{mentorTips[mentorTone].name}</span>
                  </p>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 border-b pb-2 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                  {step4Tools.map((tool) => (
                    <button key={tool.id} type="button" onClick={() => setStep4Tool(tool.id)}
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
                        <h3 className="text-xs font-black mb-1 text-red-500">화면에 뜬 영어 에러 문장을 그대로 붙여넣어 주세요</h3>
                        <textarea value={errorInput} onChange={(e) => setErrorInput(e.target.value)}
                          placeholder="예) TypeError: Cannot read properties of undefined..." rows={3}
                          className={`w-full text-xs font-mono p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("error", errorInput)} disabled={errorLoading || !errorInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {errorLoading ? "에러 분석 중..." : "에러 분석하기"}
                        </button>
                      </div>
                      {errorResult && (
                        <div className={`p-4 rounded-xl text-xs space-y-3 border ${isDark ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                          <div>
                            <strong className="text-red-500 font-bold block">원인</strong>
                            <p className="mt-1 leading-relaxed">{errorResult.cause}</p>
                          </div>
                          <div>
                            <strong className="text-blue-500 font-bold block">쉬운 설명</strong>
                            <p className="mt-1 leading-relaxed">{errorResult.explanation}</p>
                          </div>
                          <div>
                            <strong className="text-emerald-500 font-bold block">해결 단계</strong>
                            <p className="mt-1 leading-relaxed">{errorResult.solution}</p>
                          </div>
                          <div className={`flex flex-col gap-2 border-t pt-2 sm:flex-row sm:items-start sm:justify-between ${isDark ? "border-white/10" : "border-slate-200"}`}>
                            <span className="text-[10px] text-slate-400">Cursor용 복붙 프롬프트: <strong>{errorResult.prompt}</strong></span>
                            <button type="button" onClick={() => triggerCopy(errorResult.prompt)} className="shrink-0 font-bold text-blue-500">{copiedText === errorResult.prompt ? "복사 완료" : "프롬프트 복사"}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step4Tool === "refiner" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black mb-1">러프한 질문을 AI 코딩 도구가 이해하기 쉬운 프롬프트로 다듬습니다</h3>
                        <textarea value={refinerInput} onChange={(e) => setRefinerInput(e.target.value)}
                          placeholder="예) 로그인 화면 하나 이쁘게 리액트로 짜줘" rows={3}
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-violet-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("prompt", refinerInput)} disabled={refinerLoading || !refinerInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {refinerLoading ? "프롬프트 개선 중..." : "프롬프트 개선하기"}
                        </button>
                      </div>
                      {refinerResult && (
                        <div className="grid gap-3 text-xs md:grid-cols-2">
                          <div className={`p-3 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                            <span className="text-slate-400 block mb-1">원본</span>{refinerResult.original}
                          </div>
                          <div className="relative rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 pb-10">
                            <span className="text-violet-500 font-bold block mb-1">개선본</span>{refinerResult.improved}
                            <button type="button" onClick={() => triggerCopy(refinerResult.improved)} className="absolute bottom-2 right-2 rounded bg-neutral-800 px-2 py-1 text-[10px] text-white">
                              {copiedText === refinerResult.improved ? "복사 완료" : "개선본 복사"}
                            </button>
                          </div>
                          <div className={`p-3 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                            <span className="text-slate-400 block mb-1">개선 이유</span>
                            <ul className="list-disc space-y-1 pl-4">{refinerResult.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                          </div>
                          <div className={`p-3 border rounded-xl ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                            <span className="text-slate-400 block mb-1">작성 팁</span>
                            <ul className="list-disc space-y-1 pl-4">{refinerResult.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step4Tool === "mock" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black mb-1">목업 화면에 넣을 한국어 샘플 데이터를 만듭니다</h3>
                        <input type="text" value={mockInput} onChange={(e) => setMockInput(e.target.value)}
                          placeholder="예) 대학생 중고 물품 대여 리스트 5개"
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("mock", mockInput || idea)} disabled={mockLoading}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {mockLoading ? "샘플 데이터 생성 중..." : "샘플 데이터 만들기"}
                        </button>
                      </div>
                      {mockResult && (
                        <div className="p-3 border rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs relative overflow-x-auto">
                          <pre className="whitespace-pre-wrap max-h-60 overflow-y-auto">{mockResult}</pre>
                          <button type="button" onClick={() => triggerCopy(mockResult)} className="absolute top-2 right-2 text-[10px] bg-slate-800 text-white px-2 py-1 rounded">
                            {copiedText === mockResult ? "복사 완료" : "전체 복사"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {step4Tool === "commit" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black mb-1">완료한 작업을 한글로 적으면 제출용 커밋 메시지로 바꿉니다</h3>
                        <input type="text" value={commitInput} onChange={(e) => setCommitInput(e.target.value)}
                          placeholder="예) 메인 페이지에 배너 이미지 넣기 성공"
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? "bg-neutral-900 border-white/10 text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"}`} />
                        <button type="button" onClick={() => handleSubToolSubmit("commit", commitInput)} disabled={commitLoading || !commitInput.trim()}
                          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed">
                          {commitLoading ? "커밋 메시지 작성 중..." : "커밋 메시지 만들기"}
                        </button>
                      </div>
                      {commitResult && (
                        <div className={`p-3 border rounded-xl flex justify-between items-center text-xs font-mono ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                          <span className="text-blue-500 font-bold">{commitResult}</span>
                          <button type="button" onClick={() => triggerCopy(commitResult)} className={`font-bold text-[11px] ${isDark ? "text-slate-400" : "text-slate-500 hover:text-slate-700"}`}>
                            {copiedText === commitResult ? "복사 완료" : "복사"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 기획서 없을 때 빈 상태 화면 */}
            {!loading && !planData && currentStep !== 1 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="text-6xl">🗺️</span>
                <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-800"}`}>아직 기획서가 없어요!</h3>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>먼저 Step 1에서 아이디어를 입력하고 설계도를 뽑아보세요!</p>
                <button onClick={() => setCurrentStep(1)} className="mt-2 px-6 py-3 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 transition">
                  💡 아이디어 입력하러 가기
                </button>
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div
            ref={reportRef}
            style={{
              width: "860px",
              boxSizing: "border-box",
              padding: "56px 52px",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              fontFamily:
                '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", Arial, sans-serif',
              lineHeight: 1.85,
              wordBreak: "keep-all",
              overflowWrap: "anywhere",
            }}
          >
            <div data-pdf-block="true" style={{ borderBottom: "4px solid #2563eb", paddingBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", fontSize: "11px", fontWeight: 700, color: "#2563eb", letterSpacing: "0.04em" }}>
                <span>VIBE PROJECT PLANNING REPORT</span>
                <span>{planData.timestamp}</span>
              </div>
              <h1 style={{ fontSize: "27px", lineHeight: 1.25, fontWeight: 700, color: "#0f172a", marginTop: "12px", marginBottom: "12px" }}>
                {planData.idea}
              </h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px", color: "#475569" }}>
                <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}><strong style={{ fontWeight: 700 }}>플랫폼</strong><br />{selectedPlatform}</div>
                <div style={{ padding: "10px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}><strong style={{ fontWeight: 700 }}>수익 모델</strong><br />{selectedBM}</div>
              </div>
            </div>

            <section data-pdf-block="true" style={{ pageBreakInside: "avoid" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", marginBottom: "8px" }}>0. 한 줄 요약</h2>
              <div style={{ padding: "14px", backgroundColor: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", fontSize: "12px", lineHeight: 1.75, color: "#1e3a8a" }}>
                {planData.summary}
              </div>
            </section>

            <section data-pdf-block="true" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", pageBreakInside: "avoid" }}>
              <div style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#dc2626", marginBottom: "8px" }}>1. 해결할 문제</h2>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{planData.problem}</p>
              </div>
              <div style={{ padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>2. 첫 사용자</h2>
                <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.7, color: "#334155" }}>{planData.target}</p>
              </div>
            </section>

            <section data-pdf-block="true" style={{ pageBreakInside: "avoid" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", marginBottom: "10px" }}>3. 사용자가 실제로 하는 일</h2>
              <div style={{ display: "grid", gap: "8px" }}>
                {planData.userStories?.map((story, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: "8px", alignItems: "start", padding: "9px 10px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "11px", lineHeight: 1.6 }}>
                    <strong style={{ color: "#2563eb", fontWeight: 700 }}>{idx + 1}</strong>
                    <span>{story}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div data-pdf-block="true">
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", marginBottom: "10px" }}>4. 첫 버전 핵심 기능과 검수 기준</h2>
              </div>
              <div style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                {planData.features?.map((feature, idx) => (
                  <div key={idx} data-pdf-block="true" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", pageBreakInside: "avoid" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ padding: "3px 7px", borderRadius: "999px", backgroundColor: "#dbeafe", color: "#1d4ed8", fontSize: "10px", fontWeight: 700 }}>기능 {idx + 1}</span>
                      <strong style={{ fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>{feature.name}</strong>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", lineHeight: 1.65, color: "#475569" }}>{feature.desc}</p>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "11px", lineHeight: 1.65, color: "#334155" }}>
                      {feature.criteria?.map((criteria, criteriaIdx) => <li key={criteriaIdx}>{criteria}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section data-pdf-block="true">
              <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", marginBottom: "10px" }}>5. 필요한 화면 구성</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {planData.screens?.map((screen, idx) => (
                  <div key={idx} style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", pageBreakInside: "avoid" }}>
                    <strong style={{ display: "block", marginBottom: "5px", fontSize: "12px", color: "#0f172a", fontWeight: 700 }}>{idx + 1}. {screen.name}</strong>
                    <p style={{ margin: 0, fontSize: "11px", lineHeight: 1.6, color: "#475569" }}>{screen.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div data-pdf-block="true">
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb", marginBottom: "10px" }}>6. AI 코딩 도구에 붙여넣을 프롬프트</h2>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <div data-pdf-block="true" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", pageBreakInside: "avoid" }}>
                  <strong style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#1d4ed8", fontWeight: 700 }}>v0.dev / Bolt.new용 UI 프롬프트</strong>
                  {planData.prompts.ui.map((prompt, idx) => (
                    <p key={idx} style={{ margin: idx === 0 ? "0 0 8px" : "8px 0 0", fontSize: "10.5px", lineHeight: 1.6, color: "#1e3a8a" }}>{idx + 1}. {prompt}</p>
                  ))}
                </div>
                <div data-pdf-block="true" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #ddd6fe", backgroundColor: "#f5f3ff", pageBreakInside: "avoid" }}>
                  <strong style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#6d28d9", fontWeight: 700 }}>Cursor용 기능 연결 프롬프트</strong>
                  {planData.prompts.ide.map((prompt, idx) => (
                    <p key={idx} style={{ margin: idx === 0 ? "0 0 8px" : "8px 0 0", fontSize: "10.5px", lineHeight: 1.6, color: "#4c1d95" }}>{idx + 1}. {prompt}</p>
                  ))}
                </div>
                <div data-pdf-block="true" style={{ padding: "12px", borderRadius: "12px", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", pageBreakInside: "avoid" }}>
                  <strong style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#15803d", fontWeight: 700 }}>Supabase SQL 초안</strong>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "9.5px", lineHeight: 1.5, color: "#14532d", fontFamily: "Menlo, Consolas, monospace" }}>{planData.prompts.db}</pre>
                </div>
              </div>
            </section>

            <div data-pdf-block="true" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", display: "flex", justifyContent: "space-between", gap: "20px", fontSize: "10px", color: "#64748b" }}>
              <span>발표/제출용 요약본입니다. 실제 개발 전 개인정보, 결제, 학교 정책 관련 조건은 별도로 확인하세요.</span>
              <span>VIBE PROJECT</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

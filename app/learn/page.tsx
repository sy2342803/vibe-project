"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

interface Lesson {
  icon: string;
  title: string;
  desc: string;
  content: string;
}

// ── 뱃지/칭호 시스템 ──
interface BadgeInfo {
  title: string;
  emoji: string;
  minLessons: number;
  color: string;
  darkColor: string;
}

const BADGES: BadgeInfo[] = [
  { title: "새싹 메이커", emoji: "🌱", minLessons: 0, color: "text-emerald-600 bg-emerald-50 border-emerald-200", darkColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  { title: "루키 빌더", emoji: "⚡", minLessons: 4, color: "text-blue-600 bg-blue-50 border-blue-200", darkColor: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  { title: "프로 바이버", emoji: "🚀", minLessons: 8, color: "text-violet-600 bg-violet-50 border-violet-200", darkColor: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  { title: "엘리트 크래프터", emoji: "💎", minLessons: 12, color: "text-amber-600 bg-amber-50 border-amber-200", darkColor: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { title: "바이브 마스터", emoji: "👑", minLessons: 16, color: "text-rose-600 bg-rose-50 border-rose-200", darkColor: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
];

function getBadge(completedCount: number): BadgeInfo {
  let badge = BADGES[0];
  for (const b of BADGES) {
    if (completedCount >= b.minLessons) badge = b;
  }
  return badge;
}

// ── 커리큘럼 ──
const CURRICULUM: Lesson[][] = [
  [
    {
      icon: "🎵", title: "바이브코딩이란?", desc: "AI 시대의 새로운 코딩 철학과 마인드셋",
      content: `<h3 class="lesson-title">바이브코딩이란 무엇인가?</h3><p>바이브코딩(Vibe Coding)은 <strong>Andrej Karpathy</strong>가 2025년 제안한 개념으로, AI를 활용해 코드를 직관적으로 생성하는 방식입니다.</p><p>전통적인 코딩이 문법과 알고리즘을 완벽히 이해하며 한 줄씩 짜는 것이라면, 바이브코딩은 <strong>"지금 이 느낌(vibe)"</strong>을 AI에게 전달해 코드를 만들어내는 것입니다.</p><div class="tip-box">💡 <strong>핵심 개념</strong><br/>완벽한 코드를 직접 쓰는 것보다, 내가 원하는 것을 잘 설명해서 AI가 좋은 코드를 생성하도록 하는 것이 더 효과적입니다.</div><p>이것은 개발자의 역할 변화를 의미합니다. 이제 개발자는 <strong>코드 작가</strong>에서 <strong>코드 감독</strong>으로 진화합니다.</p>`,
    },
    {
      icon: "🧠", title: "AI와 대화하는 법", desc: "효과적인 프롬프트 작성의 기초",
      content: `<h3 class="lesson-title">AI와 잘 대화하는 법</h3><p>바이브코딩의 핵심은 <strong>명확한 의도 전달</strong>입니다. AI는 당신의 생각을 읽지 못하므로, 원하는 것을 구체적으로 표현해야 합니다.</p><div class="tip-box">🎯 <strong>좋은 프롬프트의 3요소</strong><br/>1. 무엇을 만들고 싶은지 (목적)<br/>2. 어떻게 동작해야 하는지 (동작)<br/>3. 어떤 기술을 사용할지 (맥락)</div><div class="code-box">❌ 나쁜 프롬프트: "버튼 만들어줘"\n✅ 좋은 프롬프트: "React로 클릭하면 카운트가 올라가는 파란 버튼을 만들어줘. 카운트가 10이 되면 완료 메시지를 보여줘"</div>`,
    },
    {
      icon: "🛠️", title: "도구 세팅하기", desc: "Cursor, Claude, Copilot 선택 가이드",
      content: `<h3 class="lesson-title">바이브코딩 도구 세팅</h3><p>바이브코딩을 위한 주요 도구들을 알아봅시다.</p><div class="tip-box">🏆 <strong>추천 조합 (2025)</strong><br/>Cursor IDE + Claude = 최강 조합<br/>무료로 시작하려면: VS Code + GitHub Copilot</div><p><strong>Cursor</strong> — AI 네이티브 에디터. 코드베이스 전체를 이해하고 맥락에 맞는 코드를 생성합니다.</p><p><strong>Claude</strong> — Anthropic의 AI. 긴 코드 설명과 복잡한 로직 구현에 탁월합니다.</p><p><strong>v0.dev</strong> — UI 컴포넌트를 자연어로 생성. 빠른 프로토타이핑에 최적.</p><p><strong>Bolt.new</strong> — 풀스택 앱을 자연어로 생성. 빠른 MVP 제작에 최적.</p>`,
    },
    {
      icon: "🌊", title: "첫 번째 바이브", desc: "AI와 함께 첫 앱 만들어보기",
      content: `<h3 class="lesson-title">첫 번째 바이브코딩 경험</h3><p>이론보다 실습! 지금 당장 AI와 함께 간단한 앱을 만들어봅시다.</p><div class="tip-box">🎯 <strong>오늘의 미션</strong><br/>할 일 목록(Todo List) 앱을 AI에게만 설명해서 만들기</div><div class="code-box">"HTML, CSS, JavaScript만으로 할 일 목록 앱을 만들어줘.\n\n기능:\n- 할 일 추가 (Enter키 또는 버튼)\n- 완료 체크박스\n- 삭제 버튼\n- 완료된 항목은 취소선\n\n디자인: 깔끔하고 모던하게, 다크 테마로 만들어줘"</div><p>결과물이 마음에 들지 않으면 <strong>"조금 더 예쁘게 해줘"</strong> 처럼 자연스럽게 대화하며 수정하세요!</p>`,
    },
  ],
  [
    {
      icon: "🎨", title: "프롬프트 엔지니어링", desc: "원하는 코드를 정확히 얻는 기술",
      content: `<h3 class="lesson-title">프롬프트 엔지니어링 기초</h3><p>프롬프트 엔지니어링은 AI에게 원하는 결과를 얻기 위해 입력을 최적화하는 기술입니다.</p><div class="tip-box">⚡ <strong>5가지 핵심 기법</strong><br/>1. 역할 부여 — "시니어 React 개발자로서..."<br/>2. 예시 제공 — "이런 식으로 해줘: [예시]"<br/>3. 제약 명시 — "TypeScript만 사용해줘"<br/>4. 단계별 요청 — "먼저 구조를 잡고..."<br/>5. 반복 개선 — "좀 더 최적화해줘"</div>`,
    },
    {
      icon: "🔄", title: "반복 개선하기", desc: "AI와 함께 코드를 점진적으로 발전시키기",
      content: `<h3 class="lesson-title">반복적 개선 (Iterative Refinement)</h3><p>바이브코딩의 핵심은 <strong>완벽한 첫 결과를 기대하지 않는 것</strong>입니다.</p><div class="tip-box">🔄 <strong>바이브코딩 루프</strong><br/>생성 → 검토 → 피드백 → 개선 → 반복</div><div class="code-box">// 좋은 피드백 패턴들\n"버튼 색상을 파란색으로 바꿔줘"\n"이 함수가 너무 복잡해. 더 읽기 쉽게 리팩토링해줘"\n"에러 처리가 없어. try-catch 추가해줘"\n"모바일에서도 잘 보이게 반응형으로 수정해줘"</div>`,
    },
    {
      icon: "🐛", title: "AI로 디버깅하기", desc: "에러 메시지를 AI에게 던지는 방법",
      content: `<h3 class="lesson-title">AI 기반 디버깅</h3><p>바이브코딩에서 디버깅은 에러 메시지를 AI에게 그대로 붙여넣는 것부터 시작합니다.</p><div class="tip-box">🐛 <strong>디버깅 프롬프트 공식</strong><br/>[에러 메시지] + [해당 코드] + [무엇을 하려 했는지]</div><div class="code-box">"이 에러가 났어:\nTypeError: Cannot read properties of undefined (reading 'map')\n\ndata는 API에서 받아오는데 처음 렌더링 때 undefined야.\n어떻게 고치면 돼?"</div>`,
    },
    {
      icon: "📦", title: "코드 이해하기", desc: "AI가 생성한 코드를 내 것으로 만들기",
      content: `<h3 class="lesson-title">AI 생성 코드 이해하기</h3><p>바이브코딩의 함정 — AI가 코드를 생성해도 <strong>내가 이해하지 못하면 발전이 없습니다</strong>.</p><div class="tip-box">📚 <strong>이해를 위한 질문들</strong><br/>"이 코드가 어떻게 동작하는지 설명해줘"<br/>"여기서 왜 useEffect를 사용했어?"<br/>"이 부분을 다른 방식으로도 구현할 수 있어?"</div>`,
    },
  ],
  [
    {
      icon: "🌐", title: "API 연동하기", desc: "AI로 REST API 클라이언트 만들기",
      content: `<h3 class="lesson-title">API 연동 바이브코딩</h3><p>실제 서비스는 외부 API와 통신합니다. AI를 활용해 API 연동 코드를 빠르게 작성해봅시다.</p><div class="tip-box">🌐 <strong>API 연동 프롬프트 패턴</strong><br/>API 문서 + 원하는 기능 설명 + 에러 처리 요구</div><div class="code-box">"fetch를 사용해서 날씨 API를 호출하는\nReact 커스텀 훅을 만들어줘.\n로딩, 에러, 데이터 상태를 모두 처리해줘."</div>`,
    },
    {
      icon: "🎭", title: "컴포넌트 설계", desc: "재사용 가능한 UI를 바이브코딩으로",
      content: `<h3 class="lesson-title">컴포넌트 설계하기</h3><p>좋은 컴포넌트는 <strong>재사용 가능</strong>하고 <strong>독립적</strong>입니다.</p><div class="tip-box">🧩 <strong>재사용 컴포넌트 요청 팁</strong><br/>"Props로 커스터마이징 가능하게 만들어줘"<br/>"기본값(default props)도 설정해줘"<br/>"TypeScript로 Props 타입 정의해줘"</div>`,
    },
    {
      icon: "🗄️", title: "상태 관리하기", desc: "전역 상태를 바이브코딩으로",
      content: `<h3 class="lesson-title">상태 관리 바이브코딩</h3><p>복잡한 앱은 여러 컴포넌트가 상태를 공유해야 합니다.</p><div class="tip-box">📊 <strong>상태 관리 도구 선택 가이드</strong><br/>소규모: useState + props<br/>중규모: Zustand (바이브코딩에 최적!)<br/>대규모: Redux Toolkit</div>`,
    },
    {
      icon: "🚢", title: "배포하기", desc: "Vercel로 결과물 공개하기",
      content: `<h3 class="lesson-title">바이브코딩 결과물 배포</h3><p>만든 것을 세상에 보여줄 시간! Vercel은 바이브코딩 결과물을 배포하기 가장 쉬운 플랫폼입니다.</p><div class="tip-box">🚀 <strong>배포 체크리스트</strong><br/>✓ 환경변수 설정 (.env 파일)<br/>✓ 빌드 에러 없음 확인<br/>✓ GitHub 레포에 푸시<br/>✓ Vercel 연결 및 배포</div><div class="code-box">git add .\ngit commit -m "배포 준비 완료"\ngit push origin main\n# → Vercel 자동 배포!</div>`,
    },
  ],
  [
    {
      icon: "🤖", title: "AI 앱 만들기", desc: "LLM API를 활용한 AI 네이티브 앱",
      content: `<h3 class="lesson-title">AI 앱 바이브코딩</h3><p>이제 AI를 배우는 것을 넘어 <strong>AI가 들어간 앱</strong>을 만들어봅시다!</p><div class="tip-box">🤖 <strong>AI 앱 시작 프롬프트</strong><br/>Gemini/Claude API + 원하는 기능 + UX 요구사항</div><div class="code-box">"Gemini API를 사용해서\n코드 리뷰 도구를 만들어줘.\n사용자가 코드를 붙여넣으면\n버그 찾기, 성능 개선 제안을 해주는 웹앱"</div>`,
    },
    {
      icon: "⚡", title: "성능 최적화", desc: "AI로 병목 찾고 성능 올리기",
      content: `<h3 class="lesson-title">AI 기반 성능 최적화</h3><p>성능 문제는 찾기 어렵습니다. AI에게 코드를 분석시키면 놓친 부분을 발견할 수 있습니다.</p><div class="tip-box">⚡ <strong>최적화 분석 요청 방법</strong><br/>코드 + "성능 문제가 있을 수 있는 부분을 찾아줘"</div><div class="code-box">"이 React 앱이 느려. 성능 분석해줘:\n1. 불필요한 리렌더링이 있어?\n2. 메모이제이션이 필요한 곳은?\n3. 코드 스플리팅 할 부분은?"</div>`,
    },
    {
      icon: "🔒", title: "보안 검토하기", desc: "AI로 보안 취약점 찾기",
      content: `<h3 class="lesson-title">AI 보안 코드 리뷰</h3><p>AI는 보안 취약점을 찾는 데도 탁월합니다. 배포 전 반드시 AI 보안 검토를 해보세요.</p><div class="tip-box">🔒 <strong>보안 검토 포인트</strong><br/>XSS, SQL Injection, CSRF<br/>인증/인가, 환경변수 노출</div><div class="code-box">"이 코드의 보안 취약점을 찾아줘.\n특히 사용자 입력 검증과\nXSS 취약점을 중점으로 봐줘."</div>`,
    },
    {
      icon: "🎓", title: "나만의 AI 워크플로우", desc: "최고의 바이브코더가 되기 위한 시스템",
      content: `<h3 class="lesson-title">나만의 바이브코딩 워크플로우</h3><p>최고의 바이브코더들은 자신만의 체계적인 워크플로우를 가지고 있습니다.</p><div class="tip-box">🏆 <strong>마스터 바이브코더의 루틴</strong><br/>아이디어 → 빠른 프로토타입(AI) → 테스트 → 개선(AI) → 배포</div><div class="code-box">바이브코딩 워크플로우:\n\n1. 아이디어 명확화 (5분)\n2. AI 초안 생성 (10분)\n3. 직접 검토 & 테스트 (15분)\n4. AI와 반복 개선 (무한)</div>`,
    },
  ],
];

const TABS = ["🌱 입문", "⚡ 핵심기술", "🚀 실전", "🎓 고급"];
const STAGE_NAMES = ["입문", "핵심기술", "실전", "고급"];
const QUICK_CHIPS = ["바이브코딩이 뭐예요?", "어디서 시작해야 할까요?", "AI 프롬프트 잘 쓰는 법", "추천 도구 알려줘"];
const LESSON_TASKS: Record<string, string> = {
  "바이브코딩이란?": "내가 만들고 싶은 앱 아이디어를 한 문장으로 적고, 그 앱이 해결할 불편함을 한 문장으로 추가해보세요.",
  "AI와 대화하는 법": "나쁜 프롬프트 하나를 고른 뒤, 목적/동작/맥락이 들어간 좋은 프롬프트로 다시 써보세요.",
  "도구 세팅하기": "v0.dev, Bolt.new, Cursor 중 하나를 실제로 열어보고, 어떤 입력창에 프롬프트를 넣는지 확인해보세요.",
  "첫 번째 바이브": "Todo 앱 프롬프트를 AI 도구에 붙여넣고, 나온 결과에서 마음에 드는 점과 고칠 점을 각각 하나씩 적어보세요.",
  "프롬프트 엔지니어링": "역할, 목표, 기술스택, 제약조건, 출력형식을 모두 넣은 프롬프트를 한 번 작성해보세요.",
  "반복 개선하기": "AI가 만든 결과물에 대해 색상, 모바일, 에러 상태 중 하나를 골라 개선 요청을 한 번 더 보내보세요.",
  "AI로 디버깅하기": "에러 메시지 예시와 내가 하려던 일을 함께 적은 디버깅 프롬프트를 작성해보세요.",
  "코드 이해하기": "AI가 만든 코드 일부를 골라 '이 코드가 어떤 순서로 동작하는지 설명해줘'라고 질문해보세요.",
  "API 연동하기": "로딩, 에러, 성공 상태가 포함된 API 연동 요청 프롬프트를 한 번 작성해보세요.",
  "컴포넌트 설계": "Props로 바꿀 수 있는 버튼 또는 카드 컴포넌트를 요청하는 프롬프트를 작성해보세요.",
  "상태 관리하기": "내 앱에서 기억해야 할 상태 3가지를 적고, 어떤 컴포넌트가 그 상태를 쓰는지 연결해보세요.",
  "배포하기": "배포 전 확인할 환경변수, 빌드, GitHub, Vercel 체크리스트를 내 프로젝트 기준으로 적어보세요.",
  "AI 앱 만들기": "AI 기능이 들어간 앱 아이디어 하나를 정하고, 입력/AI 처리/결과 화면을 나눠 설명해보세요.",
  "성능 최적화": "느린 화면을 가정하고, 리렌더링/이미지/데이터 호출 중 어떤 부분을 점검할지 AI에게 묻는 프롬프트를 작성해보세요.",
  "보안 검토하기": "사용자 입력, 권한, 환경변수 노출을 점검해달라는 보안 리뷰 프롬프트를 작성해보세요.",
  "나만의 AI 워크플로우": "아이디어 정리부터 배포까지 내가 반복할 5단계 AI 개발 루틴을 직접 적어보세요.",
};
const CONFETTI_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
const seeded = (seed: number) => {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
};
const confettiParticles = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: seeded(i + 1) * 100,
  delay: seeded(i + 11) * 2,
  duration: 2 + seeded(i + 21) * 2,
  color: CONFETTI_COLORS[Math.floor(seeded(i + 31) * CONFETTI_COLORS.length)],
  size: 6 + seeded(i + 41) * 8,
  radius: seeded(i + 51) > 0.5 ? "50%" : "2px",
}));

// ── 축하 파티클 ──
function ConfettiParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {confettiParticles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`, top: "-20px",
            width: `${p.size}px`, height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.radius,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}</style>
    </div>
  );
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

export default function Learn() {
  const [theme, setTheme] = useState<Theme>("light");
  const [currentTab, setCurrentTab] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState(0);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "👋 안녕하세요! 저는 바이브코딩 전문 AI 튜터입니다.\n\n왼쪽에서 배우고 싶은 레슨을 선택하거나, 지금 바로 궁금한 것을 물어보세요!\n\n예: 바이브코딩이 뭔가요?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chips, setChips] = useState(QUICK_CHIPS);
  const [taskConfirmed, setTaskConfirmed] = useState(false);

  // ── 게임화 상태 ──
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);
  const [stageClearToast, setStageClearToast] = useState<string | null>(null);
  const [prevLevel, setPrevLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedTheme = localStorage.getItem("vibe-theme");
        if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme as Theme);

        const savedCompleted = localStorage.getItem("vibe-completed");
        const savedXp = localStorage.getItem("vibe-xp");
        if (savedCompleted) setCompletedLessons(new Set(JSON.parse(savedCompleted)));
        if (savedXp) {
          const parsed = parseInt(savedXp);
          setXp(parsed);
          setPrevLevel(Math.floor(parsed / 200) + 1);
        }

        const lastVisit = localStorage.getItem("vibe-last-visit");
        const today = new Date().toDateString();
        const savedStreak = parseInt(localStorage.getItem("vibe-streak") || "0");
        if (lastVisit === today) {
          setStreak(savedStreak);
        } else {
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const newStreak = lastVisit === yesterday ? savedStreak + 1 : 1;
          setStreak(newStreak);
          localStorage.setItem("vibe-streak", String(newStreak));
          localStorage.setItem("vibe-last-visit", today);
        }
      } catch {
        localStorage.removeItem("vibe-completed");
        localStorage.removeItem("vibe-xp");
      }
    });
  }, []);

  const isDark = theme === "dark";
  const totalLessons = CURRICULUM.flat().length;
  const completedCount = completedLessons.size;
  const progressPct = (completedCount / totalLessons) * 100;
  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const badge = getBadge(completedCount);
  const selectedLessonParts = currentLesson?.split("-").map(Number);
  const selectedTabIndex = selectedLessonParts?.[0] ?? -1;
  const selectedLessonIndex = selectedLessonParts?.[1] ?? -1;
  const selectedLesson = selectedTabIndex >= 0 && selectedLessonIndex >= 0
    ? CURRICULUM[selectedTabIndex]?.[selectedLessonIndex]
    : null;
  const selectedLessonCompleted = currentLesson ? completedLessons.has(currentLesson) : false;
  const selectedLessonTask = selectedLesson ? LESSON_TASKS[selectedLesson.title] : "";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const checkStageClear = useCallback((newCompleted: Set<string>, tabIdx: number) => {
    const stageIds = CURRICULUM[tabIdx].map((_, i) => `${tabIdx}-${i}`);
    const allClear = stageIds.every((id) => newCompleted.has(id));
    if (allClear) {
      setStageClearToast(STAGE_NAMES[tabIdx]);
      setTimeout(() => setStageClearToast(null), 4000);
    }
  }, []);

  const checkMasterClear = useCallback((newCompleted: Set<string>) => {
    if (newCompleted.size >= totalLessons) {
      const alreadyMaster = localStorage.getItem("vibe-master-achieved");
      if (!alreadyMaster) {
        setShowConfetti(true);
        setShowMasterModal(true);
        localStorage.setItem("vibe-master-achieved", "true");
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [totalLessons]);

  const checkLevelUp = useCallback((newXp: number) => {
    const newLevel = Math.floor(newXp / 200) + 1;
    if (newLevel > prevLevel) {
      setPrevLevel(newLevel);
      setLevelUpToast(newLevel);
      setTimeout(() => setLevelUpToast(null), 3500);
    }
  }, [prevLevel]);

  // ── 전체 초기화 핸들러 ──
  const handleFullReset = () => {
    localStorage.removeItem("vibe-completed");
    localStorage.removeItem("vibe-xp");
    localStorage.removeItem("vibe-streak");
    localStorage.removeItem("vibe-master-achieved");
    localStorage.removeItem("vibe-last-visit");
    setCompletedLessons(new Set());
    setXp(0);
    setStreak(0);
    setPrevLevel(1);
    setCurrentLesson(null);
    setCurrentTab(0);
    setTaskConfirmed(false);
    setShowResetConfirm(false);
    setMessages([
      {
        role: "assistant",
        content: "🔄 학습 기록이 초기화됐어요!\n\n다시 처음부터 시작해볼까요? 화이팅! 💪",
      },
    ]);
    setChips(QUICK_CHIPS);
  };

  const selectLesson = (tabIdx: number, lessonIdx: number) => {
    const id = `${tabIdx}-${lessonIdx}`;
    setCurrentLesson(id);
    setTaskConfirmed(false);
    const lesson = CURRICULUM[tabIdx][lessonIdx];

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `"${lesson.title}" 레슨을 열었습니다.\n\n본문을 읽고 수행 과제를 직접 해본 뒤 완료 버튼을 눌러주세요. 궁금한 점은 언제든 물어보세요.` },
    ]);
    setChips(["이 레슨을 쉽게 설명해줘", "수행 과제 예시 보여줘", "내 답을 검사해줘", "다음 단계는?"]);
  };

  const completeLesson = (tabIdx: number, lessonIdx: number) => {
    const id = `${tabIdx}-${lessonIdx}`;
    const lesson = CURRICULUM[tabIdx][lessonIdx];
    if (completedLessons.has(id)) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(id);
    setCompletedLessons(newCompleted);
    const newXp = xp + 50;
    setXp(newXp);
    localStorage.setItem("vibe-completed", JSON.stringify([...newCompleted]));
    localStorage.setItem("vibe-xp", String(newXp));
    checkLevelUp(newXp);
    checkStageClear(newCompleted, tabIdx);
    checkMasterClear(newCompleted);
    setTaskConfirmed(false);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `"${lesson.title}" 수행 과제를 완료 처리했습니다.\n\n잘했어요. 이제 다음 레슨으로 넘어가거나, 방금 한 과제를 저에게 보여주고 피드백을 받을 수 있습니다.` },
    ]);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;
    setInput("");
    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const currentLessonData = currentLesson
      ? CURRICULUM[parseInt(currentLesson.split("-")[0])][parseInt(currentLesson.split("-")[1])]
      : null;

    const recentMessages = messages.slice(-6);
    const historyText = recentMessages.map((m) => `${m.role === "user" ? "학생" : "튜터"}: ${m.content}`).join("\n");
    const fullQuestion = `${currentLessonData ? `[레슨: ${currentLessonData.title}]` : ""}\n\n이전 대화:\n${historyText}\n\n학생의 새 질문: ${messageText}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: fullQuestion, type: "guide" }),
      });
      const json = await res.json();
      const reply = json.success && json.data
        ? (typeof json.data === "string" ? json.data : JSON.stringify(json.data))
        : "죄송해요, 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      const newXp = xp + 10;
      setXp(newXp);
      localStorage.setItem("vibe-xp", String(newXp));
      checkLevelUp(newXp);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "죄송해요, 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStageProgress = (tabIdx: number) => {
    const stageIds = CURRICULUM[tabIdx].map((_, i) => `${tabIdx}-${i}`);
    const done = stageIds.filter((id) => completedLessons.has(id)).length;
    return { done, total: stageIds.length, pct: Math.round((done / stageIds.length) * 100) };
  };

  return (
    <main className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${isDark ? "bg-[#0c0c1d] text-white" : "bg-white text-slate-900"}`}>

      {/* ── 축하 이펙트 ── */}
      {showConfetti && <ConfettiParticles />}

      {/* ── 전체 완주 마스터 모달 ── */}
      {showMasterModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`mx-4 w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"}`}>
            <div className="text-6xl mb-4 animate-bounce">👑</div>
            <h2 className="text-2xl font-black mb-2">축하합니다!</h2>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? "bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent" : "text-amber-600"}`}>
              바이브 마스터 달성! 🎉
            </h3>
            <p className={`text-sm mb-6 leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
              16개 레슨을 모두 완주하셨습니다!<br />
              이제 당신은 바이브코딩의 마스터입니다.<br />
              배운 것을 실전에서 마음껏 펼쳐보세요! 🚀
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                닫기
              </button>
              <Link href="/workspace" className="px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 transition">
                실전 워크스페이스로 →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 초기화 확인 모달 ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`mx-4 w-full max-w-sm rounded-3xl border p-8 text-center shadow-2xl ${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-slate-200"}`}>
            <div className="text-5xl mb-4">🔄</div>
            <h2 className="text-lg font-black mb-2">학습 기록 초기화</h2>
            <p className={`text-sm mb-2 ${isDark ? "text-white/50" : "text-slate-500"}`}>
              아래 항목이 모두 사라집니다.
            </p>
            <div className={`text-xs rounded-xl p-3 mb-6 text-left space-y-1 ${isDark ? "bg-white/5 text-white/40" : "bg-slate-50 text-slate-400"}`}>
              <p>❌ 완료한 레슨 기록 ({completedCount}개)</p>
              <p>❌ 획득한 XP ({xp} XP)</p>
              <p>❌ 현재 뱃지 ({badge.emoji} {badge.title})</p>
              <p>❌ 연속 학습 스트릭 ({streak}일)</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleFullReset}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition"
              >
                초기화하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 레벨업 토스트 ── */}
      {levelUpToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] animate-bounce pointer-events-none">
          <div className={`flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-xl ${isDark ? "bg-gradient-to-r from-blue-600/90 to-violet-600/90 border-white/10 text-white" : "bg-gradient-to-r from-blue-500 to-violet-500 text-white"}`}>
            <span className="text-2xl">⬆️</span>
            <div>
              <div className="text-sm font-black">레벨 업!</div>
              <div className="text-xs opacity-80">Lv.{levelUpToast} 달성! 계속 성장하고 있어요! 🎊</div>
            </div>
          </div>
        </div>
      )}

      {/* ── 스테이지 클리어 토스트 ── */}
      {stageClearToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] animate-bounce pointer-events-none">
          <div className={`flex items-center gap-3 rounded-2xl border px-6 py-3 shadow-xl ${isDark ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 border-white/10 text-white" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"}`}>
            <span className="text-2xl">🎖️</span>
            <div>
              <div className="text-sm font-black">{stageClearToast} 스테이지 클리어!</div>
              <div className="text-xs opacity-80">대단해요! 다음 단계로 올라가봐요! 🚀</div>
            </div>
          </div>
        </div>
      )}

      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/25 blur-[120px]" />
          <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
        </div>
      )}

      {/* ── 헤더 ── */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? "border-white/5 bg-[#0c0c1d]/80" : "border-slate-100 bg-white/90"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className={`text-base font-extrabold tracking-tight md:text-lg ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"}`}>
            VIBE PROJECT
          </Link>

          <div className="flex items-center gap-3">
            {/* 뱃지 */}
            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${isDark ? badge.darkColor : badge.color}`}>
              <span className="text-sm">{badge.emoji}</span>
              <span className="font-bold text-xs">{badge.title}</span>
            </div>

            {/* XP/레벨 */}
            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-violet-400" : "bg-blue-500"}`} />
              <span className={`font-mono text-xs font-bold ${isDark ? "text-violet-400" : "text-blue-600"}`}>{xp} XP</span>
              <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>Lv.{level}</span>
            </div>

            {/* 스트릭 */}
            {streak > 0 && (
              <div className={`hidden items-center gap-1 rounded-full border px-2.5 py-1.5 sm:flex ${isDark ? "border-orange-500/30 bg-orange-500/10" : "border-orange-200 bg-orange-50"}`}>
                <span className="text-sm">🔥</span>
                <span className={`font-mono text-xs font-bold ${isDark ? "text-orange-400" : "text-orange-600"}`}>{streak}일</span>
              </div>
            )}

            {/* 테마 토글 */}
            <div className={`flex overflow-hidden rounded-full border p-1 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button type="button" onClick={() => handleThemeChange("light")}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10"}`}>
                <SunIcon />
              </button>
              <button type="button" onClick={() => handleThemeChange("dark")}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
                <MoonIcon />
              </button>
            </div>

            <Link href="/workspace"
              className={`hidden rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition md:block ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
              실전 시작 →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 진도 바 + 스테이지 미니 진도 ── */}
      <div className={`border-b transition-colors ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center gap-4 mb-3">
            <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>학습 진도 {completedCount}/{totalLessons}</span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${isDark ? "bg-gradient-to-r from-blue-500 to-violet-500" : "bg-blue-600"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${isDark ? "text-violet-400" : "text-blue-600"}`}>{Math.round(progressPct)}%</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TABS.map((tab, i) => {
              const sp = getStageProgress(i);
              return (
                <button key={i} type="button" onClick={() => setCurrentTab(i)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${currentTab === i ? isDark ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600" : isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
                  <span>{tab.split(" ")[0]}</span>
                  <div className={`flex-1 h-1 rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                    <div className={`h-full rounded-full transition-all ${sp.pct === 100 ? "bg-emerald-500" : isDark ? "bg-violet-500" : "bg-blue-500"}`} style={{ width: `${sp.pct}%` }} />
                  </div>
                  <span className={sp.pct === 100 ? "text-emerald-500" : ""}>{sp.pct === 100 ? "✓" : `${sp.done}/${sp.total}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 메인 ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">

        <div className="mb-8 text-center">
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
            바이브코딩 학습 센터
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            AI와 함께 배우는
            <span className={`ml-2 ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-blue-600"}`}>바이브코딩</span>
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-base ${isDark ? "text-white/40" : "text-slate-500"}`}>
            레슨을 선택하고 AI 튜터와 함께 학습하세요. 질문하면 바로 답해드려요.
          </p>
        </div>

        {/* ── 스탯 카드 4개 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "완료 레슨", value: `${completedCount}/${totalLessons}`, icon: "📚" },
            { label: "경험치", value: `${xp} XP`, icon: "⚡", showBar: true },
            { label: "현재 레벨", value: `Lv.${level}`, icon: "🏆" },
            { label: "연속 학습", value: `${streak}일`, icon: "🔥" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-lg font-black">{stat.value}</div>
              <div className={`text-[10px] font-bold ${isDark ? "text-white/30" : "text-slate-400"}`}>{stat.label}</div>
              {stat.showBar && (
                <div className={`mt-1.5 h-1 rounded-full ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
                  <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${(xpInLevel / 200) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── 탭 ── */}
        <div className={`mb-6 flex gap-1 rounded-2xl border p-1 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
          {TABS.map((tab, i) => {
            const sp = getStageProgress(i);
            return (
              <button key={i} type="button" onClick={() => setCurrentTab(i)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition relative ${currentTab === i ? isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm" : isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                {tab}
                {sp.pct === 100 && <span className="absolute -top-1 -right-1 text-xs">✅</span>}
              </button>
            );
          })}
        </div>

        {/* ── 메인 그리드 ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
            {/* 레슨 카드 */}
            <div className="grid gap-3 sm:grid-cols-2">
              {CURRICULUM[currentTab].map((lesson, i) => {
                const id = `${currentTab}-${i}`;
                const isCompleted = completedLessons.has(id);
                const isActive = currentLesson === id;
                return (
                  <button key={i} type="button" onClick={() => selectLesson(currentTab, i)}
                    className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${
                      isActive
                        ? isDark ? "border-violet-500/50 bg-violet-500/10" : "border-blue-300 bg-blue-50"
                        : isDark ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10" : "border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md"
                    }`}>
                    {isActive && (
                      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${isDark ? "bg-gradient-to-b from-blue-500 to-violet-500" : "bg-blue-600"}`} />
                    )}
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-2xl">{lesson.icon}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${isCompleted ? isDark ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-green-200 bg-green-50 text-green-600" : isDark ? "border-white/10 bg-white/5 text-white/40" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                        {isCompleted ? "✓ 완료" : "시작하기"}
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{lesson.title}</h3>
                    <p className={`mt-1 text-xs leading-5 ${isDark ? "text-white/40" : "text-slate-500"}`}>{lesson.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* 레슨 본문 */}
            {currentLesson && selectedLesson && (
              <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <style>{`
                  .lesson-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; }
                  .tip-box { padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; font-size: 0.875rem; line-height: 1.7; ${isDark ? "background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.2); color: #c4b5fd;" : "background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8;"} }
                  .code-box { padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; font-size: 0.8rem; line-height: 1.7; font-family: monospace; white-space: pre-wrap; ${isDark ? "background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); color: #c4b5fd;" : "background: #f8fafc; border: 1px solid #e2e8f0; color: #334155;"} }
                  p { margin-bottom: 0.75rem; font-size: 0.9rem; line-height: 1.8; ${isDark ? "color: rgba(255,255,255,0.6);" : "color: #475569;"} }
                  strong { ${isDark ? "color: white;" : "color: #0f172a;"} }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />

                <div className={`mt-6 rounded-2xl border p-4 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>수행형 과제</span>
                      <h3 className={`mt-1 text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>읽는 데서 끝내지 않고 직접 해보기</h3>
                    </div>
                    <span className={`w-fit rounded-full border px-2 py-1 text-[11px] font-bold ${selectedLessonCompleted ? isDark ? "border-emerald-500/30 text-emerald-300" : "border-emerald-300 text-emerald-700" : isDark ? "border-white/10 text-white/40" : "border-slate-200 text-slate-500"}`}>
                      {selectedLessonCompleted ? "완료됨" : "50 XP"}
                    </span>
                  </div>
                  <p className={`mb-4 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-700"}`}>{selectedLessonTask}</p>
                  {selectedLessonCompleted ? (
                    <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-white text-emerald-700"}`}>
                      이 레슨의 수행 과제를 완료했습니다. 다음 레슨으로 넘어가도 좋습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <label className={`flex items-start gap-2 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>
                        <input
                          type="checkbox"
                          checked={taskConfirmed}
                          onChange={(event) => setTaskConfirmed(event.target.checked)}
                          className="mt-0.5 rounded border-slate-300 accent-emerald-500"
                        />
                        <span>과제를 직접 수행했고, 결과를 설명할 수 있습니다.</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => completeLesson(selectedTabIndex, selectedLessonIndex)}
                        disabled={!taskConfirmed}
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        과제 완료하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── AI 튜터 채팅 ── */}
          <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`} style={{ height: "600px" }}>
            <div className={`flex items-center gap-3 border-b px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${isDark ? "bg-gradient-to-br from-blue-500 to-violet-500" : "bg-blue-600"}`}>AI</div>
              <div>
                <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>AI 바이브코딩 튜터</div>
                <div className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>AI 튜터 · 한국어 지원</div>
              </div>
              <div className="ml-auto">
                <span className={`h-2 w-2 rounded-full ${isLoading ? "animate-pulse bg-yellow-400" : "bg-green-400"}`} style={{ display: "inline-block" }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "flex-row-reverse" : ""} gap-2`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === "user" ? isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500" : isDark ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white" : "bg-blue-600 text-white"}`}>
                    {msg.role === "user" ? "나" : "AI"}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${msg.role === "user" ? isDark ? "rounded-tr-sm bg-white/10 text-white/80" : "rounded-tr-sm bg-slate-100 text-slate-700" : isDark ? "rounded-tl-sm bg-gradient-to-br from-blue-600/80 to-violet-600/80 text-white" : "rounded-tl-sm bg-blue-600 text-white"}`}>
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isDark ? "bg-gradient-to-br from-blue-500 to-violet-500" : "bg-blue-600"}`}>AI</div>
                  <div className={`flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3 ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className={`h-1.5 w-1.5 animate-bounce rounded-full ${isDark ? "bg-violet-400" : "bg-blue-500"}`} style={{ animationDelay: `${idx * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`border-t p-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {chips.map((chip, i) => (
                  <button key={i} type="button" onClick={() => sendMessage(chip)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${isDark ? "border-white/10 text-white/50 hover:border-violet-500/50 hover:text-white" : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"}`}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="질문을 입력하세요..."
                  rows={1}
                  className={`flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500" : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-300 focus:border-blue-400"}`}
                />
                <button type="button" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${input.trim() && !isLoading ? isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90" : "bg-blue-600 text-white hover:bg-blue-700" : isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-300"}`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 하단 CTA + 초기화 버튼 ── */}
        <div className={`mt-8 rounded-2xl border p-6 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
          <p className={`mb-2 text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            배운 내용을 바로 실전에 적용해보세요!
          </p>
          <p className={`mb-4 text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>
            내 아이디어를 AI가 기획정리, 프롬프트 생성, 에러 해석까지 도와드려요.
          </p>
          <Link href="/workspace"
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90" : "bg-blue-600 hover:bg-blue-700"}`}>
            실전 워크스페이스 바로가기 →
          </Link>

          {/* ── 학습 초기화 섹션 ── */}
          <div className={`mt-6 pt-6 border-t ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <p className={`text-xs mb-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>
              처음부터 다시 복습하고 싶으신가요?
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition ${
                isDark
                  ? "border-white/10 text-white/30 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                  : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              🔄 처음부터 다시 시작하기
            </button>
          </div>
        </div>
      </div>

      {/* ── 푸터 ── */}
      <footer className={`border-t px-6 py-8 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">VIBE PROJECT</span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>누구나 자신의 아이디어를 현실로 구현하도록</span>
        </div>
      </footer>
    </main>
  );
}

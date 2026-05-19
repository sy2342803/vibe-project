"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Theme = "light" | "dark";

interface Lesson {
  icon: string;
  title: string;
  desc: string;
  content: string;
}

const CURRICULUM: Lesson[][] = [
  // 입문
  [
    {
      icon: "🎵",
      title: "바이브코딩이란?",
      desc: "AI 시대의 새로운 코딩 철학과 마인드셋",
      content: `
        <h3 class="lesson-title">바이브코딩이란 무엇인가?</h3>
        <p>바이브코딩(Vibe Coding)은 <strong>Andrej Karpathy</strong>가 2025년 제안한 개념으로, AI를 활용해 코드를 직관적으로 생성하는 방식입니다.</p>
        <p>전통적인 코딩이 문법과 알고리즘을 완벽히 이해하며 한 줄씩 짜는 것이라면, 바이브코딩은 <strong>"지금 이 느낌(vibe)"</strong>을 AI에게 전달해 코드를 만들어내는 것입니다.</p>
        <div class="tip-box">💡 <strong>핵심 개념</strong><br/>완벽한 코드를 직접 쓰는 것보다, 내가 원하는 것을 잘 설명해서 AI가 좋은 코드를 생성하도록 하는 것이 더 효과적입니다.</div>
        <p>이것은 개발자의 역할 변화를 의미합니다. 이제 개발자는 <strong>코드 작가</strong>에서 <strong>코드 감독</strong>으로 진화합니다.</p>
      `,
    },
    {
      icon: "🧠",
      title: "AI와 대화하는 법",
      desc: "효과적인 프롬프트 작성의 기초",
      content: `
        <h3 class="lesson-title">AI와 잘 대화하는 법</h3>
        <p>바이브코딩의 핵심은 <strong>명확한 의도 전달</strong>입니다. AI는 당신의 생각을 읽지 못하므로, 원하는 것을 구체적으로 표현해야 합니다.</p>
        <div class="tip-box">🎯 <strong>좋은 프롬프트의 3요소</strong><br/>1. 무엇을 만들고 싶은지 (목적)<br/>2. 어떻게 동작해야 하는지 (동작)<br/>3. 어떤 기술을 사용할지 (맥락)</div>
        <div class="code-box">❌ 나쁜 프롬프트: "버튼 만들어줘"
✅ 좋은 프롬프트: "React로 클릭하면 카운트가 올라가는 파란 버튼을 만들어줘. 카운트가 10이 되면 완료 메시지를 보여줘"</div>
      `,
    },
    {
      icon: "🛠️",
      title: "도구 세팅하기",
      desc: "Cursor, Claude, Copilot 선택 가이드",
      content: `
        <h3 class="lesson-title">바이브코딩 도구 세팅</h3>
        <p>바이브코딩을 위한 주요 도구들을 알아봅시다.</p>
        <div class="tip-box">🏆 <strong>추천 조합 (2025)</strong><br/>Cursor IDE + Claude = 최강 조합<br/>무료로 시작하려면: VS Code + GitHub Copilot</div>
        <p><strong>Cursor</strong> — AI 네이티브 에디터. 코드베이스 전체를 이해하고 맥락에 맞는 코드를 생성합니다.</p>
        <p><strong>Claude</strong> — Anthropic의 AI. 긴 코드 설명과 복잡한 로직 구현에 탁월합니다.</p>
        <p><strong>v0.dev</strong> — UI 컴포넌트를 자연어로 생성. 빠른 프로토타이핑에 최적.</p>
        <p><strong>Bolt.new</strong> — 풀스택 앱을 자연어로 생성. 빠른 MVP 제작에 최적.</p>
      `,
    },
    {
      icon: "🌊",
      title: "첫 번째 바이브",
      desc: "AI와 함께 첫 앱 만들어보기",
      content: `
        <h3 class="lesson-title">첫 번째 바이브코딩 경험</h3>
        <p>이론보다 실습! 지금 당장 AI와 함께 간단한 앱을 만들어봅시다.</p>
        <div class="tip-box">🎯 <strong>오늘의 미션</strong><br/>할 일 목록(Todo List) 앱을 AI에게만 설명해서 만들기</div>
        <p>아래 프롬프트를 AI에게 그대로 전달해보세요:</p>
        <div class="code-box">"HTML, CSS, JavaScript만으로 할 일 목록 앱을 만들어줘.

기능:
- 할 일 추가 (Enter키 또는 버튼)
- 완료 체크박스
- 삭제 버튼
- 완료된 항목은 취소선

디자인: 깔끔하고 모던하게, 다크 테마로 만들어줘"</div>
        <p>결과물이 마음에 들지 않으면 <strong>"조금 더 예쁘게 해줘"</strong> 처럼 자연스럽게 대화하며 수정하세요!</p>
      `,
    },
  ],
  // 핵심기술
  [
    {
      icon: "🎨",
      title: "프롬프트 엔지니어링",
      desc: "원하는 코드를 정확히 얻는 기술",
      content: `
        <h3 class="lesson-title">프롬프트 엔지니어링 기초</h3>
        <p>프롬프트 엔지니어링은 AI에게 원하는 결과를 얻기 위해 입력을 최적화하는 기술입니다.</p>
        <div class="tip-box">⚡ <strong>5가지 핵심 기법</strong><br/>1. 역할 부여 — "시니어 React 개발자로서..."<br/>2. 예시 제공 — "이런 식으로 해줘: [예시]"<br/>3. 제약 명시 — "TypeScript만 사용해줘"<br/>4. 단계별 요청 — "먼저 구조를 잡고..."<br/>5. 반복 개선 — "좀 더 최적화해줘"</div>
      `,
    },
    {
      icon: "🔄",
      title: "반복 개선하기",
      desc: "AI와 함께 코드를 점진적으로 발전시키기",
      content: `
        <h3 class="lesson-title">반복적 개선 (Iterative Refinement)</h3>
        <p>바이브코딩의 핵심은 <strong>완벽한 첫 결과를 기대하지 않는 것</strong>입니다.</p>
        <div class="tip-box">🔄 <strong>바이브코딩 루프</strong><br/>생성 → 검토 → 피드백 → 개선 → 반복</div>
        <div class="code-box">// 좋은 피드백 패턴들
"버튼 색상을 파란색으로 바꿔줘"
"이 함수가 너무 복잡해. 더 읽기 쉽게 리팩토링해줘"
"에러 처리가 없어. try-catch 추가해줘"
"모바일에서도 잘 보이게 반응형으로 수정해줘"</div>
      `,
    },
    {
      icon: "🐛",
      title: "AI로 디버깅하기",
      desc: "에러 메시지를 AI에게 던지는 방법",
      content: `
        <h3 class="lesson-title">AI 기반 디버깅</h3>
        <p>바이브코딩에서 디버깅은 에러 메시지를 AI에게 그대로 붙여넣는 것부터 시작합니다.</p>
        <div class="tip-box">🐛 <strong>디버깅 프롬프트 공식</strong><br/>[에러 메시지] + [해당 코드] + [무엇을 하려 했는지]</div>
        <div class="code-box">"이 에러가 났어:
TypeError: Cannot read properties of undefined (reading 'map')

data는 API에서 받아오는데 처음 렌더링 때 undefined야.
어떻게 고치면 돼?"</div>
      `,
    },
    {
      icon: "📦",
      title: "코드 이해하기",
      desc: "AI가 생성한 코드를 내 것으로 만들기",
      content: `
        <h3 class="lesson-title">AI 생성 코드 이해하기</h3>
        <p>바이브코딩의 함정 — AI가 코드를 생성해도 <strong>내가 이해하지 못하면 발전이 없습니다</strong>.</p>
        <div class="tip-box">📚 <strong>이해를 위한 질문들</strong><br/>"이 코드가 어떻게 동작하는지 설명해줘"<br/>"여기서 왜 useEffect를 사용했어?"<br/>"이 부분을 다른 방식으로도 구현할 수 있어?"</div>
      `,
    },
  ],
  // 실전
  [
    {
      icon: "🌐",
      title: "API 연동하기",
      desc: "AI로 REST API 클라이언트 만들기",
      content: `
        <h3 class="lesson-title">API 연동 바이브코딩</h3>
        <p>실제 서비스는 외부 API와 통신합니다. AI를 활용해 API 연동 코드를 빠르게 작성해봅시다.</p>
        <div class="tip-box">🌐 <strong>API 연동 프롬프트 패턴</strong><br/>API 문서 + 원하는 기능 설명 + 에러 처리 요구</div>
        <div class="code-box">"fetch를 사용해서 날씨 API를 호출하는
React 커스텀 훅을 만들어줘.
로딩, 에러, 데이터 상태를 모두 처리해줘."</div>
      `,
    },
    {
      icon: "🎭",
      title: "컴포넌트 설계",
      desc: "재사용 가능한 UI를 바이브코딩으로",
      content: `
        <h3 class="lesson-title">컴포넌트 설계하기</h3>
        <p>좋은 컴포넌트는 <strong>재사용 가능</strong>하고 <strong>독립적</strong>입니다.</p>
        <div class="tip-box">🧩 <strong>재사용 컴포넌트 요청 팁</strong><br/>"Props로 커스터마이징 가능하게 만들어줘"<br/>"기본값(default props)도 설정해줘"<br/>"TypeScript로 Props 타입 정의해줘"</div>
      `,
    },
    {
      icon: "🗄️",
      title: "상태 관리하기",
      desc: "전역 상태를 바이브코딩으로",
      content: `
        <h3 class="lesson-title">상태 관리 바이브코딩</h3>
        <p>복잡한 앱은 여러 컴포넌트가 상태를 공유해야 합니다.</p>
        <div class="tip-box">📊 <strong>상태 관리 도구 선택 가이드</strong><br/>소규모: useState + props<br/>중규모: Zustand (바이브코딩에 최적!)<br/>대규모: Redux Toolkit</div>
      `,
    },
    {
      icon: "🚢",
      title: "배포하기",
      desc: "Vercel로 결과물 공개하기",
      content: `
        <h3 class="lesson-title">바이브코딩 결과물 배포</h3>
        <p>만든 것을 세상에 보여줄 시간! Vercel은 바이브코딩 결과물을 배포하기 가장 쉬운 플랫폼입니다.</p>
        <div class="tip-box">🚀 <strong>배포 체크리스트</strong><br/>✓ 환경변수 설정 (.env 파일)<br/>✓ 빌드 에러 없음 확인<br/>✓ GitHub 레포에 푸시<br/>✓ Vercel 연결 및 배포</div>
        <div class="code-box">git add .
git commit -m "배포 준비 완료"
git push origin main
# → Vercel 자동 배포!</div>
      `,
    },
  ],
  // 고급
  [
    {
      icon: "🤖",
      title: "AI 앱 만들기",
      desc: "LLM API를 활용한 AI 네이티브 앱",
      content: `
        <h3 class="lesson-title">AI 앱 바이브코딩</h3>
        <p>이제 AI를 배우는 것을 넘어 <strong>AI가 들어간 앱</strong>을 만들어봅시다!</p>
        <div class="tip-box">🤖 <strong>AI 앱 시작 프롬프트</strong><br/>Gemini/Claude API + 원하는 기능 + UX 요구사항</div>
        <div class="code-box">"Gemini API를 사용해서
코드 리뷰 도구를 만들어줘.
사용자가 코드를 붙여넣으면
버그 찾기, 성능 개선 제안을 해주는 웹앱"</div>
      `,
    },
    {
      icon: "⚡",
      title: "성능 최적화",
      desc: "AI로 병목 찾고 성능 올리기",
      content: `
        <h3 class="lesson-title">AI 기반 성능 최적화</h3>
        <p>성능 문제는 찾기 어렵습니다. AI에게 코드를 분석시키면 놓친 부분을 발견할 수 있습니다.</p>
        <div class="tip-box">⚡ <strong>최적화 분석 요청 방법</strong><br/>코드 + "성능 문제가 있을 수 있는 부분을 찾아줘"</div>
        <div class="code-box">"이 React 앱이 느려. 성능 분석해줘:
1. 불필요한 리렌더링이 있어?
2. 메모이제이션이 필요한 곳은?
3. 코드 스플리팅 할 부분은?"</div>
      `,
    },
    {
      icon: "🔒",
      title: "보안 검토하기",
      desc: "AI로 보안 취약점 찾기",
      content: `
        <h3 class="lesson-title">AI 보안 코드 리뷰</h3>
        <p>AI는 보안 취약점을 찾는 데도 탁월합니다. 배포 전 반드시 AI 보안 검토를 해보세요.</p>
        <div class="tip-box">🔒 <strong>보안 검토 포인트</strong><br/>XSS, SQL Injection, CSRF<br/>인증/인가, 환경변수 노출</div>
        <div class="code-box">"이 코드의 보안 취약점을 찾아줘.
특히 사용자 입력 검증과
XSS 취약점을 중점으로 봐줘."</div>
      `,
    },
    {
      icon: "🎓",
      title: "나만의 AI 워크플로우",
      desc: "최고의 바이브코더가 되기 위한 시스템",
      content: `
        <h3 class="lesson-title">나만의 바이브코딩 워크플로우</h3>
        <p>최고의 바이브코더들은 자신만의 체계적인 워크플로우를 가지고 있습니다.</p>
        <div class="tip-box">🏆 <strong>마스터 바이브코더의 루틴</strong><br/>아이디어 → 빠른 프로토타입(AI) → 테스트 → 개선(AI) → 배포</div>
        <div class="code-box">바이브코딩 워크플로우:

1. 아이디어 명확화 (5분)
   - 무엇을 만들 건지 한 문장으로

2. AI 초안 생성 (10분)
   - 전체 구조 먼저
   - 핵심 기능 구현

3. 직접 검토 & 테스트 (15분)
   - 실제로 동작하는지 확인

4. AI와 반복 개선 (무한)
   - 피드백 → 수정 → 확인</div>
      `,
    },
  ],
];

const TABS = ["🌱 입문", "⚡ 핵심기술", "🚀 실전", "🎓 고급"];

const QUICK_CHIPS = [
  "바이브코딩이 뭐예요?",
  "어디서 시작해야 할까요?",
  "AI 프롬프트 잘 쓰는 법",
  "추천 도구 알려줘",
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme as Theme);
    }
    const savedCompleted = localStorage.getItem("vibe-completed");
    const savedXp = localStorage.getItem("vibe-xp");
    if (savedCompleted) setCompletedLessons(new Set(JSON.parse(savedCompleted)));
    if (savedXp) setXp(parseInt(savedXp));
  }, []);

  const isDark = theme === "dark";

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const totalLessons = CURRICULUM.flat().length;
  const completedCount = completedLessons.size;
  const progressPct = (completedCount / totalLessons) * 100;
  const level = Math.floor(xp / 200) + 1;

  const selectLesson = (tabIdx: number, lessonIdx: number) => {
    const id = `${tabIdx}-${lessonIdx}`;
    setCurrentLesson(id);
    const lesson = CURRICULUM[tabIdx][lessonIdx];

    if (!completedLessons.has(id)) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(id);
      setCompletedLessons(newCompleted);
      const newXp = xp + 50;
      setXp(newXp);
      localStorage.setItem("vibe-completed", JSON.stringify([...newCompleted]));
      localStorage.setItem("vibe-xp", String(newXp));
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `"${lesson.title}" 레슨을 선택하셨네요! 🎉\n\n이 레슨에 대해 궁금한 점이 있으면 언제든 물어보세요!`,
      },
    ]);

    setChips([
      "이 레슨에 대해 더 설명해줘",
      "실습 예제 만들어줘",
      "다음 단계는?",
      "퀴즈 내줘",
    ]);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;
    setInput("");

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const currentLessonData =
      currentLesson
        ? CURRICULUM[parseInt(currentLesson.split("-")[0])][parseInt(currentLesson.split("-")[1])]
        : null;

    // 이전 대화 히스토리 포함 (최근 6개)
    const recentMessages = messages.slice(-6);
    const historyText = recentMessages
      .map((m) => `${m.role === "user" ? "학생" : "튜터"}: ${m.content}`)
      .join("\n");

    const fullQuestion = `${currentLessonData ? `[레슨: ${currentLessonData.title}]` : ""}

이전 대화:
${historyText}

학생의 새 질문: ${messageText}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: fullQuestion,
          type: "guide",
        }),
      });

      const json = await res.json();

      let reply = "";
      if (json.success && json.data) {
        reply = typeof json.data === "string"
          ? json.data
          : JSON.stringify(json.data);
      } else {
        reply = "죄송해요, 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      const newXp = xp + 10;
      setXp(newXp);
      localStorage.setItem("vibe-xp", String(newXp));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "죄송해요, 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${isDark ? "bg-[#0c0c1d] text-white" : "bg-white text-slate-900"}`}>
      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/25 blur-[120px]" />
          <div className="absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
        </div>
      )}

      {/* 헤더 */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? "border-white/5 bg-[#0c0c1d]/80" : "border-slate-100 bg-white/90"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className={`text-base font-extrabold tracking-tight md:text-lg ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"}`}>
            VIBE PROJECT
          </Link>

          <div className="flex items-center gap-3">
            <div className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 sm:flex ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-violet-400" : "bg-blue-500"}`} />
              <span className={`font-mono text-xs font-bold ${isDark ? "text-violet-400" : "text-blue-600"}`}>{xp} XP</span>
              <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>Lv.{level}</span>
            </div>

            <div className={`flex overflow-hidden rounded-full border p-1 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} aria-label="Light mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10 hover:text-white"}`}>
                <SunIcon />
              </button>
              <button type="button" onClick={() => handleThemeChange("dark")} aria-label="Dark mode"
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
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

      {/* 진도 바 */}
      <div className={`border-b transition-colors ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center gap-4">
            <span className={`text-xs ${isDark ? "text-white/40" : "text-slate-400"}`}>
              학습 진도 {completedCount}/{totalLessons}
            </span>
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${isDark ? "bg-gradient-to-r from-blue-500 to-violet-500" : "bg-blue-600"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${isDark ? "text-violet-400" : "text-blue-600"}`}>
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-6">

        <div className="mb-8 text-center">
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/5 text-white/60" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
            바이브코딩 학습 센터
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            AI와 함께 배우는
            <span className={`ml-2 ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-blue-600"}`}>
              바이브코딩
            </span>
          </h1>
          <p className={`mx-auto mt-3 max-w-xl text-base ${isDark ? "text-white/40" : "text-slate-500"}`}>
            레슨을 선택하고 AI 튜터와 함께 학습하세요. 질문하면 바로 답해드려요.
          </p>
        </div>

        {/* 탭 */}
        <div className={`mb-6 flex gap-1 rounded-2xl border p-1 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
          {TABS.map((tab, i) => (
            <button key={i} type="button" onClick={() => setCurrentTab(i)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${currentTab === i ? isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg" : "bg-white text-blue-600 shadow-sm" : isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* 메인 그리드 */}
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-4">
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

            {currentLesson && (
              <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
                <style>{`
                  .lesson-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; }
                  .tip-box { padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; font-size: 0.875rem; line-height: 1.7; ${isDark ? "background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.2); color: #c4b5fd;" : "background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8;"} }
                  .code-box { padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; font-size: 0.8rem; line-height: 1.7; font-family: monospace; white-space: pre-wrap; ${isDark ? "background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); color: #c4b5fd;" : "background: #f8fafc; border: 1px solid #e2e8f0; color: #334155;"} }
                  p { margin-bottom: 0.75rem; font-size: 0.9rem; line-height: 1.8; ${isDark ? "color: rgba(255,255,255,0.6);" : "color: #475569;"} }
                  strong { ${isDark ? "color: white;" : "color: #0f172a;"} }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: CURRICULUM[parseInt(currentLesson.split("-")[0])][parseInt(currentLesson.split("-")[1])].content }} />
              </div>
            )}
          </div>

          {/* AI 튜터 채팅 */}
          <div className={`flex flex-col rounded-2xl border overflow-hidden ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`} style={{ height: "600px" }}>
            <div className={`flex items-center gap-3 border-b px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${isDark ? "bg-gradient-to-br from-blue-500 to-violet-500" : "bg-blue-600"}`}>
                AI
              </div>
              <div>
                <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>AI 바이브코딩 튜터</div>
                <div className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>Gemini 기반 · 한국어 지원</div>
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
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${msg.role === "user"
                    ? isDark ? "rounded-tr-sm bg-white/10 text-white/80" : "rounded-tr-sm bg-slate-100 text-slate-700"
                    : isDark ? "rounded-tl-sm bg-gradient-to-br from-blue-600/80 to-violet-600/80 text-white" : "rounded-tl-sm bg-blue-600 text-white"}`}>
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
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1.5 w-1.5 animate-bounce rounded-full ${isDark ? "bg-violet-400" : "bg-blue-500"}`}
                        style={{ animationDelay: `${i * 0.15}s` }} />
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
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
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
        </div>
      </div>

      {/* 푸터 */}
      <footer className={`border-t px-6 py-8 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">VIBE PROJECT</span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>누구나 자신의 아이디어를 현실로 구현하도록</span>
        </div>
      </footer>
    </main>
  );
}
"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type Theme = "light" | "dark";

// ── 스크롤 애니메이션 훅 ──
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

// ── 숫자 카운트업 훅 ──
function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
}

// ── 타이핑 애니메이션 훅 ──
function useTypewriter(text: string, isActive: boolean, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!isActive) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, isActive, speed]);
  return displayed;
}

// ── 데이터 ──
const features = [
  { number: "01", title: "바이브 코딩 첫걸음", description: "어떻게 질문해야 AI가 좋은 결과를 만들어주는지부터 안내합니다. 좋은 프롬프트를 만드는 감각을 자연스럽게 익힐 수 있습니다.", gradient: "from-blue-500 to-cyan-400", icon: "🎯" },
  { number: "02", title: "아이디어 기획 훈련", description: "머릿속 아이디어를 핵심 기능, 사용자 흐름, 화면 구조로 나누는 방법을 배웁니다. 개발을 몰라도 기획을 구체화할 수 있습니다.", gradient: "from-violet-500 to-purple-400", icon: "💡" },
  { number: "03", title: "실전 코드 적용 가이드", description: "AI가 만들어준 코드를 어디에 붙여넣고 어떤 파일을 수정해야 하는지 단계별로 설명합니다.", gradient: "from-indigo-500 to-blue-400", icon: "⚡" },
  { number: "04", title: "에러 극복 튜토리얼", description: "에러 메시지를 쉬운 말로 해석하고, AI에게 다시 질문해 해결하는 방법을 배웁니다.", gradient: "from-pink-500 to-rose-400", icon: "🛡️" },
  { number: "05", title: "1일 프로토타입 챌린지", description: "긴 이론 학습보다 하루 안에 눈에 보이는 첫 프로토타입을 만드는 데 집중합니다.", gradient: "from-orange-500 to-amber-400", icon: "🚀" },
  { number: "06", title: "비전공자 맞춤 설명", description: "어려운 개발 용어는 최대한 쉽게 풀어 설명합니다. 문과생도 일상어로 AI와 대화하며 개발 흐름을 이해할 수 있습니다.", gradient: "from-teal-500 to-emerald-400", icon: "💬" },
];

const steps = [
  { number: "01", title: "아이디어 대화하기", description: "만들고 싶은 서비스를 AI 튜터에게 자연스럽게 설명하며 아이디어를 구체화합니다.", gradient: "from-blue-500 to-indigo-500", icon: "💬" },
  { number: "02", title: "프롬프트 다듬기", description: "막연한 요청을 AI가 이해하기 쉬운 바이브 코딩용 프롬프트로 바꾸는 방법을 배웁니다.", gradient: "from-violet-500 to-purple-500", icon: "✨" },
  { number: "03", title: "코드 실행 및 확인", description: "생성된 코드를 실제 프로젝트에 적용하고, 화면에서 결과물을 확인합니다.", gradient: "from-pink-500 to-rose-500", icon: "🖥️" },
  { number: "04", title: "에러 해결 및 완성", description: "막히는 부분을 AI와 함께 해결하며 개발 사이클을 끝까지 경험합니다.", gradient: "from-orange-500 to-amber-500", icon: "🎉" },
];

const userTypes = [
  { title: "창업 아이디어는 있지만 개발을 모르는 문과생", description: "머릿속 아이디어를 눈에 보이는 프로토타입으로 빠르게 만들어 검증해보고 싶은 학생에게 적합합니다.", gradient: "from-blue-500 to-cyan-400", icon: "🎓" },
  { title: "코딩 교육 기회가 부족했던 지역 대학생", description: "복잡한 개발 환경이나 비싼 강의 없이도, 웹브라우저와 AI를 활용해 실전 개발 경험을 시작할 수 있습니다.", gradient: "from-violet-500 to-purple-400", icon: "🌏" },
  { title: "혼자서도 무언가를 만들어보고 싶은 비전공자", description: "남이 대신 만들어주는 것이 아니라, 스스로 AI를 활용해 결과물을 완성하는 경험을 쌓고 싶은 사람에게 추천합니다.", gradient: "from-pink-500 to-rose-400", icon: "🔥" },
];

const faqs = [
  { question: "코딩을 한 번도 해본 적 없는데 정말 하루 만에 가능한가요?", answer: "네, 가능합니다. 문법을 외워 직접 코드를 모두 작성하는 방식이 아니라, AI에게 자연어로 요청하고 결과를 적용하는 바이브 코딩 방식으로 접근하기 때문입니다." },
  { question: "기존 코딩 강의와 무엇이 다른가요?", answer: "이론이나 문법 중심이 아니라, 내 아이디어를 실제로 구현하기 위해 AI를 어떻게 활용하고 에러를 어떻게 해결하는지 배우는 실전형 튜터라는 점이 다릅니다." },
  { question: "어떤 종류의 앱을 만들어볼 수 있나요?", answer: "맛집 리뷰, 게시판, 포트폴리오, 커뮤니티, 정보 정리 서비스 등 창업 아이디어 검증에 필요한 초기 프로토타입을 만들어볼 수 있습니다." },
  { question: "과정을 마치면 혼자서도 개발할 수 있게 되나요?", answer: "완벽한 개발자가 되는 것보다, AI와 대화하며 문제를 해결하고 아이디어를 직접 구현하는 감각을 익히는 것이 목표입니다." },
];

// ── 영상 플레이어 스텝 ──
const VIDEO_STEPS = [
  {
    time: "0:00", label: "아이디어 입력", icon: "💡", emoji: "✏️",
    title: "떠오른 아이디어를 그냥 적기만 하면 돼요",
    subtitle: "복잡한 기획서? 필요 없어요.",
    typeText: "학교 근처 맛집을 학생들끼리 공유하고 실시간 빈자리 확인하는 앱",
    screenType: "input" as const, accent: "blue",
  },
  {
    time: "0:12", label: "AI 기획서 생성", icon: "📋", emoji: "🤖",
    title: "AI가 1초 만에 완벽한 기획서를 뽑아요",
    subtitle: "기능, 화면, 시나리오까지 전부 자동",
    typeText: "핵심 기능 4개, 화면 구조 4개, 사용자 시나리오 5개를 자동으로 설계했어요!",
    screenType: "plan" as const, accent: "violet",
  },
  {
    time: "0:28", label: "치트키 복사", icon: "✨", emoji: "📋",
    title: "복사 → 붙여넣기 → 코드 완성!",
    subtitle: "코딩 지식 0으로도 가능합니다",
    typeText: "v0.dev, Cursor, Supabase 전용 프롬프트가 자동 생성됩니다",
    screenType: "cheat" as const, accent: "emerald",
  },
  {
    time: "0:42", label: "배포 완료!", icon: "🚀", emoji: "🎉",
    title: "전 세계 누구나 접속 가능!",
    subtitle: "총 비용 0원으로 내 서비스 탄생",
    typeText: "my-vibe-app.vercel.app",
    screenType: "deploy" as const, accent: "amber",
  },
];

// ── 아이콘 ──
function SunIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
}
function MoonIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
}

// ── 플로팅 파티클 ──
function FloatingParticles({ isDark }: { isDark: boolean }) {
  if (!isDark) return null;
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i, size: 2 + Math.random() * 3,
    x: Math.random() * 100, y: Math.random() * 100,
    duration: 15 + Math.random() * 20, delay: Math.random() * 10,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-white/10 animate-float-particle"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

// ── 데모 모크 화면 ──
function VideoScreen({ type, isDark, typedText, isActive }: { type: string; isDark: boolean; typedText: string; isActive: boolean }) {
  const fadeClass = `transition-all duration-500 ${isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`;

  if (type === "input") {
    return (
      <div className={`space-y-3 ${fadeClass}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-blue-400/60" : "text-blue-500/60"}`}>Step 1 · 아이디어 입력</span>
        </div>
        <div className="flex gap-1.5">
          {["🌐 Web", "📱 iOS", "💻 Cross"].map((p, i) => (
            <div key={p} className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${i === 0 ? isDark ? "bg-blue-500/30 text-blue-300 ring-1 ring-blue-500/50" : "bg-blue-100 text-blue-700 ring-1 ring-blue-300" : isDark ? "bg-white/5 text-white/20" : "bg-slate-50 text-slate-300"}`}>{p}</div>
          ))}
        </div>
        <div className={`rounded-xl border-2 p-3 min-h-[60px] transition-all ${isDark ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-500/10" : "border-blue-300 bg-blue-50/50 shadow-md shadow-blue-100"}`}>
          <p className={`text-[11px] leading-relaxed ${isDark ? "text-blue-200" : "text-blue-700"}`}>
            {typedText}<span className={`inline-block w-0.5 h-3.5 ml-0.5 animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-600"}`} />
          </p>
        </div>
        <div className={`h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white gap-1.5 ${isDark ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30" : "bg-blue-500 shadow-md shadow-blue-200"}`}>
          <span className="animate-pulse">⚡</span> AI 설계도 뽑기 →
        </div>
      </div>
    );
  }

  if (type === "plan") {
    return (
      <div className={`space-y-2 ${fadeClass}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-violet-400" : "bg-violet-500"}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-violet-400/60" : "text-violet-500/60"}`}>Step 2 · 기획서 생성 완료</span>
        </div>
        <div className={`p-2.5 rounded-xl border ${isDark ? "bg-violet-500/10 border-violet-500/20 shadow-lg shadow-violet-500/5" : "bg-violet-50 border-violet-200 shadow-md shadow-violet-100"}`}>
          <div className={`text-[9px] font-bold ${isDark ? "text-violet-400" : "text-violet-600"}`}>😇 AI 멘토</div>
          <div className={`text-[10px] mt-0.5 leading-relaxed ${isDark ? "text-white/60" : "text-slate-600"}`}>
            {typedText}<span className={`inline-block w-0.5 h-3 ml-0.5 animate-pulse ${isDark ? "bg-violet-400" : "bg-violet-500"}`} />
          </div>
        </div>
        {[
          { icon: "🎯", label: "문제 정의" },
          { icon: "⚙️", label: "핵심 기능 4개" },
          { icon: "📱", label: "화면 구조 4개" },
          { icon: "👤", label: "시나리오 5개" },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
            <span className="flex items-center gap-1.5">{item.icon} {item.label}</span>
            <span className={`font-bold flex items-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 완성
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cheat") {
    return (
      <div className={`space-y-2 ${fadeClass}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-400/60" : "text-emerald-500/60"}`}>Step 3 · 복사 치트키</span>
        </div>
        <div className={`text-[10px] leading-relaxed mb-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>
          {typedText}<span className={`inline-block w-0.5 h-3 ml-0.5 animate-pulse ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
        </div>
        {[
          { label: "🎨 v0.dev 디자인", status: "복사됨 ✓", active: true },
          { label: "💻 Cursor 코드", status: "복사 대기", active: false },
          { label: "🗄️ Supabase SQL", status: "복사 대기", active: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${item.active ? isDark ? "border-emerald-500/30 bg-emerald-500/10 shadow-md shadow-emerald-500/10" : "border-emerald-200 bg-emerald-50 shadow-sm" : isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
            <span className={`text-[10px] font-bold ${item.active ? isDark ? "text-emerald-300" : "text-emerald-700" : isDark ? "text-white/30" : "text-slate-400"}`}>{item.label}</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${item.active ? isDark ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-100 text-emerald-700" : isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-300"}`}>{item.status}</span>
          </div>
        ))}
        <div className={`p-2 rounded-lg font-mono text-[8px] leading-relaxed ${isDark ? "bg-[#0d1117] text-emerald-400 border border-white/5" : "bg-slate-900 text-emerald-400"}`}>
          <span className="text-slate-500">CREATE TABLE</span> restaurants (<br />
          &nbsp;&nbsp;id <span className="text-blue-400">UUID</span> PRIMARY KEY,<br />
          &nbsp;&nbsp;name <span className="text-blue-400">TEXT</span> NOT NULL<br />
          );
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 py-3 ${fadeClass}`}>
      <div className="relative">
        <div className="text-4xl animate-bounce">🎉</div>
        <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${isDark ? "bg-amber-500" : "bg-amber-400"}`} />
      </div>
      <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>배포 성공!</div>
      <div className={`text-[10px] ${isDark ? "text-white/40" : "text-slate-400"}`}>전 세계 누구나 접속 가능</div>
      <div className={`font-mono text-[10px] px-3 py-1.5 rounded-lg font-bold ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10" : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-md shadow-emerald-100"}`}>
        🌐 {typedText}<span className={`inline-block w-0.5 h-3 ml-0.5 animate-pulse ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
      </div>
      <div className={`text-[10px] font-bold ${isDark ? "text-amber-400" : "text-amber-600"}`}>💰 총 비용: 0원</div>
      <div className="flex gap-1.5 mt-1">
        {["✓ Vercel", "✓ Supabase", "✓ GitHub"].map((t) => (
          <span key={t} className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-500"}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── 가짜 영상 플레이어 ──
function FakeVideoPlayer({ isDark }: { isDark: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const STEP_DURATION = 8000;
  const TOTAL_DURATION = STEP_DURATION * VIDEO_STEPS.length;

  const currentStepData = VIDEO_STEPS[currentStep];
  const typedText = useTypewriter(currentStepData.typeText, isPlaying && hasStarted, 30);

  const stopAll = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) { setIsPlaying(false); stopAll(); return; }
    setIsPlaying(true);
    setHasStarted(true);
    let elapsed = (progress / 100) * TOTAL_DURATION;
    if (elapsed >= TOTAL_DURATION) { elapsed = 0; setProgress(0); setCurrentStep(0); }
    progressRef.current = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      setProgress(newProgress);
      setCurrentStep(Math.min(Math.floor(elapsed / STEP_DURATION), VIDEO_STEPS.length - 1));
      if (elapsed >= TOTAL_DURATION) { setIsPlaying(false); setProgress(100); clearInterval(progressRef.current!); }
    }, 100);
  }, [isPlaying, progress, TOTAL_DURATION, STEP_DURATION, stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const handleStepClick = (idx: number) => {
    stopAll(); setCurrentStep(idx);
    setProgress((idx / VIDEO_STEPS.length) * 100);
    setIsPlaying(false); setHasStarted(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newProgress = Math.max(0, Math.min(100, ratio * 100));
    stopAll(); setProgress(newProgress);
    setCurrentStep(Math.min(Math.floor((newProgress / 100) * VIDEO_STEPS.length), VIDEO_STEPS.length - 1));
    setIsPlaying(false); setHasStarted(true);
  };

  const currentTime = `0:${String(Math.floor((progress / 100) * 42)).padStart(2, "0")}`;

  const accentColors: Record<string, { bg: string; text: string; ring: string; glow: string; grad: string }> = {
    blue: { bg: "bg-blue-500", text: "text-blue-400", ring: "ring-blue-500/50", glow: "shadow-blue-500/20", grad: "from-blue-600 to-blue-500" },
    violet: { bg: "bg-violet-500", text: "text-violet-400", ring: "ring-violet-500/50", glow: "shadow-violet-500/20", grad: "from-violet-600 to-violet-500" },
    emerald: { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/50", glow: "shadow-emerald-500/20", grad: "from-emerald-600 to-emerald-500" },
    amber: { bg: "bg-amber-500", text: "text-amber-400", ring: "ring-amber-500/50", glow: "shadow-amber-500/20", grad: "from-amber-600 to-amber-500" },
  };
  const ac = accentColors[currentStepData.accent] || accentColors.blue;

  return (
    <div className={`w-full max-w-4xl mx-auto overflow-hidden transition-all duration-500 ${
      isDark
        ? "rounded-2xl border border-white/10 bg-gradient-to-b from-[#12122a] to-[#0a0a1a] shadow-2xl shadow-black/60"
        : "rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
    }`}>

      {/* 타이틀바 */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-sm shadow-red-500/30" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e] shadow-sm shadow-yellow-500/30" />
          <div className="h-3 w-3 rounded-full bg-[#28c840] shadow-sm shadow-green-500/30" />
        </div>
        <div className={`flex-1 text-center text-[10px] font-semibold tracking-wider ${isDark ? "text-white/20" : "text-slate-300"}`}>
          VIBE PROJECT — 워크스페이스 데모
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`} />
          <span className={`text-[9px] font-bold ${isDark ? "text-emerald-400/60" : "text-emerald-600/60"}`}>LIVE</span>
        </div>
      </div>

      {/* 타임라인 스텝 바 */}
      <div className={`flex border-b relative ${isDark ? "border-white/10" : "border-slate-100"}`}>
        <div className={`absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
        <div className={`absolute top-1/2 left-0 h-px -translate-y-1/2 transition-all duration-500 ${isDark ? `bg-gradient-to-r ${ac.grad}` : "bg-blue-500"}`}
          style={{ width: `${((currentStep + 1) / VIDEO_STEPS.length) * 100}%` }} />
        {VIDEO_STEPS.map((step, i) => {
          const isCurrentOrPast = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <button key={i} type="button" onClick={() => handleStepClick(i)}
              className={`flex-1 relative z-10 px-2 py-3 flex flex-col items-center gap-1.5 transition-all duration-300 ${isCurrent ? "scale-105" : "hover:scale-102"}`}>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                isCurrent
                  ? `${ac.bg} text-white shadow-lg ${ac.glow} ring-2 ${ac.ring}`
                  : isCurrentOrPast
                  ? isDark ? "bg-white/20 text-white" : "bg-slate-900 text-white"
                  : isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-300"
              }`}>
                {isCurrentOrPast && !isCurrent ? "✓" : step.icon}
              </div>
              <span className={`text-[9px] font-bold transition-all ${
                isCurrent ? isDark ? ac.text : "text-slate-900" : isDark ? "text-white/20" : "text-slate-300"
              }`}>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid md:grid-cols-2 min-h-[280px]">
        {/* 좌: 설명 */}
        <div className={`p-6 md:p-8 border-r flex flex-col justify-center ${isDark ? "border-white/10" : "border-slate-100"}`}>
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center text-center gap-5 py-4">
              <button type="button" onClick={handlePlay}
                className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isDark
                    ? "bg-gradient-to-br from-blue-600 to-violet-600 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50"
                    : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-300 hover:shadow-blue-400"
                }`}>
                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
                <svg viewBox="0 0 24 24" className="w-10 h-10 ml-1 text-white fill-current"><path d="M8 5v14l11-7z" /></svg>
              </button>
              <div>
                <p className={`text-sm font-bold ${isDark ? "text-white/70" : "text-slate-700"}`}>데모를 재생해보세요</p>
                <p className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>아이디어 → 기획서 → 복사 → 배포까지 42초</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 transition-all duration-500">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                isDark ? `bg-white/5 ${ac.text}` : "bg-blue-100 text-blue-600"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${ac.bg}`} />
                Step {currentStep + 1} of {VIDEO_STEPS.length}
              </div>
              <h3 className={`text-lg font-black leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                {currentStepData.title}
              </h3>
              <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {currentStepData.subtitle}
              </p>
              <div className="text-5xl py-1">{currentStepData.emoji}</div>
              <div className={`text-[10px] flex items-center gap-2 ${isDark ? "text-white/20" : "text-slate-300"}`}>
                <span>💡</span>
                <span>각 단계를 클릭하면 해당 화면으로 이동합니다</span>
              </div>
            </div>
          )}
        </div>

        {/* 우: 모크 화면 */}
        <div className={`p-5 flex items-center ${isDark ? "bg-white/[0.015]" : "bg-slate-50/80"}`}>
          {!hasStarted ? (
            <div
              className={`w-full h-full min-h-[220px] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02] ${isDark ? "border-white/10 hover:border-white/20" : "border-slate-200 hover:border-slate-300"}`}
              onClick={handlePlay}>
              <div className="text-center">
                <div className="text-3xl mb-2 opacity-30">🖥️</div>
                <p className={`text-[10px] ${isDark ? "text-white/15" : "text-slate-300"}`}>▶ 클릭하여 시작</p>
              </div>
            </div>
          ) : (
            <div className={`w-full rounded-xl border p-4 min-h-[220px] transition-all duration-300 ${
              isDark ? `border-white/10 bg-white/[0.03] shadow-xl ${ac.glow}` : "border-slate-200 bg-white shadow-lg shadow-slate-100"
            }`}>
              <div className={`flex items-center gap-1.5 mb-3 pb-2 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
                <div className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/60" />
                <div className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
                <span className={`text-[8px] ml-1 ${isDark ? "text-white/15" : "text-slate-300"}`}>workspace</span>
              </div>
              <VideoScreen type={currentStepData.screenType} isDark={isDark} typedText={typedText} isActive={hasStarted} />
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className={`px-5 pb-4 pt-3 border-t ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"}`}>
        {/* 프로그레스 바 */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-[10px] font-mono font-bold w-7 shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`}>{currentTime}</span>
          <div className={`flex-1 h-1.5 rounded-full cursor-pointer relative group transition-all hover:h-2.5 ${isDark ? "bg-white/10" : "bg-slate-200"}`}
            onClick={handleProgressClick}>
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${isDark ? "bg-white/5" : "bg-slate-300/50"}`}
              style={{ width: `${Math.min(progress + 15, 100)}%` }} />
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-150 ${isDark ? `bg-gradient-to-r ${ac.grad}` : "bg-blue-500"}`}
              style={{ width: `${progress}%` }} />
            <div className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? `border-violet-500 shadow-violet-500/30` : "border-blue-500 shadow-blue-500/30"}`}
              style={{ left: `calc(${progress}% - 7px)` }} />
          </div>
          <span className={`text-[10px] font-mono font-bold w-7 shrink-0 text-right ${isDark ? "text-white/30" : "text-slate-400"}`}>0:42</span>
        </div>

        {/* 버튼들 */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePlay}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
              isDark
                ? `bg-gradient-to-br ${ac.grad} text-white shadow-lg ${ac.glow} hover:opacity-90`
                : "bg-slate-900 text-white shadow-lg hover:bg-slate-700"
            }`}>
            {isPlaying
              ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current ml-0.5"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>

          <button type="button" onClick={() => { stopAll(); setCurrentStep(0); setProgress(0); setIsPlaying(false); }}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110 ${isDark ? "text-white/30 hover:text-white/70" : "text-slate-300 hover:text-slate-600"}`}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>

          <div className={`flex-1 text-[10px] font-bold ${isDark ? "text-white/20" : "text-slate-300"}`}>
            {isPlaying ? (
              <span className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`inline-block h-2.5 w-0.5 rounded-full animate-bounce ${isDark ? ac.bg : "bg-blue-500"}`}
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                재생 중
              </span>
            ) : hasStarted ? "일시정지" : "데모 42초"}
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-400"}`}>HD</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-400"}`}>4 Steps</span>
          </div>

          <a href="/workspace" className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${
            isDark
              ? `bg-gradient-to-r ${ac.grad} text-white shadow-lg ${ac.glow} hover:opacity-90`
              : "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700"
          }`}>
            직접 해보기 →
          </a>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════
export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibe-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
  }, []);

  const isDark = theme === "dark";
  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("vibe-theme", nextTheme);
  };

  const statsReveal = useScrollReveal();
  const videoReveal = useScrollReveal();
  const compareReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const howReveal = useScrollReveal();
  const forYouReveal = useScrollReveal();
  const faqReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const stat1 = useCountUp(1, statsReveal.isVisible, 1200);
  const stat2 = useCountUp(0, statsReveal.isVisible, 1200);
  const stat3 = useCountUp(16, statsReveal.isVisible, 1800);
  const stat4 = useCountUp(4, statsReveal.isVisible, 1500);

  const revealClass = (visible: boolean) =>
    `transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`;

  return (
    <main id="top" className={`relative min-h-screen overflow-hidden antialiased transition-colors duration-500 ${isDark ? "bg-[#080812] text-white" : "bg-white text-slate-900"}`}>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .anim-fiu { animation: fadeInUp 0.7s ease-out forwards; opacity:0; }
        @keyframes float-p { 0%,100%{transform:translateY(0) translateX(0);opacity:0;} 10%{opacity:1;} 90%{opacity:1;} 50%{transform:translateY(-60px) translateX(20px);} }
        .animate-float-particle { animation: float-p ease-in-out infinite; }
      `}</style>

      {isDark && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute -right-40 top-60 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>
      )}

      {/* ── 헤더 ── */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-500 ${isDark ? "border-white/5 bg-[#080812]/80" : "border-slate-100 bg-white/90"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <a href="#top" className={`text-base font-extrabold tracking-tight md:text-lg ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"}`}>
            VIBE PROJECT
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {[
              { href: "/learn", label: "학습하기" },
              { href: "#demo", label: "데모 보기" },
              { href: "#features", label: "학습 기능" },
              { href: "#how", label: "사용 방법" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a key={link.href} href={link.href} className={`text-sm font-medium transition ${isDark ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex overflow-hidden rounded-full border p-1 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10"}`}><SunIcon /></button>
              <button type="button" onClick={() => handleThemeChange("dark")} className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}><MoonIcon /></button>
            </div>
            <a href="/workspace" className={`hidden rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition md:block lg:px-5 lg:py-2.5 ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-900/40 hover:opacity-90" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"}`}>
              START
            </a>
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <section className="relative z-10 overflow-hidden px-4 pb-24 pt-16 text-center md:pb-28 md:pt-36">
        <FloatingParticles isDark={isDark} />
        {!isDark && (
          <>
            <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "72px 72px" }} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/70 via-white to-white" />
            <div className="absolute -left-16 top-10 -z-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="absolute right-0 top-24 -z-10 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
          </>
        )}

        <div className="anim-fiu" style={{ animationDelay: "0s" }}>
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide ${isDark ? "border-white/10 bg-white/5 text-white/60 backdrop-blur" : "border-slate-200 bg-white text-slate-600 shadow-sm"}`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-blue-400" : "bg-blue-500"}`} />
            비전공자를 위한 실전 바이브 코딩 가이드
          </div>
        </div>

        <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-7xl anim-fiu" style={{ animationDelay: "0.1s" }}>
          오늘 떠오른 아이디어,<br />
          <span className={isDark ? "bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent" : "text-blue-600"}>
            오늘 안에 완성하세요.
          </span>
        </h1>

        <p className={`mx-auto mt-6 max-w-2xl text-xl font-medium md:text-2xl anim-fiu ${isDark ? "text-white/55" : "text-slate-500"}`} style={{ animationDelay: "0.2s" }}>
          비전공자도, 1일 만에, 진짜 프로토타입.
        </p>
        <p className={`mx-auto mt-3 max-w-2xl text-base leading-relaxed anim-fiu ${isDark ? "text-white/35" : "text-slate-400"}`} style={{ animationDelay: "0.3s" }}>
          AI와 대화하며 개발하는 바이브 코딩을 가장 쉽게 배웁니다.<br className="hidden md:block" />
          당신의 첫 웹앱, 여기서 시작하세요.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row anim-fiu" style={{ animationDelay: "0.4s" }}>
          <a href="/workspace" className={`group rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wide transition sm:text-base hover:scale-[1.02] ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl hover:opacity-90" : "bg-blue-600 text-white shadow-xl hover:bg-blue-700"}`}>
            바이브 코딩 시작하기 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a href="#demo" className={`rounded-full border px-8 py-3 text-sm font-bold uppercase tracking-wide transition sm:text-base hover:scale-[1.02] ${isDark ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"}`}>
            데모 먼저 보기 ▶
          </a>
        </div>

        {/* 채팅 미리보기 */}
        <div className={`mx-auto mt-20 max-w-2xl overflow-hidden rounded-[2rem] text-left anim-fiu ${isDark ? "border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl" : "border border-slate-200 bg-white shadow-2xl shadow-slate-200"}`} style={{ animationDelay: "0.5s" }}>
          <div className={`flex items-center gap-2 border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100 bg-slate-50"}`}>
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className={`ml-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-white/30" : "text-slate-400"}`}>VIBE PROJECT — AI 튜터</span>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex flex-row-reverse gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"}`}>나</div>
              <div className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm ${isDark ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-700"}`}>학교 근처 맛집을 공유하는 앱을 만들고 싶어요.</div>
            </div>
            <div className="flex gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isDark ? "bg-gradient-to-br from-blue-500 to-violet-500" : "bg-blue-600"}`}>AI</div>
              <div className={`max-w-sm rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white ${isDark ? "bg-gradient-to-br from-blue-600/80 to-violet-600/80" : "bg-blue-600"}`}>
                <p className="font-semibold">좋아요! AI에게는 이렇게 요청해보세요.</p>
                <p className={`mt-2 rounded-xl px-3 py-2 text-xs ${isDark ? "bg-white/10 text-white/80" : "bg-blue-700/50 text-blue-100"}`}>"사용자들이 사진과 별점을 남길 수 있는 맛집 리스트 웹앱을 React + Tailwind로 만들어줘."</p>
                <p className={`mt-2 text-xs ${isDark ? "text-white/50" : "text-blue-200"}`}>구체적인 요청이 더 좋은 결과를 만듭니다.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${isDark ? "bg-gradient-to-br from-blue-500 to-violet-500" : "bg-blue-600"}`}>AI</div>
              <div className={`inline-flex items-center rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"}`}>
                <span className="animate-pulse">입력 중...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 통계 ── */}
      <section ref={statsReveal.ref} className={`relative z-10 border-y py-14 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-white"}`}>
        <div className={`mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4 ${revealClass(statsReveal.isVisible)}`}>
          {[
            { value: `${stat1}일`, label: "프로토타입 완성 목표" },
            { value: `${stat2}줄`, label: "사전 코딩 지식 필요 없음" },
            { value: `${stat3}개`, label: "단계별 학습 레슨" },
            { value: `${stat4}단계`, label: "아이디어에서 배포까지" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl font-extrabold tracking-tight md:text-4xl ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-slate-900"}`}>{stat.value}</div>
              <p className={`mt-2 text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 영상 플레이어 데모 ── */}
      <section id="demo" ref={videoReveal.ref} className={`relative z-10 px-6 py-24 overflow-hidden ${isDark ? "" : "bg-slate-50"}`}>
        {isDark && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
            <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
          </div>
        )}
        <div className={`mx-auto max-w-4xl relative ${revealClass(videoReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${isDark ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              인터랙티브 데모
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              42초 만에 보는
              <span className={`ml-2 ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-blue-600"}`}>전체 과정</span>
            </h2>
            <p className={`mt-4 text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
              재생 버튼을 눌러 아이디어 입력부터 전세계 배포까지 직접 체험해보세요.
            </p>
          </div>

          <FakeVideoPlayer isDark={isDark} />

          <div className="mt-8 text-center">
            <p className={`text-xs mb-4 ${isDark ? "text-white/30" : "text-slate-400"}`}>마음에 드시나요? 지금 바로 시작해보세요.</p>
            <div className="flex justify-center gap-3">
              <a href="/workspace" className={`inline-flex items-center gap-2 text-sm font-bold transition hover:scale-[1.02] px-6 py-3 rounded-xl text-white ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-violet-500/20 hover:opacity-90" : "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700"}`}>
                바이브 코딩 시작하기 →
              </a>
              <a href="/learn" className={`inline-flex items-center gap-2 text-sm font-bold transition hover:scale-[1.02] px-6 py-3 rounded-xl border ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                먼저 배워보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section ref={compareReveal.ref} className="relative z-10 px-6 py-24">
        <div className={`mx-auto max-w-5xl ${revealClass(compareReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-violet-400" : "text-blue-600"}`}>Before & After</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">바이브코딩이 바꾸는 것들</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`rounded-3xl border p-8 relative overflow-hidden ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"}`}>
              <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-500"}`}>😰 Before</div>
              <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-red-400" : "text-red-600"}`}>기존 방식</h3>
              <div className="space-y-4">
                {[
                  { icon: "💸", label: "개발 외주비", value: "300~1000만원" },
                  { icon: "📚", label: "코딩 공부 기간", value: "3~6개월" },
                  { icon: "😵", label: "기획서 작성", value: "2~3주 소요" },
                  { icon: "🚫", label: "에러 발생 시", value: "구글링 지옥" },
                  { icon: "😢", label: "포기 확률", value: "매우 높음" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-white/60" : "text-slate-600"}`}>{item.icon} {item.label}</span>
                    <span className={`text-sm font-bold ${isDark ? "text-red-400" : "text-red-500"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`rounded-3xl border p-8 relative overflow-hidden ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
              <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>😎 After</div>
              <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>바이브코딩</h3>
              <div className="space-y-4">
                {[
                  { icon: "💰", label: "총 비용", value: "0원 (무료)" },
                  { icon: "⚡", label: "프로토타입 완성", value: "하루면 충분" },
                  { icon: "🤖", label: "기획서 작성", value: "AI가 1초에 생성" },
                  { icon: "🛡️", label: "에러 발생 시", value: "AI 해결사 즉시 호출" },
                  { icon: "🎉", label: "완성 확률", value: "매우 높음" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-white/60" : "text-slate-600"}`}>{item.icon} {item.label}</span>
                    <span className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 ── */}
      <section id="features" ref={featuresReveal.ref} className={`relative z-10 px-6 py-24 ${isDark ? "" : "bg-slate-50"}`}>
        <div className={`mx-auto max-w-6xl ${revealClass(featuresReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-violet-400" : "text-blue-600"}`}>Features</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              단순한 도구가 아닙니다.<br />
              <span className={isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : ""}>당신의 첫 바이브 코딩 튜터입니다.</span>
            </h2>
            <p className={`mt-4 text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
              비전공자가 처음 AI로 개발을 시도할 때 막막한 지점들을 짚어주고, 스스로 아이디어를 구현할 수 있도록 단계별로 안내합니다.
            </p>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, i) => (
              <div key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:scale-[1.02] ${isDark ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20 hover:bg-white/10" : "border-slate-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-xl"}`}
                style={{ transitionDelay: `${i * 50}ms` }}>
                {isDark && <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${isDark ? `bg-gradient-to-br ${feature.gradient} text-white shadow-lg` : "bg-blue-50 text-blue-600"}`}>{feature.icon}</div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{feature.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${isDark ? "text-white/50" : "text-slate-500"}`}>{feature.description}</p>
              </div>
            ))}
          </div>
          <div className={`mt-12 rounded-3xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-blue-100 bg-blue-50"}`}>
            <p className={`mb-2 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>이 모든 걸 직접 배우고 싶으신가요?</p>
            <p className={`mb-6 text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>16개 레슨과 AI 튜터가 기다리고 있어요.</p>
            <a href="/learn" className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90" : "bg-blue-600 hover:bg-blue-700"}`}>
              바이브 코딩 학습 시작하기 →
            </a>
          </div>
        </div>
      </section>

      {/* ── 사용 방법 ── */}
      <section id="how" ref={howReveal.ref} className="relative z-10 px-6 py-24">
        <div className={`mx-auto max-w-6xl ${revealClass(howReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-violet-400" : "text-blue-600"}`}>How It Works</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">4단계면 충분합니다.</h2>
            <p className={`mt-4 text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>복잡한 이론 강의는 줄이고, 내 아이디어를 실제로 구현하는 과정 자체를 하나의 학습 경험으로 설계했습니다.</p>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:scale-[1.02] ${isDark ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20" : "border-slate-200 bg-white shadow-sm hover:shadow-xl"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                {isDark && <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${step.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />}
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className={`text-3xl font-extrabold ${isDark ? `bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent` : "text-blue-600"}`}>{step.number}</div>
                <h3 className={`mt-4 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{step.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${isDark ? "text-white/50" : "text-slate-500"}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 대상 ── */}
      <section ref={forYouReveal.ref} className={`relative z-10 px-6 py-24 ${isDark ? "" : "bg-slate-50"}`}>
        <div className={`mx-auto max-w-6xl ${revealClass(forYouReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-violet-400" : "text-blue-600"}`}>For You</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">이런 분들을 위해 만들었습니다.</h2>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {userTypes.map((user, i) => (
              <div key={user.title}
                className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:scale-[1.02] ${isDark ? "border-white/10 bg-white/5 backdrop-blur hover:border-white/20" : "border-slate-200 bg-white shadow-sm hover:shadow-xl"}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                {isDark && <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${user.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />}
                <div className="text-4xl mb-4">{user.icon}</div>
                <div className={`h-1 w-12 rounded-full ${isDark ? `bg-gradient-to-r ${user.gradient}` : "bg-blue-600"}`} />
                <h3 className={`mt-6 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${isDark ? "text-white/50" : "text-slate-500"}`}>{user.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" ref={faqReveal.ref} className="relative z-10 px-6 py-24">
        <div className={`mx-auto max-w-3xl ${revealClass(faqReveal.isVisible)}`}>
          <div className="text-center">
            <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-violet-400" : "text-blue-600"}`}>FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">자주 묻는 질문</h2>
          </div>
          <div className="mt-16 space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${openFaq === i ? isDark ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50/50 shadow-md" : isDark ? "border-white/10 bg-white/5 hover:border-white/20" : "border-slate-200 bg-white hover:shadow-md"}`}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left">
                  <span className={`font-semibold pr-4 ${isDark ? "text-white" : "text-slate-900"}`}>{faq.question}</span>
                  <span className={`shrink-0 text-xl transition-transform duration-300 ${openFaq === i ? "rotate-45" : ""} ${isDark ? "text-white/30" : "text-slate-400"}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 pb-5" : "max-h-0"}`}>
                  <p className={`px-6 text-sm leading-7 ${isDark ? "text-white/50" : "text-slate-500"}`}>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" ref={ctaReveal.ref} className="relative z-10 px-6 py-32 text-center">
        <div className={`relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-8 py-20 ${revealClass(ctaReveal.isVisible)} ${isDark ? "border border-white/10 bg-white/5 backdrop-blur-xl" : "bg-slate-900 shadow-2xl"}`}>
          {isDark ? (
            <><div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" /><div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" /></>
          ) : (
            <><div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" /><div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" /></>
          )}
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            당신의 첫 웹앱,<br />
            <span className={isDark ? "bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent" : "text-blue-400"}>여기서 시작하세요.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg leading-8 text-white/60">
            막연했던 아이디어를 바이브 코딩으로 현실로 만들어보세요.<br />지금 바로 첫 프로토타입을 시작할 수 있습니다.
          </p>
          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/workspace" className={`group rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:scale-[1.02] ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-2xl hover:opacity-90" : "bg-blue-600 shadow-lg hover:bg-blue-500"}`}>
              무료로 시작하기 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a href="/learn" className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/70 transition hover:bg-white/10 hover:scale-[1.02]">
              바이브 코딩 배우기
            </a>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className={`relative z-10 border-t px-6 py-10 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-sm font-bold text-transparent">VIBE PROJECT</span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>누구나 자신의 아이디어를 현실로 구현하도록</span>
          <span className={`text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>비전공자를 위한 실전 바이브 코딩 교육 웹앱</span>
        </div>
      </footer>
    </main>
  );
}
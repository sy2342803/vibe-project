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

// ── 스토리 장면 데이터 ──
const STORY_SCENES = [
  { type: "story-intro" as const, duration: 4000, label: "시작" },
  { type: "zoom-in" as const, duration: 1500, label: "접속" },
  { type: "step" as const, duration: 3000, label: "아이디어", step: { num: 1, icon: "💡", title: "아이디어 입력", typeText: "학교 근처 맛집 공유 + 빈자리 확인 앱", accent: "blue" } },
  { type: "step" as const, duration: 3000, label: "기획서", step: { num: 2, icon: "📋", title: "AI 기획서 생성", typeText: "기능 4개, 화면 4개, 시나리오 5개 자동 완성!", accent: "violet" } },
  { type: "step" as const, duration: 3000, label: "치트키", step: { num: 3, icon: "✨", title: "복사 → 붙여넣기", typeText: "v0 · Cursor · Supabase 프롬프트 복사 완료", accent: "emerald" } },
  { type: "step" as const, duration: 3000, label: "배포!", step: { num: 4, icon: "🚀", title: "전세계 배포 완료!", typeText: "my-app.vercel.app · 비용 0원", accent: "amber" } },
  { type: "zoom-out" as const, duration: 1500, label: "완성" },
  { type: "story-outro" as const, duration: 4000, label: "끝!" },
];

const TOTAL_STORY_DURATION = STORY_SCENES.reduce((sum, s) => sum + s.duration, 0);

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

// ── 스토리텔링 데모 플레이어 ──
function StoryVideoPlayer({ isDark }: { isDark: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const getCurrentScene = useCallback((ms: number) => {
    let acc = 0;
    for (let i = 0; i < STORY_SCENES.length; i++) {
      acc += STORY_SCENES[i].duration;
      if (ms < acc) {
        const sceneStart = acc - STORY_SCENES[i].duration;
        const sceneProgress = (ms - sceneStart) / STORY_SCENES[i].duration;
        return { index: i, scene: STORY_SCENES[i], progress: sceneProgress };
      }
    }
    const last = STORY_SCENES.length - 1;
    return { index: last, scene: STORY_SCENES[last], progress: 1 };
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) { setIsPlaying(false); stopTimer(); return; }
    let current = elapsed >= TOTAL_STORY_DURATION ? 0 : elapsed;
    if (current === 0) setElapsed(0);
    setIsPlaying(true);
    setHasStarted(true);
    timerRef.current = setInterval(() => {
      current += 80;
      if (current >= TOTAL_STORY_DURATION) {
        setElapsed(TOTAL_STORY_DURATION);
        setIsPlaying(false);
        stopTimer();
      } else {
        setElapsed(current);
      }
    }, 80);
  }, [isPlaying, elapsed, stopTimer]);

  const handleRestart = useCallback(() => {
    stopTimer(); setElapsed(0); setIsPlaying(false);
  }, [stopTimer]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    stopTimer();
    setElapsed(Math.floor(ratio * TOTAL_STORY_DURATION));
    setIsPlaying(false);
    setHasStarted(true);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const { index: sceneIndex, scene: currentScene, progress: sceneProgress } = getCurrentScene(elapsed);
  const overallProgress = (elapsed / TOTAL_STORY_DURATION) * 100;
  const currentTime = `0:${String(Math.floor((elapsed / TOTAL_STORY_DURATION) * 23)).padStart(2, "0")}`;

  const getTypedText = (fullText: string, progress: number) => {
    const chars = Math.floor(fullText.length * Math.min(progress * 2, 1));
    return fullText.slice(0, chars);
  };

  const getSceneStartPercent = (idx: number) => {
    let acc = 0;
    for (let i = 0; i < idx; i++) acc += STORY_SCENES[i].duration;
    return (acc / TOTAL_STORY_DURATION) * 100;
  };

  const accentMap: Record<string, { darkBg: string; darkBorder: string; darkText: string; lightBg: string; lightBorder: string; lightText: string; cursor: string }> = {
    blue: { darkBg: "bg-blue-500/10", darkBorder: "border-blue-500/30", darkText: "text-blue-400", lightBg: "bg-blue-50", lightBorder: "border-blue-200", lightText: "text-blue-600", cursor: "bg-blue-500" },
    violet: { darkBg: "bg-violet-500/10", darkBorder: "border-violet-500/30", darkText: "text-violet-400", lightBg: "bg-violet-50", lightBorder: "border-violet-200", lightText: "text-violet-600", cursor: "bg-violet-500" },
    emerald: { darkBg: "bg-emerald-500/10", darkBorder: "border-emerald-500/30", darkText: "text-emerald-400", lightBg: "bg-emerald-50", lightBorder: "border-emerald-200", lightText: "text-emerald-600", cursor: "bg-emerald-500" },
    amber: { darkBg: "bg-amber-500/10", darkBorder: "border-amber-500/30", darkText: "text-amber-400", lightBg: "bg-amber-50", lightBorder: "border-amber-200", lightText: "text-amber-600", cursor: "bg-amber-500" },
  };

  // ── 장면 렌더링 ──
  const renderScene = () => {

    // 오프닝
    if (currentScene.type === "story-intro") {
      const fadeIn = Math.min(sceneProgress * 3, 1);
      const textDelay = Math.max(0, (sceneProgress - 0.3) * 2);
      const bubbleDelay = Math.max(0, (sceneProgress - 0.5) * 3);
      const cta = Math.max(0, (sceneProgress - 0.75) * 4);
      return (
        <div className="flex items-center justify-center h-full" style={{ opacity: fadeIn }}>
          <div className="text-center space-y-4 px-6">
            <div className="flex items-end justify-center gap-4 mb-2">
              {[
                { emoji: "😰", label: "경영학과", delay: "0s" },
                { emoji: "🤔", label: "디자인과", delay: "0.3s", big: true },
                { emoji: "😩", label: "창업동아리", delay: "0.6s" },
              ].map((c, i) => (
                <div key={i} className="flex flex-col items-center" style={{ transform: `translateY(${(1 - fadeIn) * 24}px)`, transition: "transform 0.5s" }}>
                  <div className={`animate-bounce ${c.big ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"} mb-1`} style={{ animationDelay: c.delay, animationDuration: "2s" }}>{c.emoji}</div>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400"}`}>{c.label}</div>
                </div>
              ))}
            </div>
            <div style={{ opacity: Math.min(textDelay, 1) }}>
              <p className={`text-sm md:text-base font-bold ${isDark ? "text-white/80" : "text-slate-700"}`}>"아이디어는 있는데..."</p>
              <p className={`text-xs md:text-sm mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>"코딩을 몰라서 만들 수가 없어 😢"</p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap" style={{ opacity: Math.min(bubbleDelay, 1) }}>
              {["외주 300만원?!", "6개월 공부?", "포기할까..."].map((text, i) => (
                <span key={i} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-500 border border-red-200"}`}>{text}</span>
              ))}
            </div>
            <div style={{ opacity: Math.min(cta, 1) }}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${isDark ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                <span className="text-base">💻</span>잠깐, 이런 게 있다면...?
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 줌인
    if (currentScene.type === "zoom-in") {
      const scale = 0.2 + sceneProgress * 0.8;
      const br = 28 * (1 - sceneProgress);
      return (
        <div className="flex items-center justify-center h-full">
          <div className={`overflow-hidden border transition-all ${isDark ? "bg-[#0a0a16] border-white/10" : "bg-white border-slate-200 shadow-xl"}`}
            style={{ transform: `scale(${scale})`, borderRadius: `${br}px`, opacity: 0.4 + sceneProgress * 0.6, width: "280px" }}>
            <div className={`flex items-center gap-1.5 px-3 py-2 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <div className="h-2 w-2 rounded-full bg-red-400" /><div className="h-2 w-2 rounded-full bg-yellow-400" /><div className="h-2 w-2 rounded-full bg-green-400" />
              <span className={`text-[8px] ml-1 font-bold ${isDark ? "text-white/20" : "text-slate-300"}`}>VIBE PROJECT</span>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className={`text-sm font-black ${isDark ? "text-white/60" : "text-slate-600"}`}>VIBE 바이브코딩</div>
              <div className={`text-[9px] mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>접속 중...</div>
              <div className={`mt-3 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all" style={{ width: `${sceneProgress * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 스텝
    if (currentScene.type === "step" && currentScene.step) {
      const step = currentScene.step;
      const ac = accentMap[step.accent] || accentMap.blue;
      const typed = getTypedText(step.typeText, sceneProgress);
      const enterAnim = Math.min(sceneProgress * 5, 1);
      return (
        <div className="flex items-center justify-center h-full px-6"
          style={{ opacity: enterAnim, transform: `translateY(${(1 - enterAnim) * 16}px)` }}>
          <div className="w-full max-w-md space-y-3">
            {/* 헤더 */}
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl border ${isDark ? `${ac.darkBg} ${ac.darkBorder}` : `${ac.lightBg} ${ac.lightBorder}`}`}>
                {step.icon}
              </div>
              <div>
                <div className={`text-[10px] font-bold ${isDark ? ac.darkText : ac.lightText}`}>Step {step.num} / 4</div>
                <div className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{step.title}</div>
              </div>
            </div>
            {/* 타이핑 */}
            <div className={`p-3.5 rounded-xl border ${isDark ? `${ac.darkBg} ${ac.darkBorder}` : `${ac.lightBg} ${ac.lightBorder}`}`}>
              <p className={`text-xs leading-relaxed font-medium ${isDark ? "text-white/70" : "text-slate-700"}`}>
                {typed}<span className={`inline-block w-0.5 h-3.5 ml-0.5 animate-pulse ${ac.cursor}`} />
              </p>
            </div>
            {/* 스텝 인디케이터 */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                  n < step.num
                    ? isDark ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40" : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : n === step.num
                    ? isDark ? `${ac.darkBg} ${ac.darkText} border ${ac.darkBorder}` : `${ac.lightBg} ${ac.lightText} border ${ac.lightBorder}`
                    : isDark ? "bg-white/5 text-white/20 border border-white/10" : "bg-slate-100 text-slate-300"
                }`}>
                  {n < step.num ? "✓" : n}
                </div>
              ))}
            </div>
            {/* 빠른감기 느낌 속도 표시 */}
            <div className="flex justify-center">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-400"}`}>⚡ 빠른감기 진행 중</span>
            </div>
          </div>
        </div>
      );
    }

    // 줌아웃 → 휴대폰
    if (currentScene.type === "zoom-out") {
      const shrink = 1 - sceneProgress * 0.65;
      const phoneAppear = Math.max(0, (sceneProgress - 0.4) * 2);
      const handAppear = Math.max(0, (sceneProgress - 0.6) * 3);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative flex flex-col items-center">
            <div className={`overflow-hidden border transition-all ${isDark ? "bg-[#0a0a16] border-white/10" : "bg-white border-slate-200 shadow-xl"}`}
              style={{ transform: `scale(${shrink})`, borderRadius: `${16 + sceneProgress * 20}px`, width: "200px" }}>
              <div className="p-4 text-center">
                <div className={`text-xs font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>✓ 배포 완료!</div>
                <div className={`text-[8px] mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>my-app.vercel.app</div>
                <div className={`text-[8px] font-bold mt-1 ${isDark ? "text-amber-400" : "text-amber-600"}`}>💰 0원</div>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: phoneAppear }}>
              <div className="text-6xl">📱</div>
            </div>
            <div className="mt-4 text-2xl" style={{ opacity: Math.min(handAppear, 1) }}>👇</div>
          </div>
        </div>
      );
    }

    // 엔딩 하이파이브
    if (currentScene.type === "story-outro") {
      const fadeIn = Math.min(sceneProgress * 2, 1);
      const bounce = Math.sin(sceneProgress * Math.PI * 4) * 6;
      const confettiOpacity = Math.max(0, (sceneProgress - 0.15) * 2);
      const badgeOpacity = Math.max(0, (sceneProgress - 0.4) * 2.5);
      return (
        <div className="flex items-center justify-center h-full relative overflow-hidden" style={{ opacity: fadeIn }}>
          {/* 컨페티 */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: confettiOpacity }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="absolute animate-bounce text-sm"
                style={{ left: `${5 + (i * 19) % 90}%`, top: `${5 + (i * 27) % 65}%`, animationDelay: `${(i * 0.1) % 0.8}s`, animationDuration: `${0.7 + (i % 3) * 0.25}s` }}>
                {["🎉", "✨", "🎊", "⭐", "💫", "🌟"][i % 6]}
              </div>
            ))}
          </div>
          <div className="text-center space-y-3 relative z-10 px-4">
            <div className="flex items-end justify-center gap-3">
              <div style={{ transform: `translateY(${bounce}px) rotate(-12deg)` }}><div className="text-4xl md:text-5xl">🙌</div></div>
              <div style={{ transform: `translateY(${-bounce * 1.2}px)` }}><div className="text-5xl md:text-6xl">🎉</div></div>
              <div style={{ transform: `translateY(${bounce}px) rotate(12deg)` }}><div className="text-4xl md:text-5xl">🙌</div></div>
            </div>
            <div>
              <p className={`text-base md:text-lg font-black ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-blue-600"}`}>
                우리가 만들었어! 🥹
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                코딩 0줄, 비용 0원, 단 하루 만에
              </p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap" style={{ opacity: Math.min(badgeOpacity, 1) }}>
              {[
                { emoji: "⚡", text: "하루 완성" },
                { emoji: "💰", text: "무료" },
                { emoji: "🌍", text: "전세계 배포" },
              ].map((badge, i) => (
                <span key={i} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                  {badge.emoji} {badge.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto overflow-hidden ${isDark ? "rounded-2xl border border-white/10 bg-gradient-to-b from-[#12122a] to-[#0a0a1a] shadow-2xl shadow-black/60" : "rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"}`}>

      {/* 타이틀바 */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className={`flex-1 text-center text-[10px] font-semibold tracking-wider ${isDark ? "text-white/20" : "text-slate-300"}`}>VIBE PROJECT — 하루 만에 앱 만드는 23초 스토리</div>
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? "bg-red-400" : "bg-red-500"}`} />
          <span className={`text-[9px] font-bold ${isDark ? "text-red-400/60" : "text-red-500/60"}`}>REC</span>
        </div>
      </div>

      {/* 메인 영상 영역 */}
      <div className={`relative min-h-[300px] md:min-h-[340px] ${isDark ? "bg-[#0a0a16]" : "bg-gradient-to-b from-slate-50 to-white"}`}>
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-5 px-6">
            <button type="button" onClick={handlePlay}
              className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gradient-to-br from-blue-600 to-violet-600 shadow-2xl shadow-violet-500/30" : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-300"}`}>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
              <svg viewBox="0 0 24 24" className="w-10 h-10 ml-1 text-white fill-current"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <div className="text-center">
              <p className={`text-sm font-bold ${isDark ? "text-white/70" : "text-slate-700"}`}>비전공자의 하루를 23초로 압축했어요</p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>▶ 재생 버튼을 눌러 스토리를 시작해보세요</p>
            </div>
          </div>
        ) : (
          <div className="min-h-[300px] md:min-h-[340px] flex items-center justify-center">
            {renderScene()}
          </div>
        )}
      </div>

      {/* 타임라인 + 컨트롤 */}
      <div className={`px-5 pb-4 pt-3 border-t ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"}`}>
        {/* 장면 라벨 */}
        <div className="flex mb-1.5">
          {STORY_SCENES.map((scene, i) => {
            const widthPct = (scene.duration / TOTAL_STORY_DURATION) * 100;
            const isActive = i === sceneIndex;
            const isPast = i < sceneIndex;
            return (
              <div key={i} className="text-center overflow-hidden" style={{ width: `${widthPct}%` }}>
                <span className={`text-[8px] font-bold truncate block transition-all ${isActive ? isDark ? "text-blue-400" : "text-blue-600" : isPast ? isDark ? "text-white/30" : "text-slate-400" : isDark ? "text-white/10" : "text-slate-200"}`}>
                  {scene.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 프로그레스 바 */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-[10px] font-mono font-bold w-7 shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`}>{currentTime}</span>
          <div className={`flex-1 h-1.5 rounded-full cursor-pointer relative group transition-all hover:h-2.5 ${isDark ? "bg-white/10" : "bg-slate-200"}`} onClick={handleProgressClick}>
            {STORY_SCENES.map((_, i) => {
              if (i === 0) return null;
              const pos = getSceneStartPercent(i);
              return <div key={i} className={`absolute top-0 bottom-0 w-px ${isDark ? "bg-white/10" : "bg-slate-300/40"}`} style={{ left: `${pos}%` }} />;
            })}
            <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${isDark ? "bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-violet-500"}`} style={{ width: `${overallProgress}%` }} />
            <div className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? "border-violet-500" : "border-blue-500"}`} style={{ left: `calc(${overallProgress}% - 7px)` }} />
          </div>
          <span className={`text-[10px] font-mono font-bold w-7 shrink-0 text-right ${isDark ? "text-white/30" : "text-slate-400"}`}>0:23</span>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePlay}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${isDark ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-slate-900 text-white shadow-lg hover:bg-slate-700"}`}>
            {isPlaying
              ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current ml-0.5"><path d="M8 5v14l11-7z" /></svg>
            }
          </button>
          <button type="button" onClick={handleRestart}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110 ${isDark ? "text-white/30 hover:text-white/70" : "text-slate-300 hover:text-slate-600"}`}>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>

          <div className={`flex-1 text-[10px] font-bold ${isDark ? "text-white/20" : "text-slate-300"}`}>
            {isPlaying ? (
              <span className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`inline-block h-2.5 w-0.5 rounded-full animate-bounce ${isDark ? "bg-violet-400" : "bg-blue-500"}`} style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
                재생 중
              </span>
            ) : hasStarted ? (elapsed >= TOTAL_STORY_DURATION ? "재생 완료 ✓" : "일시정지") : "23초 스토리 데모"}
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-400"}`}>HD</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/20" : "bg-slate-100 text-slate-400"}`}>Story</span>
          </div>

          <a href="/workspace" className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-105 ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700"}`}>
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
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        .anim-fiu{animation:fadeInUp 0.7s ease-out forwards;opacity:0;}
        @keyframes float-p{0%,100%{transform:translateY(0) translateX(0);opacity:0;}10%{opacity:1;}90%{opacity:1;}50%{transform:translateY(-60px) translateX(20px);}}
        .animate-float-particle{animation:float-p ease-in-out infinite;}
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
            {[{ href: "/learn", label: "학습하기" }, { href: "#demo", label: "데모 보기" }, { href: "#features", label: "학습 기능" }, { href: "#how", label: "사용 방법" }, { href: "#faq", label: "FAQ" }].map((link) => (
              <a key={link.href} href={link.href} className={`text-sm font-medium transition ${isDark ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>{link.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex overflow-hidden rounded-full border p-1 ${isDark ? "border-white/10 bg-white/10" : "border-slate-200 bg-white shadow-sm"}`}>
              <button type="button" onClick={() => handleThemeChange("light")} className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${!isDark ? "bg-white text-blue-600 shadow-sm" : "text-white/40 hover:bg-white/10"}`}><SunIcon /></button>
              <button type="button" onClick={() => handleThemeChange("dark")} className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${isDark ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}><MoonIcon /></button>
            </div>
            <a href="/workspace" className={`hidden rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition md:block lg:px-5 lg:py-2.5 ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-900/40 hover:opacity-90" : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"}`}>START</a>
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
          <span className={isDark ? "bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent" : "text-blue-600"}>오늘 안에 완성하세요.</span>
        </h1>
        <p className={`mx-auto mt-6 max-w-2xl text-xl font-medium md:text-2xl anim-fiu ${isDark ? "text-white/55" : "text-slate-500"}`} style={{ animationDelay: "0.2s" }}>
          비전공자도, 1일 만에, 진짜 프로토타입.
        </p>
        <p className={`mx-auto mt-3 max-w-2xl text-base leading-relaxed anim-fiu ${isDark ? "text-white/35" : "text-slate-400"}`} style={{ animationDelay: "0.3s" }}>
          AI와 대화하며 개발하는 바이브 코딩을 가장 쉽게 배웁니다.<br className="hidden md:block" />당신의 첫 웹앱, 여기서 시작하세요.
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
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" /><div className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><div className="h-2.5 w-2.5 rounded-full bg-green-400" />
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
              <div className={`inline-flex items-center rounded-2xl rounded-tl-sm px-4 py-3 text-sm ${isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"}`}><span className="animate-pulse">입력 중...</span></div>
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

      {/* ── 스토리텔링 데모 ── */}
      <section id="demo" ref={videoReveal.ref} className={`relative z-10 px-6 py-24 overflow-hidden ${isDark ? "" : "bg-slate-50"}`}>
        {isDark && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
            <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
          </div>
        )}
        <div className={`mx-auto max-w-4xl relative ${revealClass(videoReveal.isVisible)}`}>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${isDark ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-500 border border-red-200"}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              23초 스토리 데모
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              비전공자의 하루를
              <span className={`ml-2 ${isDark ? "bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent" : "text-blue-600"}`}>23초로 압축</span>
            </h2>
            <p className={`mt-4 text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>
              고민에서 시작해, 하루 만에 나만의 서비스를 완성하는 여정을 직접 체험해보세요.
            </p>
          </div>

          <StoryVideoPlayer isDark={isDark} />

          <div className="mt-8 text-center">
            <p className={`text-xs mb-4 ${isDark ? "text-white/30" : "text-slate-400"}`}>이 스토리의 주인공이 되어보세요.</p>
            <div className="flex justify-center gap-3">
              <a href="/workspace" className={`inline-flex items-center gap-2 text-sm font-bold transition hover:scale-[1.02] px-6 py-3 rounded-xl text-white ${isDark ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-violet-500/20 hover:opacity-90" : "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700"}`}>
                나도 시작하기 →
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
                {[{ icon: "💸", label: "개발 외주비", value: "300~1000만원" }, { icon: "📚", label: "코딩 공부 기간", value: "3~6개월" }, { icon: "😵", label: "기획서 작성", value: "2~3주 소요" }, { icon: "🚫", label: "에러 발생 시", value: "구글링 지옥" }, { icon: "😢", label: "포기 확률", value: "매우 높음" }].map((item) => (
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
                {[{ icon: "💰", label: "총 비용", value: "0원 (무료)" }, { icon: "⚡", label: "프로토타입 완성", value: "하루면 충분" }, { icon: "🤖", label: "기획서 작성", value: "AI가 1초에 생성" }, { icon: "🛡️", label: "에러 발생 시", value: "AI 해결사 즉시 호출" }, { icon: "🎉", label: "완성 확률", value: "매우 높음" }].map((item) => (
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
            <p className={`mt-4 text-base leading-7 ${isDark ? "text-white/40" : "text-slate-500"}`}>비전공자가 처음 AI로 개발을 시도할 때 막막한 지점들을 짚어주고, 스스로 아이디어를 구현할 수 있도록 단계별로 안내합니다.</p>
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
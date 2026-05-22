"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AnalyzeMode = "idle" | "ai" | "fallback";

interface ErrorGuide {
  title: string;
  meaning: string;
  firstChecks: string[];
  likelyFiles: string[];
  prompt: string;
}

interface AiErrorGuideData {
  cause?: string;
  explanation?: string;
  solution?: string;
  prompt?: string;
}

interface NormalizedAiResult {
  cause: string;
  explanation: string;
  solution: string;
  prompt: string;
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

function analyzeErrorFallback(message: string): ErrorGuide {
  const lower = message.toLowerCase();

  if (lower.includes("hydration")) {
    return {
      title: "화면이 서버에서 만든 결과와 브라우저 화면이 달라요",
      meaning:
        "Next.js에서 처음 만든 HTML과 브라우저에서 다시 그린 화면이 서로 다를 때 자주 발생합니다.",
      firstChecks: [
        "시간, 랜덤값, localStorage 값을 바로 화면에 쓰고 있는지 확인하세요.",
        "브라우저에서만 필요한 코드는 useEffect 안으로 옮기세요.",
        "다크모드처럼 사용자 환경에 따라 달라지는 값은 처음에는 기본값으로 보여준 뒤 useEffect에서 바꾸세요.",
      ],
      likelyFiles: ["app/page.tsx", "app/workspace/page.tsx", "app/result/page.tsx"],
      prompt:
        "Next.js hydration 에러가 났어. 서버에서 만든 화면과 브라우저에서 다시 그린 화면이 달라지는 원인을 찾아줘.",
    };
  }

  if (
    lower.includes("localstorage") ||
    lower.includes("local storage") ||
    lower.includes("window is not defined") ||
    lower.includes("document is not defined") ||
    lower.includes("navigator is not defined")
  ) {
    return {
      title: "브라우저에서만 쓸 수 있는 기능을 서버에서 실행했어요",
      meaning:
        "window, document, localStorage, navigator는 브라우저에만 있습니다. Next.js 서버 렌더링 중에는 바로 사용할 수 없습니다.",
      firstChecks: [
        '파일 맨 위에 "use client";가 필요한지 확인하세요.',
        "localStorage, window, document, navigator 코드는 useEffect 안 또는 버튼 클릭 함수 안에서 실행하세요.",
        "초기 화면에서는 기본값을 보여주고, 브라우저가 열린 뒤 값을 바꾸는 방식으로 수정하세요.",
      ],
      likelyFiles: ["app/workspace/page.tsx", "app/result/page.tsx", "app/learn/page.tsx"],
      prompt:
        "Next.js에서 window/localStorage/document/navigator 관련 에러가 났어. 브라우저 전용 코드를 안전하게 옮기는 방법을 알려줘.",
    };
  }

  if (
    lower.includes("module not found") ||
    lower.includes("can't resolve") ||
    lower.includes("cannot find module") ||
    lower.includes("could not resolve")
  ) {
    return {
      title: "가져오려는 파일이나 패키지를 찾지 못했어요",
      meaning:
        "import 경로가 틀렸거나, 패키지가 설치되지 않았거나, 파일 이름 대소문자가 다를 때 자주 발생합니다.",
      firstChecks: [
        "에러 메시지에 나온 import 경로가 실제 파일 위치와 같은지 확인하세요.",
        "파일 이름의 대소문자가 정확히 같은지 확인하세요.",
        "외부 패키지라면 package.json에 있는지 확인하고, 없다면 npm install이 필요한지 확인하세요.",
      ],
      likelyFiles: ["에러 메시지에 표시된 import가 있는 파일", "package.json", "tsconfig.json"],
      prompt:
        "Module not found 또는 Cannot find module 에러가 났어. import 경로, 파일명 대소문자, 패키지 설치 여부를 순서대로 점검해줘.",
    };
  }

  if (
    lower.includes("type error") ||
    lower.includes("typescript") ||
    lower.includes("property") ||
    lower.includes("is not assignable") ||
    lower.includes("does not exist on type") ||
    lower.includes("implicitly has an")
  ) {
    return {
      title: "TypeScript 타입이 맞지 않아요",
      meaning:
        "코드에서 기대하는 데이터 모양과 실제로 넣은 데이터 모양이 다를 때 나는 에러입니다.",
      firstChecks: [
        "interface 또는 type에 정의된 이름과 실제 데이터 이름이 같은지 확인하세요.",
        "undefined일 수 있는 값은 기본값을 넣거나 조건문으로 확인하세요.",
        "배열인지 문자열인지 객체인지 데이터 형태를 다시 확인하세요.",
      ],
      likelyFiles: ["타입을 정의한 파일", "에러 메시지에 나온 컴포넌트 파일"],
      prompt:
        "TypeScript 타입 에러가 났어. interface와 실제 데이터 구조가 어떻게 다른지 찾고 안전하게 고치는 방법을 알려줘.",
    };
  }

  if (
    lower.includes("syntax error") ||
    lower.includes("unexpected token") ||
    lower.includes("unexpected end") ||
    lower.includes("expected") ||
    lower.includes("jsx")
  ) {
    return {
      title: "코드 문법이나 JSX 괄호가 어긋났을 가능성이 높아요",
      meaning:
        "괄호, 중괄호, 태그 닫힘, 쉼표, 따옴표가 하나 빠졌을 때 자주 발생합니다.",
      firstChecks: [
        "에러 메시지에 나온 줄 번호 근처의 괄호와 태그가 잘 닫혔는지 확인하세요.",
        "map, 조건부 렌더링, return 안 JSX에서 괄호 개수가 맞는지 확인하세요.",
        "방금 붙여넣은 코드 바로 위아래를 먼저 확인하세요.",
      ],
      likelyFiles: ["최근 수정한 page.tsx", "에러 메시지에 나온 컴포넌트 파일"],
      prompt:
        "Next.js/React JSX 문법 에러가 났어. 괄호, 태그 닫힘, 조건부 렌더링 위치를 중심으로 어디가 틀렸는지 찾아줘.",
    };
  }

  return {
    title: "첫 번째 에러부터 차근차근 확인해야 해요",
    meaning:
      "에러 메시지만으로 정확한 원인을 단정하기 어렵지만, 대부분 터미널에서 가장 위에 나온 첫 번째 에러가 핵심 원인입니다.",
    firstChecks: [
      "터미널에서 가장 위에 나온 에러를 먼저 확인하세요.",
      "에러 메시지에 나온 파일명과 줄 번호를 찾아보세요.",
      "최근에 수정한 파일부터 되돌아보세요.",
      "전체 코드를 바꾸지 말고 작은 부분 하나만 고쳐서 다시 실행하세요.",
    ],
    likelyFiles: ["에러 메시지에 나온 파일", "최근 수정한 파일", "package.json"],
    prompt:
      "아래 에러를 초보자도 이해할 수 있게 설명해줘. 원인, 확인할 파일, 수정 방법, 다시 실행하는 방법 순서로 알려줘.",
  };
}

function buildStrongFixPrompt(params: {
  originalMessage: string;
  cause: string;
  explanation: string;
  solution: string;
}) {
  return `너는 Next.js App Router 프로젝트를 함께 수정하는 시니어 프론트엔드 개발자야.
나는 개발 초보자라서, 설명은 한국어로 쉽게 해줘.

프로젝트 환경:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel 배포 사용
- 브라우저 전용 객체(window, document, localStorage, navigator)는 안전하게 사용해야 함
- 기존 기능과 디자인은 함부로 삭제하면 안 됨

내가 겪은 실제 에러 원문:
\`\`\`
${params.originalMessage}
\`\`\`

현재 에러 분석 요약:
원인:
${params.cause}

쉬운 설명:
${params.explanation}

예상 해결 방향:
${params.solution}

원하는 답변 형식:
1. 이 에러가 정확히 왜 발생했는지 한 문단으로 설명해줘.
2. 가장 먼저 확인해야 할 파일과 줄 번호를 추정해서 알려줘.
3. 수정해야 할 가능성이 높은 코드 패턴을 찾아줘.
4. 기존 기능을 삭제하지 않는 최소 수정 방법을 제안해줘.
5. TypeScript 기준 수정 코드 예시를 보여줘.
6. 수정 후 실행할 명령어를 알려줘.
7. 만약 이 방법으로 안 되면 다음으로 확인할 것을 알려줘.

주의사항:
- 전체 파일을 갈아엎으라고 하지 말고, 먼저 최소 수정안을 제시해줘.
- 존재하지 않는 파일을 있다고 가정하지 마.
- API 키나 환경변수 값은 절대 코드에 하드코딩하지 마.
- 초보자가 복사해서 적용할 수 있게 “어디를 찾아서 무엇으로 바꾸는지” 명확히 설명해줘.`;
}

function normalizeAiResult(
  data: AiErrorGuideData | undefined,
  originalMessage: string
): NormalizedAiResult {
  const fallback = analyzeErrorFallback(originalMessage);

  const cause = data?.cause?.trim() || fallback.title;
  const explanation = data?.explanation?.trim() || fallback.meaning;
  const solution =
    data?.solution?.trim() ||
    fallback.firstChecks.map((item, index) => `${index + 1}. ${item}`).join("\n");

  return {
    cause,
    explanation,
    solution,
    prompt: buildStrongFixPrompt({
      originalMessage,
      cause,
      explanation,
      solution,
    }),
  };
}

export default function ErrorHelperPage() {
  const [message, setMessage] = useState("");
  const [aiResult, setAiResult] = useState<NormalizedAiResult | null>(null);
  const [analyzeMode, setAnalyzeMode] = useState<AnalyzeMode>("idle");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const fallbackGuide = useMemo(() => analyzeErrorFallback(message), [message]);

  const previewPrompt = buildStrongFixPrompt({
    originalMessage: message || "여기에 실제 에러 메시지를 붙여넣어 주세요.",
    cause: fallbackGuide.title,
    explanation: fallbackGuide.meaning,
    solution: fallbackGuide.firstChecks.map((item, index) => `${index + 1}. ${item}`).join("\n"),
  });

  const currentPrompt = aiResult ? aiResult.prompt : previewPrompt;

  const showToast = (nextMessage: string) => {
    setToast(nextMessage);
    window.setTimeout(() => setToast(""), 2200);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("복사되었습니다.");
    } catch {
      showToast("복사에 실패했습니다. 직접 드래그해서 복사해주세요.");
    }
  };

  const handleAnalyzeWithAi = async () => {
    if (!message.trim()) {
      showToast("먼저 에러 메시지를 붙여넣어 주세요.");
      return;
    }

    setLoading(true);
    setAiResult(null);
    setAnalyzeMode("idle");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: message,
          type: "error",
          tone: "kind",
        }),
      });

      const json = (await res.json()) as ChatApiResponse<AiErrorGuideData>;

      if (!res.ok || !json.success) {
        throw new Error(json.error || "AI 에러 분석에 실패했습니다.");
      }

      const normalized = normalizeAiResult(json.data, message);
      setAiResult(normalized);
      setAnalyzeMode("ai");

      if (json.recovered || json.warning) {
        showToast(json.warning || "AI 응답 일부를 보정해서 표시했습니다.");
      } else {
        showToast("AI 분석이 완료되었습니다.");
      }
    } catch (error) {
      console.error(error);

      const fallback = normalizeAiResult(undefined, message);
      setAiResult(fallback);
      setAnalyzeMode("fallback");
      showToast(`AI 분석 실패: ${getErrorMessage(error)} 기본 분석으로 표시합니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setAiResult(null);
    setAnalyzeMode("idle");
  };

  return (
    <main className="brand-page min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 px-5 py-3 text-center text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <nav className="brand-nav mb-8 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <Link href="/" className="brand-wordmark text-sm font-extrabold text-blue-600">
            VIBE PROJECT
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/today-route"
              className="brand-pill-secondary hidden rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 sm:inline-flex"
            >
              오늘 완성 루트
            </Link>

            <Link
              href="/workspace"
              className="brand-pill-primary rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white"
            >
              워크스페이스로
            </Link>
          </div>
        </nav>

        <section className="brand-card-strong mb-6 overflow-hidden rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <p className="brand-kicker mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
            🧯 AI 연결형 에러 번역기
          </p>

          <h1 className="brand-title text-2xl font-extrabold tracking-tight md:text-4xl">
            실제 터미널 에러를 AI가 쉬운 말로 분석해드릴게요
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            터미널, 브라우저 콘솔, Vercel 빌드 로그에 나온 에러를 그대로 붙여넣으세요.
            원인, 쉬운 설명, 해결 단계, 그리고 Cursor/ChatGPT에 다시 물어볼 수 있는
            고급 프롬프트까지 만들어드립니다.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["1단계", "에러 전체 복사"],
              ["2단계", "AI 분석 실행"],
              ["3단계", "수정 프롬프트 복사"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-400">{step}</p>
                <p className="mt-1 text-sm font-extrabold">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-2">
          <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="error-message" className="block text-sm font-bold">
                에러 메시지 붙여넣기
              </label>

              <button
                type="button"
                onClick={handleReset}
                className="self-start rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 sm:self-auto"
              >
                초기화
              </button>
            </div>

            <textarea
              id="error-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setAiResult(null);
                setAnalyzeMode("idle");
              }}
              placeholder={`예시:
npm run build

Type error: Property 'tools' is missing in type ...
또는
Module not found: Can't resolve '@/lib/vibe-result'

터미널 에러 전체를 그대로 붙여넣으세요.`}
              className="block h-[420px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 outline-none focus:border-blue-400 focus:bg-white"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-slate-400">
                글자 수: {message.length.toLocaleString()}자
              </p>

              <button
                type="button"
                onClick={handleAnalyzeWithAi}
                disabled={loading || !message.trim()}
                className="brand-pill-primary rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "AI가 에러를 분석하는 중..." : "AI로 에러 분석하기"}
              </button>
            </div>

            {analyzeMode === "fallback" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">
                AI 분석 요청이 실패해서 기본 분석 결과를 보여주고 있어요.
                Vercel 배포 환경이라면 <strong>GEMINI_API_KEY</strong> 환경변수가 등록되어 있는지 확인해보세요.
              </div>
            )}

            {analyzeMode === "idle" && message.trim() && !aiResult && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                입력만으로는 아직 AI 분석을 실행하지 않습니다.
                실제 분석을 보려면 <strong>“AI로 에러 분석하기”</strong> 버튼을 눌러주세요.
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            {aiResult ? (
              <>
                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-blue-600">
                      {analyzeMode === "ai" ? "AI 분석 결과" : "기본 분석 결과"}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                        analyzeMode === "ai"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {analyzeMode === "ai" ? "AI 연결됨" : "Fallback"}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold">원인</h2>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {aiResult.cause}
                  </p>
                </div>

                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <p className="mb-2 text-xs font-bold text-blue-600">쉬운 설명</p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {aiResult.explanation}
                  </p>
                </div>

                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <p className="mb-2 text-xs font-bold text-blue-600">해결 단계</p>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                    {aiResult.solution}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold text-blue-600">미리보기 분석</p>
                  <h2 className="mt-2 text-lg font-extrabold">{fallbackGuide.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {fallbackGuide.meaning}
                  </p>
                </div>

                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <p className="mb-3 text-xs font-bold text-blue-600">먼저 확인할 것</p>
                  <ul className="space-y-2">
                    {fallbackGuide.firstChecks.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm leading-6 text-slate-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="brand-card min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
                  <p className="mb-3 text-xs font-bold text-blue-600">
                    확인할 가능성이 높은 파일
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {fallbackGuide.likelyFiles.map((file) => (
                      <span
                        key={file}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="brand-panel-dark min-w-0 overflow-hidden rounded-3xl bg-blue-600 p-5 text-white shadow-sm">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold">Cursor/ChatGPT에게 물어볼 고급 프롬프트</p>
                  <p className="mt-1 text-xs text-white/70">
                    이 내용을 그대로 붙여넣으면, 수정 파일과 코드 예시까지 더 잘 받을 수 있어요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(currentPrompt)}
                  className="self-start rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-600 sm:self-auto"
                >
                  복사
                </button>
              </div>

              <pre className="max-h-96 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-white/10 p-4 text-xs leading-6 text-white/90">
                {currentPrompt}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

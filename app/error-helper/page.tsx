"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface ErrorGuide {
  title: string;
  meaning: string;
  firstChecks: string[];
  likelyFiles: string[];
  prompt: string;
}

function analyzeError(message: string): ErrorGuide {
  const lower = message.toLowerCase();

  if (lower.includes("hydration")) {
    return {
      title: "화면이 서버에서 만든 결과와 브라우저에서 만든 결과가 달라요",
      meaning: "Next.js에서 처음 만든 HTML과 브라우저에서 다시 그린 화면이 서로 다를 때 나는 에러입니다.",
      firstChecks: [
        "시간, 랜덤값, localStorage 값을 바로 화면에 쓰고 있는지 확인하세요.",
        "브라우저에서만 필요한 코드는 useEffect 안으로 옮기세요.",
        "다크모드처럼 사용자 환경에 따라 달라지는 값은 처음에는 기본값으로 보여준 뒤 useEffect에서 바꾸세요.",
      ],
      likelyFiles: ["app/page.tsx", "app/workspace/page.tsx", "app/result/page.tsx"],
      prompt: "Next.js hydration 에러가 났어. 브라우저 전용 값 때문에 생긴 문제인지 확인하고 useEffect로 안전하게 고치는 방법을 알려줘.",
    };
  }

  if (lower.includes("localstorage") || lower.includes("window is not defined") || lower.includes("document is not defined")) {
    return {
      title: "브라우저에서만 쓸 수 있는 기능을 서버에서 실행했어요",
      meaning: "window, document, localStorage는 브라우저에만 있습니다. Next.js 서버 렌더링 중에는 사용할 수 없습니다.",
      firstChecks: [
        '파일 맨 위에 "use client";가 필요한지 확인하세요.',
        "localStorage, window, document 코드는 useEffect 안에서 실행하세요.",
        "버튼 클릭 함수 안에서만 실행되는 코드는 비교적 안전합니다.",
      ],
      likelyFiles: ["app/workspace/page.tsx", "app/result/page.tsx", "app/learn/page.tsx"],
      prompt: "Next.js에서 window/localStorage/document 관련 에러가 났어. 어떤 코드를 useEffect 안으로 옮겨야 하는지 초보자용으로 설명해줘.",
    };
  }

  if (lower.includes("module not found") || lower.includes("can't resolve")) {
    return {
      title: "가져오려는 파일이나 패키지를 찾지 못했어요",
      meaning: "import 경로가 틀렸거나, 패키지가 설치되지 않았거나, 파일 이름 대소문자가 다를 때 자주 발생합니다.",
      firstChecks: [
        "import 경로가 실제 파일 위치와 같은지 확인하세요.",
        "파일 이름의 대소문자가 정확히 같은지 확인하세요.",
        "외부 패키지라면 package.json에 있는지 확인하세요.",
      ],
      likelyFiles: ["에러 메시지에 표시된 import가 있는 파일", "package.json"],
      prompt: "Module not found 에러가 났어. import 경로, 파일명 대소문자, 패키지 설치 여부를 어떤 순서로 확인해야 하는지 알려줘.",
    };
  }

  if (lower.includes("type") || lower.includes("typescript") || lower.includes("property")) {
    return {
      title: "TypeScript 타입이 맞지 않아요",
      meaning: "코드에서 기대하는 데이터 모양과 실제로 넣은 데이터 모양이 다를 때 나는 에러입니다.",
      firstChecks: [
        "interface 또는 type에 정의된 이름과 실제 데이터 이름이 같은지 확인하세요.",
        "undefined일 수 있는 값은 기본값을 넣거나 조건문으로 확인하세요.",
        "배열인지 문자열인지 데이터 형태를 다시 확인하세요.",
      ],
      likelyFiles: ["타입을 정의한 파일", "에러 메시지에 나온 컴포넌트 파일"],
      prompt: "TypeScript 타입 에러가 났어. interface와 실제 데이터 구조가 어떻게 다른지 찾고 안전하게 고치는 방법을 알려줘.",
    };
  }

  return {
    title: "첫 번째 에러부터 차근차근 확인해야 해요",
    meaning: "에러 메시지만으로 정확한 원인을 단정하기 어렵지만, 대부분 첫 번째 에러가 핵심 원인입니다.",
    firstChecks: [
      "터미널에서 가장 위에 나온 에러를 먼저 확인하세요.",
      "에러 메시지에 나온 파일명과 줄 번호를 찾아보세요.",
      "최근에 수정한 파일부터 되돌아보세요.",
      "전체 코드를 바꾸지 말고 작은 부분 하나만 고쳐서 다시 실행하세요.",
    ],
    likelyFiles: ["에러 메시지에 나온 파일", "최근 수정한 파일"],
    prompt: "아래 에러를 초보자도 이해할 수 있게 설명해줘. 원인, 확인할 파일, 수정 방법, 다시 실행하는 방법 순서로 알려줘.\n\n[여기에 에러 메시지 붙여넣기]",
  };
}

export default function ErrorHelperPage() {
  const [message, setMessage] = useState("");

  const guide = useMemo(() => analyzeError(message), [message]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm font-extrabold text-blue-600">
            VIBE PROJECT
          </Link>
          <Link href="/workspace" className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
            워크스페이스로
          </Link>
        </nav>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <p className="mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
            🧯 초보자용 에러 번역기
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
            에러 메시지를 쉬운 말로 바꿔드릴게요
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            터미널이나 브라우저에 나온 에러를 그대로 붙여넣으세요. 가장 먼저 확인할 부분과 AI에게 다시 물어볼 프롬프트를 만들어줍니다.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <label htmlFor="error-message" className="mb-2 block text-sm font-bold">
              에러 메시지 붙여넣기
            </label>
            <textarea
              id="error-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="예: window is not defined, Hydration failed, Module not found..."
              className="min-h-80 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-blue-400 focus:bg-white"
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-xs font-bold text-blue-600">에러 뜻</p>
              <h2 className="mt-2 text-lg font-extrabold">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{guide.meaning}</p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold text-blue-600">먼저 확인할 것</p>
              <ul className="space-y-2">
                {guide.firstChecks.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold text-blue-600">확인할 가능성이 높은 파일</p>
              <div className="flex flex-wrap gap-2">
                {guide.likelyFiles.map((file) => (
                  <span key={file} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {file}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-blue-600 p-5 text-white shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold">AI에게 물어볼 프롬프트</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${guide.prompt}\n\n${message}`)}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-600"
                >
                  복사
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-white/90">
                {guide.prompt}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
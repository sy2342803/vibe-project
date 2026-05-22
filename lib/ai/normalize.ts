import type {
  CommitResult,
  ErrorGuideData,
  FeatureItem,
  MockDataResult,
  PlanContent,
  PromptCoachData,
  ScreenItem,
} from "@/lib/vibe-types";

function cleanText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.replace(/\s+\n/g, "\n").trim() || fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return cleanText(record.text || record.content || record.desc || record.name);
        }
        return "";
      })
      .filter(Boolean);

    if (items.length > 0) return items;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n+|(?:\d+\.\s+)/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function normalizeFeature(value: unknown, index: number, idea: string): FeatureItem {
  const record = asRecord(value);
  const fallbackName = ["아이디어 등록", "목록 확인", "상세 정보 확인", "관리 기능"][index] || `핵심 기능 ${index + 1}`;

  return {
    id: cleanText(record.id, `SYS-REQ-${String(index + 1).padStart(2, "0")}`),
    name: cleanText(record.name || record.title, fallbackName),
    desc: cleanText(
      record.desc || record.description,
      `${idea || "서비스"}를 실제 사용자가 이해하기 쉽게 이용하도록 돕는 기능입니다.`
    ),
    criteria: asStringArray(record.criteria || record.acceptanceCriteria || record.checklist, [
      "입력값이 비어 있을 때 안내 문구가 표시된다.",
      "작업 성공 후 사용자가 확인할 수 있는 메시지가 표시된다.",
      "모바일 화면에서도 버튼과 텍스트가 겹치지 않는다.",
    ]),
  };
}

function normalizeScreen(value: unknown, index: number): ScreenItem {
  const record = asRecord(value);
  const fallbackName = ["홈 화면", "입력 화면", "결과 화면", "관리 화면"][index] || `화면 ${index + 1}`;

  return {
    id: cleanText(record.id, `UI-SCR-${String(index + 1).padStart(2, "0")}`),
    name: cleanText(record.name || record.title, fallbackName),
    desc: cleanText(
      record.desc || record.description,
      "상단 제목, 핵심 정보 영역, 주요 행동 버튼, 상태 안내 메시지를 순서대로 보여줍니다."
    ),
  };
}

function normalizeFeatureList(value: unknown, idea: string) {
  const source = Array.isArray(value) && value.length > 0 ? value : [{}, {}, {}, {}];
  return source.slice(0, 6).map((item, index) => normalizeFeature(item, index, idea));
}

function normalizeScreenList(value: unknown) {
  const source = Array.isArray(value) && value.length > 0 ? value : [{}, {}, {}, {}];
  return source.slice(0, 6).map((item, index) => normalizeScreen(item, index));
}

function defaultUiPrompts(idea: string, platform: string) {
  const serviceName = idea || "서비스";
  const targetPlatform = platform || "웹";
  return [
    `역할: 당신은 Next.js 16, React 19, TypeScript, Tailwind CSS 4에 능숙한 시니어 프론트엔드 엔지니어이자 UX 디자이너입니다.

목표: "${serviceName}" 아이디어를 ${targetPlatform}에서 바로 시연 가능한 첫 화면으로 만들어주세요.

중요 조건:
- 터미널 명령 실행, 패키지 설치, 외부 API 호출은 하지 마세요.
- shadcn/ui, 아이콘 패키지, DB 연결처럼 설치가 필요한 의존성은 새로 추가하지 마세요.
- 서버 액션, 인증, 실제 결제, 실제 데이터베이스 연결은 이번 단계에서 만들지 마세요.
- 클라이언트 컴포넌트 하나에서 동작하는 고품질 프로토타입을 먼저 완성하세요.

화면 구성:
1. 상단에는 서비스명, 한 줄 가치 제안, 주요 CTA를 배치하세요.
2. 첫 사용자에게 무엇을 입력해야 하는지 알려주는 입력 영역을 만드세요.
3. 결과 미리보기 카드, 빈 상태, 로딩 상태, 에러 상태, 성공 상태를 모두 포함하세요.
4. 한국 대학생이 실제로 볼 법한 샘플 데이터 5개 이상을 넣으세요.
5. 모바일 360px, 태블릿, 데스크톱에서 버튼과 텍스트가 겹치지 않게 구성하세요.

디자인 기준:
- 모든 문구는 자연스러운 한국어로 작성하세요.
- 발표/해커톤 제출 화면처럼 신뢰감 있게 보이되 너무 장난스럽지 않게 만드세요.
- 카드 안에 카드를 중첩하지 말고, 섹션별 정보 위계를 명확히 해주세요.
- 버튼에는 로딩/완료 상태를 시각적으로 구분하고 aria-label을 넣어주세요.`,
    `앞에서 만든 UI를 실제 사용자가 1분 안에 이해하고 조작할 수 있는 프로토타입으로 고도화해주세요.

추가 요구:
1. 사용 흐름을 "입력 → 미리보기 → 저장/복사 → 다음 행동" 순서로 정리하세요.
2. 입력값 검증을 추가하세요. 비어 있으면 친절한 한국어 오류 문구를 보여주세요.
3. 복사 버튼은 복사 전, 복사 완료, 복사 실패 상태가 구분되게 만드세요.
4. 결과 카드에는 제목, 설명, 추천 기능, 다음에 AI 도구에 넣을 문장까지 표시하세요.
5. 사용자가 다시 시작할 수 있는 초기화 버튼과 확인 메시지를 넣으세요.
6. 다크모드가 없어도 충분히 보기 좋은 라이트 UI를 기본으로 만들고, 대비를 높게 유지하세요.
7. 외부 라이브러리 없이 React useState만으로 인터랙션을 구현하세요.

완료 기준:
- 입력하지 않고 버튼을 누르면 안내 문구가 보입니다.
- 정상 입력 후 결과 카드가 나타납니다.
- 복사 버튼을 누르면 "복사 완료" 상태가 2초 정도 보입니다.
- 모바일에서 CTA, 입력창, 카드가 화면 밖으로 삐져나가지 않습니다.`,
    `최종 품질 점검과 마무리 수정을 해주세요.

점검 항목:
- TypeScript 타입 오류가 생길 만한 암시적 any, undefined 접근, 배열 map 오류를 피하세요.
- 모바일 360px에서 긴 한국어 문장이 버튼 밖으로 넘치지 않게 줄바꿈 처리하세요.
- 모든 버튼에 명확한 텍스트 또는 aria-label을 넣으세요.
- 색상 대비가 낮은 회색 텍스트를 남발하지 말고, 본문은 충분히 읽히게 해주세요.
- 실제 API나 DB 없이도 데모가 완성된 것처럼 보이도록 realistic mock data를 사용하세요.
- 사용자가 만든 아이디어의 핵심 문제, 대상 사용자, 핵심 기능이 화면에 드러나야 합니다.

출력 형식:
완성된 코드와 함께, 어떤 부분을 사용자가 직접 바꿔야 하는지 한국어로 짧게 설명해주세요.`,
  ];
}

function defaultIdePrompts(idea: string) {
  const serviceName = idea || "내 서비스";
  return [
    `나는 비전공자 대학생이고 "${serviceName}"를 만들고 있습니다. Cursor에서 작업할 예정입니다.

먼저 현재 프로젝트의 폴더 구조, package.json, app 디렉터리, 공통 타입/컴포넌트를 읽고 나서 필요한 수정 계획을 5줄 이내로 설명해주세요. 기존 기능과 문구는 최대한 유지하고, 파일을 삭제하거나 대규모로 갈아엎지 마세요.

그 다음 첫 번째 구현 범위만 진행해주세요:
1. 사용자가 입력하는 화면
2. 결과를 보여주는 카드
3. 로딩/에러/성공 상태
4. 복사 버튼과 모바일 반응형

TypeScript 타입을 명확히 만들고, any 사용은 피해주세요. 수정 후 어떤 파일을 바꿨는지와 사용자가 직접 확인할 체크리스트를 한국어로 알려주세요.`,
    `Cursor에서 v0/Bolt가 만든 UI 코드를 실제 프로젝트에 안전하게 붙이는 작업을 도와주세요.

작업 방식:
1. 먼저 app, components, lib 폴더 구조를 읽고 현재 사용하는 스타일 규칙을 파악하세요.
2. 새로 만든 UI를 무작정 덮어쓰지 말고, 필요한 컴포넌트 단위로 분리하세요.
3. 기존 라우트와 문구를 보존하면서 "${serviceName}"의 핵심 화면만 연결하세요.
4. 모든 상태는 명확한 타입으로 관리하세요. 예: loading, errorMessage, result, copiedId.
5. localStorage, window, document는 클라이언트 컴포넌트나 useEffect 안에서만 접근하세요.
6. 사용자가 이해할 수 있는 한국어 빈 상태, 오류 상태, 성공 상태를 넣으세요.

완료 기준:
- npm run lint에서 걸릴 만한 JSX/TypeScript 문제를 미리 고칩니다.
- 모바일에서 사이드바, 탭, 버튼이 겹치지 않습니다.
- 사용자가 클릭해볼 수 있는 최소 3개 이상의 인터랙션이 동작합니다.
- 마지막에 수정 파일 목록과 확인 방법을 알려주세요.`,
    `이제 "${serviceName}"를 실제 웹앱처럼 보이게 만드는 기능 연결을 진행해주세요.

구현 요청:
1. 화면에서 입력한 값을 기반으로 결과 데이터를 생성하는 함수를 만드세요.
2. 결과 데이터 타입을 별도 interface/type으로 정의하세요.
3. 저장이 필요하면 우선 localStorage를 사용하고, 브라우저 환경에서만 실행되게 하세요.
4. 목록, 상세, 삭제, 다시 생성 같은 기본 흐름을 가능한 작은 범위로 구현하세요.
5. 실패 상황을 일부러 재현해도 앱이 멈추지 않도록 try/catch와 fallback UI를 넣으세요.
6. 한국어 샘플 데이터와 실제 사용 상황에 가까운 안내 문구를 넣으세요.

주의:
- 새 패키지를 설치하지 마세요.
- API 키, Supabase 키, 비밀값을 코드에 직접 쓰지 마세요.
- 기존 사용자 코드가 있으면 먼저 설명하고 필요한 부분만 수정하세요.`,
    `방금 만든 기능을 배포 가능한 수준으로 점검해주세요.

확인할 것:
- npm run lint와 npm run build에서 실패할 가능성이 있는 타입/구문을 먼저 찾아 수정
- 모바일 360px, 태블릿, 데스크톱에서 버튼/탭/카드 텍스트가 겹치지 않는지 확인
- 빈 상태, 로딩 상태, 에러 상태, 성공 상태가 모두 한국어로 자연스럽게 보이는지 확인
- localStorage, window, document 접근은 브라우저 환경에서만 실행되는지 확인
- API 키나 민감정보가 클라이언트 코드에 노출되지 않는지 확인

수정이 필요하면 작은 단위로 고치고, 마지막에 "수정한 파일", "실행한 명령", "남은 리스크"를 짧게 정리해주세요.`,
  ];
}

function ensurePromptQuality(items: string[], defaults: string[]) {
  const strongItems = items.filter((item) => item.length >= 260);
  const merged = [...strongItems];

  for (const fallback of defaults) {
    if (merged.length >= defaults.length) break;
    const isDuplicate = merged.some((item) => item.slice(0, 80) === fallback.slice(0, 80));
    if (!isDuplicate) merged.push(fallback);
  }

  return merged.slice(0, Math.max(3, defaults.length));
}

function defaultDbPrompt(idea: string) {
  return `-- ${idea || "서비스"} Supabase 기본 테이블 예시
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 읽기 가능" ON public.items FOR SELECT USING (true);`;
}

export function normalizePlanContent(value: unknown, context: { idea: string; platform: string; bm: string }): PlanContent {
  const record = asRecord(value);
  const prompts = asRecord(record.prompts);

  return {
    summary: cleanText(
      record.summary,
      "아이디어를 바로 구현 가능한 작은 첫 버전으로 줄여 시작하면 좋습니다. 핵심 화면과 데이터 흐름을 먼저 만들고, 이후 사용자 피드백을 보며 확장하세요."
    ),
    problem: cleanText(
      record.problem,
      "사용자가 지금 겪는 불편을 한 문장으로 좁혀야 구현 범위가 선명해집니다. 첫 버전은 가장 자주 반복되는 문제 하나를 해결하는 데 집중하세요."
    ),
    target: cleanText(
      record.target,
      "가장 먼저 써줄 사용자는 같은 상황을 반복해서 겪는 대학생입니다. 생활 패턴과 사용 순간을 구체적으로 정하면 화면과 기능 우선순위가 쉬워집니다."
    ),
    userStories: asStringArray(record.userStories || record.stories, [
      "사용자는 필요한 정보를 입력하고 바로 결과를 확인한다.",
      "사용자는 결과를 복사해 AI 코딩 도구에 붙여넣는다.",
      "사용자는 문제가 생기면 에러 메시지를 붙여넣고 해결 단계를 확인한다.",
    ]),
    features: normalizeFeatureList(record.features, context.idea),
    screens: normalizeScreenList(record.screens),
    prompts: {
      ui: ensurePromptQuality(asStringArray(prompts.ui, []), defaultUiPrompts(context.idea, context.platform)),
      ide: ensurePromptQuality(asStringArray(prompts.ide, []), defaultIdePrompts(context.idea)),
      db: cleanText(prompts.db, defaultDbPrompt(context.idea)),
    },
  };
}

export function normalizeErrorGuide(value: unknown, originalError: string): ErrorGuideData {
  const record = asRecord(value);
  const steps = asStringArray(record.steps || record.solutionSteps, []);
  const solution = cleanText(record.solution, steps.length > 0 ? steps.map((step, index) => `${index + 1}단계: ${step}`).join("\n") : "");
  const finalSteps = steps.length > 0 ? steps : asStringArray(solution, [
    "에러가 난 파일과 줄 번호를 확인합니다.",
    "undefined/null처럼 비어 있을 수 있는 값을 먼저 검사합니다.",
    "수정 후 같은 화면을 새로고침해서 다시 확인합니다.",
  ]);

  return {
    cause: cleanText(record.cause, "코드가 기대한 값과 실제 들어온 값이 달라서 생긴 오류일 가능성이 큽니다."),
    explanation: cleanText(
      record.explanation || record.easyExplanation,
      "쉽게 말하면, 아직 준비되지 않은 데이터를 코드가 먼저 사용하려고 한 상황입니다."
    ),
    solution: solution || finalSteps.map((step, index) => `${index + 1}단계: ${step}`).join("\n"),
    steps: finalSteps,
    prompt: cleanText(
      record.prompt,
      `다음 에러를 해결해줘. 에러 내용: ${originalError}. 원인을 찾고, 재발하지 않도록 방어 코드와 사용자에게 보여줄 한국어 에러 메시지도 함께 추가해줘.`
    ),
  };
}

export function normalizePromptCoach(value: unknown, originalPrompt: string): PromptCoachData {
  const record = asRecord(value);
  const improved = cleanText(
    record.improved,
    `역할: 시니어 프론트엔드 엔지니어로서 작업해주세요.\n요청: ${originalPrompt}\n조건: TypeScript, 반응형 UI, 로딩/에러/성공 상태, 접근성 라벨을 포함해주세요.\n출력: 수정할 파일 목록과 완성 코드를 단계별로 제시해주세요.`
  );

  return {
    original: cleanText(record.original, originalPrompt),
    improved,
    reasons: asStringArray(record.reasons || record.reason || record.improvementReasons, [
      "역할과 목표를 분리해 AI가 해야 할 일을 명확히 했습니다.",
      "기술 스택과 상태 처리를 넣어 결과물의 완성도를 높였습니다.",
    ]),
    tips: asStringArray(record.tips || record.writingTips, [
      "무엇을 만들지, 어떤 기술을 쓸지, 어떤 상태를 보여줄지 순서대로 적어보세요.",
      "마지막에 원하는 출력 형식을 적으면 복사해서 쓰기 쉬운 답을 받을 수 있습니다.",
    ]),
  };
}

export function normalizeMockData(value: unknown): MockDataResult {
  const record = asRecord(value);
  const mockData = record.mockData || (Array.isArray(value) ? value : [value]);
  return {
    jsonCode: JSON.stringify(mockData, null, 2),
  };
}

export function normalizeCommitMessage(value: unknown): CommitResult {
  const record = asRecord(value);
  return {
    message: cleanText(record.message, "chore: update project"),
  };
}

export function parseAiJson(text: string): unknown {
  const cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
    .trim();

  const direct = tryParseJson(cleanedText);
  if (direct.ok) return direct.value;

  const jsonText = extractJsonBlock(cleanedText);
  const extracted = tryParseJson(jsonText);
  if (extracted.ok) return extracted.value;

  const repairedText = repairJsonText(jsonText);
  const repaired = tryParseJson(repairedText);
  if (repaired.ok) return repaired.value;

  throw new Error("AI 응답을 JSON으로 정리하지 못했습니다.");
}

function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function extractJsonBlock(text: string) {
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  const start = Math.min(...starts);

  if (!Number.isFinite(start)) {
    throw new Error("AI 응답에서 JSON 시작점을 찾지 못했습니다.");
  }

  const endObject = text.lastIndexOf("}");
  const endArray = text.lastIndexOf("]");
  const end = Math.max(endObject, endArray);

  if (end < start) {
    throw new Error("AI 응답에서 JSON 끝점을 찾지 못했습니다.");
  }

  return text.slice(start, end + 1);
}

function repairJsonText(text: string) {
  const withoutTrailingCommas = text.replace(/,\s*([}\]])/g, "$1");
  const openCurly = (withoutTrailingCommas.match(/{/g) || []).length;
  const closeCurly = (withoutTrailingCommas.match(/}/g) || []).length;
  const openSquare = (withoutTrailingCommas.match(/\[/g) || []).length;
  const closeSquare = (withoutTrailingCommas.match(/]/g) || []).length;

  return `${withoutTrailingCommas}${"]".repeat(Math.max(0, openSquare - closeSquare))}${"}".repeat(Math.max(0, openCurly - closeCurly))}`;
}

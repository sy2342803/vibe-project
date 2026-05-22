import { NextRequest, NextResponse } from "next/server";
import { createAiProvider, AiProviderError } from "@/lib/ai/provider";
import {
  normalizeCommitMessage,
  normalizeErrorGuide,
  normalizeMockData,
  normalizePlanContent,
  normalizePromptCoach,
  parseAiJson,
} from "@/lib/ai/normalize";
import type { ChatToolType, MentorTone } from "@/lib/vibe-types";

interface ChatRequestBody {
  idea: string;
  type: ChatToolType;
  platform: string;
  bm: string;
  tone: MentorTone;
}

const chatToolTypes: ChatToolType[] = ["plan", "error", "prompt", "mock", "commit", "guide"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isChatToolType(value: unknown): value is ChatToolType {
  return typeof value === "string" && chatToolTypes.includes(value as ChatToolType);
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

async function readChatRequest(req: NextRequest): Promise<ChatRequestBody | null> {
  const body = asRecord(await req.json());
  const type = body.type;

  if (!isChatToolType(type)) return null;

  return {
    idea: getString(body.idea).trim(),
    type,
    platform: getString(body.platform, "지정되지 않음"),
    bm: getString(body.bm, "지정되지 않음"),
    tone: body.tone === "tsundere" ? "tsundere" : "kind",
  };
}

function getToneDirective(tone: MentorTone): string {
  if (tone === "tsundere") {
    return `
[말투 지시]
당신은 실력은 확실하고 말투는 살짝 까칠하지만 결국 끝까지 도와주는 "츤데레 선배" 멘토입니다.
- 반말을 사용하되 사용자를 모욕하거나 깎아내리지 마세요.
- 첫 문장은 "냉정하게 말하면", "솔직히 말하면", "이건 이렇게 봐야 해"처럼 직설적으로 시작하세요.
- 설명은 짧고 현실적으로 하며, 불필요한 장식보다 바로 실행할 행동을 우선합니다.
- 그래도 마지막에는 사용자가 계속할 수 있게 은근한 응원이나 칭찬을 한 문장 넣으세요.
- 이모지는 거의 쓰지 말고, 발표/제출용 문서에 들어가도 민망하지 않은 정도로 유지하세요.
`;
  }

  return `
[말투 지시]
당신은 비전공자 대학생을 다정하게 이끄는 "천사멘토" AI 코딩 코치입니다.
- 존댓말을 사용하고, 사용자가 겁먹지 않도록 따뜻하고 차분하게 설명합니다.
- 어려운 개발 용어는 일상적인 비유와 쉬운 한국어로 풀어줍니다.
- 잘한 점을 먼저 짚고, 다음에 고칠 점을 부드럽게 제안합니다.
- 이모지는 꼭 필요한 곳에만 적게 사용합니다.
- 마지막에는 사용자가 바로 실행할 수 있는 다음 행동을 알려줍니다.
`;
}

function buildPrompt(body: ChatRequestBody) {
  const toneDirective = getToneDirective(body.tone);
  const { idea, platform, bm, type } = body;

  if (type === "plan") {
    return {
      useJson: true,
      prompt: `
${toneDirective}

당신은 비전공자 대학생의 막연한 아이디어를 AI 코딩 도구에 넣을 수 있는 기획서와 프롬프트로 바꾸는 서비스 기획 멘토입니다.

사용자 아이디어: "${idea}"
타겟 플랫폼: "${platform || "지정되지 않음"}"
비즈니스 모델: "${bm || "지정되지 않음"}"

규칙:
1. 모든 내용은 한국어로 작성하세요.
2. 비전공자도 이해할 수 있게 쉬운 언어를 쓰되, 실제 구현 가능한 수준으로 구체화하세요.
3. userStories는 실제 상황이 보이도록 3~5개 작성하세요.
4. features는 4개 이상 작성하고 criteria는 직접 테스트 가능한 문장으로 작성하세요.
5. screens는 3개 이상 작성하고 화면 요소의 순서를 설명하세요.
6. prompts.ui는 v0.dev/Bolt.new에 붙여넣어도 터미널 명령, 패키지 설치, 서버 설정 에러가 적게 나도록 작성하세요. 한 번에 완성 앱 전체를 요구하지 말고, "UI 초안 → 상태/상호작용 → 품질 점검" 순서로 나누세요.
7. prompts.ui는 반드시 3~4개 배열로 작성하고, 각 항목은 700자 이상으로 상세하게 작성하세요. "외부 API 호출 금지", "새 패키지 설치 금지", "모든 문구 한국어", "모바일 360px 대응", "빈/로딩/에러/성공 상태", "접근성 라벨", "한국 대학생 맥락 샘플 데이터"를 포함하세요.
8. prompts.ide는 Cursor용으로 반드시 3~4개 배열로 작성하고, 각 항목은 700자 이상으로 상세하게 작성하세요. 현재 프로젝트 구조를 먼저 읽기, 기존 파일 삭제 금지, 작은 단위 구현, TypeScript 타입, localStorage/window 안전 접근, lint/build 확인, 수정 파일 요약, 사용자가 직접 확인할 체크리스트를 포함하세요.
9. prompts.ui와 prompts.ide는 비전공자가 그대로 복사해도 "어디서 무엇을 확인해야 하는지" 알 수 있게 순서, 금지사항, 완료 기준을 같이 써주세요.
10. prompts.db는 Supabase SQL Editor에서 실행 가능한 SQL 중심으로 작성하되, 개인정보/결제정보 같은 민감 데이터는 첫 버전에 넣지 마세요.
11. 순수 JSON만 반환하고, 키 이름은 절대 바꾸지 마세요.

필수 JSON 구조:
{
  "summary": "2-3문장 요약",
  "problem": "해결할 문제 2-3문장",
  "target": "구체적인 최우선 사용자 2-3문장",
  "userStories": ["사용자 시나리오 1", "사용자 시나리오 2", "사용자 시나리오 3"],
  "features": [
    {
      "id": "SYS-REQ-01",
      "name": "기능 이름",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2", "검사 기준 3"]
    }
  ],
  "screens": [
    {
      "id": "UI-SCR-01",
      "name": "화면 이름",
      "desc": "화면 구성 설명"
    }
  ],
  "prompts": {
    "ui": ["v0.dev 또는 bolt.new용 UI 프롬프트 1", "UI 상태/상호작용 프롬프트 2", "UI 품질 점검 프롬프트 3"],
    "ide": ["Cursor용 프로젝트 적용 프롬프트 1", "Cursor용 기능 연결 프롬프트 2", "Cursor용 빌드/배포 점검 프롬프트 3"],
    "db": "Supabase SQL 또는 데이터 설계 프롬프트"
  }
}
`,
    };
  }

  if (type === "error") {
    return {
      useJson: true,
      prompt: `
${toneDirective}

아래 에러 메시지를 비전공자 대학생도 이해할 수 있게 분석하세요.
에러 내용: "${idea}"

규칙:
1. 모든 내용은 한국어로 작성하세요.
2. cause는 기술적 원인을 짧게 설명하세요.
3. explanation은 쉬운 비유나 일상어로 설명하세요.
4. steps는 실제로 따라 할 수 있는 해결 단계 3~5개로 작성하세요.
5. prompt는 Cursor에 그대로 붙여넣을 수 있는 디버깅 요청문으로 작성하세요.
6. 순수 JSON만 반환하세요.

필수 JSON 구조:
{
  "cause": "원인",
  "explanation": "쉬운 설명",
  "steps": ["1단계 설명", "2단계 설명", "3단계 설명"],
  "solution": "1단계: ...\\n2단계: ...\\n3단계: ...",
  "prompt": "Cursor용 복붙 프롬프트"
}
`,
    };
  }

  if (type === "prompt") {
    return {
      useJson: true,
      prompt: `
${toneDirective}

사용자의 러프한 프롬프트를 v0.dev, bolt.new, Cursor AI가 더 정확히 이해하는 실전 프롬프트로 개선하세요.
원본 프롬프트: "${idea}"

규칙:
1. 개선본은 한국어로 작성하세요.
2. 역할(Role), 목표(Goal), 기술스택(Stack), 제약조건(Constraints), 출력형식(Output)을 포함하세요.
3. UI라면 반응형, 접근성, 로딩/빈/에러/성공 상태를 포함하세요.
4. 기능이라면 에러 처리와 검증 방법을 포함하세요.
5. v0.dev/Bolt.new용으로 보이면 터미널 명령 실행, 패키지 설치, 외부 API 호출을 요구하지 않도록 바꾸세요.
6. Cursor용으로 보이면 기존 파일 삭제 금지, 변경 파일 요약, lint/build 확인을 넣으세요.
7. reasons와 tips는 프롬프트 작성 실력이 늘도록 짧고 구체적으로 작성하세요.
8. 순수 JSON만 반환하세요.

필수 JSON 구조:
{
  "original": "원본 입력",
  "improved": "개선된 복붙 프롬프트",
  "reasons": ["개선 이유 1", "개선 이유 2"],
  "tips": ["작성 팁 1", "작성 팁 2"]
}
`,
    };
  }

  if (type === "mock") {
    return {
      useJson: true,
      prompt: `
기획 주제를 기반으로 프론트엔드에 즉시 사용할 수 있는 한국어 목업 JSON 데이터를 생성하세요.
기획 주제: "${idea}"

규칙:
1. 모든 텍스트는 한국어로 작성하세요.
2. mockData 배열 안에 샘플 객체 6~8개를 넣으세요.
3. 각 객체에는 id, title, description, price 또는 date 등 주제에 맞는 현실적인 필드를 포함하세요.
4. 순수 JSON만 반환하세요.

필수 JSON 구조:
{
  "mockData": [
    { "id": 1, "title": "샘플 제목", "description": "샘플 설명", "price": 10000, "author": "김민준", "createdAt": "2026-05-22" }
  ]
}
`,
    };
  }

  if (type === "commit") {
    return {
      useJson: true,
      prompt: `
개발자가 작업한 내용을 바탕으로 Conventional Commits 규칙에 맞는 영어 커밋 메시지를 작성하세요.
작업 내용: "${idea}"

규칙:
1. 타입은 feat, fix, refactor, docs, style, chore 중에서 고르세요.
2. 제목은 50자 이내로 작성하세요.
3. 순수 JSON만 반환하세요.

필수 JSON 구조:
{
  "message": "feat: add workspace sharing"
}
`,
    };
  }

  const lessonMatch = idea.match(/\[레슨:\s*(.+?)\]/);
  const lessonTitle = lessonMatch ? lessonMatch[1] : "일반 질문";
  const questionOnly = idea.replace(/\[레슨:.*?\]/g, "").replace(/이전 대화:/g, "").trim();

  return {
    useJson: false,
    prompt: `
${toneDirective}

당신은 VIBE PROJECT의 바이브코딩 전문 AI 튜터입니다.
학생이 현재 보고 있는 레슨: "${lessonTitle}"
대화 내용: ${questionOnly}

규칙:
1. 한국어 3~5문장으로 답변하세요.
2. 어려운 개발 용어는 쉬운 말로 풀어주세요.
3. 마지막에 바로 해볼 수 있는 다음 행동 1가지를 제안하세요.
`,
  };
}

function logApiError(error: unknown) {
  if (error instanceof AiProviderError) {
    console.error("[api/chat] provider error", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return;
  }

  console.error("[api/chat] unexpected error", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
}

export async function GET() {
  const provider = createAiProvider();

  return NextResponse.json({
    success: true,
    model: provider.model,
    provider: provider.name,
    keysActive: provider.keysActive,
    status: provider.keysActive > 0 ? "정상 작동 중" : "API 키 설정 필요",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await readChatRequest(req);

    if (!body || !body.idea) {
      return NextResponse.json(
        { success: false, error: "요청 내용이 비어 있습니다. 아이디어나 에러 메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    const provider = createAiProvider();
    const { prompt, useJson } = buildPrompt(body);
    const result = await provider.generate({ prompt, useJson });

    if (body.type === "guide") {
      return NextResponse.json({
        success: true,
        data: result.text,
        model: result.model,
        provider: result.provider,
      });
    }

    let parsed: unknown = {};
    let recovered = false;

    try {
      parsed = parseAiJson(result.text);
    } catch (error) {
      recovered = true;
      console.warn("[api/chat] JSON recovery fallback", {
        type: body.type,
        message: error instanceof Error ? error.message : "Unknown parse error",
      });
    }

    const data = (() => {
      if (body.type === "plan") {
        return normalizePlanContent(parsed, {
          idea: body.idea,
          platform: body.platform,
          bm: body.bm,
        });
      }

      if (body.type === "error") return normalizeErrorGuide(parsed, body.idea);
      if (body.type === "prompt") return normalizePromptCoach(parsed, body.idea);
      if (body.type === "mock") return normalizeMockData(parsed);
      return normalizeCommitMessage(parsed);
    })();

    return NextResponse.json({
      success: true,
      data,
      model: result.model,
      provider: result.provider,
      recovered,
      warning: recovered ? "AI 응답 일부가 깨져 기본 구조로 보정했습니다." : undefined,
    });
  } catch (error) {
    logApiError(error);

    if (error instanceof AiProviderError) {
      return NextResponse.json(
        { success: false, error: error.userMessage, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "AI 요청 처리 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}

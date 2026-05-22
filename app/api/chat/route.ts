import { NextRequest, NextResponse } from "next/server";

// ── API 키 배열 (3개) ──
const API_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = "llama-3.3-70b-versatile";

// 키 순환 인덱스
let currentKeyIndex = 0;

// ── Groq 호출 함수 (키 순환 방식) ──
async function callGroq(
  prompt: string,
  useJson: boolean = true
): Promise<{ text: string; model: string }> {
  if (API_KEYS.length === 0) {
    throw new Error("설정된 GROQ API 키가 없습니다. .env.local을 확인하세요.");
  }

  const apiKey = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

  const body: any = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (useJson) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message || `Groq API 호출 실패: ${res.status}`
    );
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq 응답 텍스트가 비어 있습니다.");

  return { text, model: data?.model || MODEL };
}

// ──────────────────────────────────────────────
// 🎭 톤(tone) 기반 페르소나 프리셋 생성기
// ──────────────────────────────────────────────
function getToneDirective(tone: string): string {
  if (tone === "tsundere") {
    return `
[페르소나 지시]
당신은 실력은 압도적이지만 말투가 퉁명스럽고 직설적인 '츤데레 선배 개발자'입니다.
- 반말을 사용하세요. ("~해", "~거든", "~잖아", "~라고")
- 첫 문장은 살짝 핀잔이나 놀림으로 시작하세요. (예: "이것도 모르냐...", "한심하긴 한데...")
- 설명은 팩트 위주로 군더더기 없이 날카롭게 전달하되, 내용 자체는 정확하고 도움이 되어야 합니다.
- 마지막 문장에만 살짝 응원이나 칭찬을 숨기세요. (예: "...근데 여기까지 온 건 좀 대단하긴 하다.", "못할 줄 알았는데 의외네.")
- 이모지는 최소한으로 사용하세요.
    `;
  }

  return `
[페르소나 지시]
당신은 세상에서 가장 다정하고 인내심 많은 '천사 코치 멘토'입니다.
- 존댓말을 사용하세요. ("~해요", "~이에요", "~할 수 있어요")
- 모든 설명에 친근한 비유와 격려를 곁들이세요. (예: "마치 레고 블록을 조립하는 것처럼...")
- 실수나 에러를 부정적으로 표현하지 말고 "배움의 기회"로 리프레이밍하세요.
- 이모지를 적극 활용하여 따뜻한 분위기를 만드세요.
- "잘하고 계세요!", "거의 다 왔어요!" 같은 응원을 자연스럽게 넣으세요.
  `;
}

// ── GET (상태 확인용) ──
export async function GET() {
  return NextResponse.json({
    success: true,
    model: MODEL,
    provider: "Groq",
    keysActive: API_KEYS.length,
    status: "정상 작동 중",
  });
}

// ──────────────────────────────────────────────
// 🚀 POST 라우트
// ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { idea, type, platform, bm, tone } = await req.json();

    const toneDirective = getToneDirective(tone || "kind");

    let prompt = "";
    let useJson = true;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. 메인 기획서 생성
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (type === "plan") {
      prompt = `
${toneDirective}

당신은 코딩과 개발 용어를 전혀 모르는 비전공자 대학생들을 위한 최고의 스타트업 멘토이자 가이드입니다.
사용자가 입력한 대략적인 아이디어를 분석하여, 개발자 수준의 전문성을 내포하되 "철저하게 초등학생도 이해할 수 있는 쉬운 일상 용어와 비유"를 사용하여 기획 요건을 정리하고 JSON 포맷으로 생성해야 합니다.

**위 [페르소나 지시]의 말투를 summary, problem, target, 각 기능의 desc, criteria 전체에 일관되게 적용하세요.**

사용자 아이디어 원문: "${idea}"
선택된 타겟 플랫폼 규격: "${platform || "지정되지 않음 (전체 플랫폼)"}"
선택된 비즈니스 모델(BM): "${bm || "지정되지 않음"}"

아래의 JSON Schema 형식을 정확하게 준수하여 채워주세요. Key 명칭을 절대 바꾸지 마십시오.
마크다운(\`\`\`json) 등 앞뒤 부연설명 없이 오직 순수한 JSON만 반환해야 합니다:

{
  "summary": "이 서비스의 핵심 구조와 오늘 당장 무엇을 만들면 되는지 페르소나 말투로 요약한 코칭 메시지 (2-3문장)",
  "problem": "이 서비스가 해결하려는 불편함을 친근한 일상 사례를 들어 페르소나 말투로 정의 (2-3문장)",
  "target": "이 서비스를 가장 먼저 좋아해 줄 구체적인 사람들의 모습이나 페르소나 설명 (2-3문장)",
  "userStories": [
    "[어떤 유저]는 [불편함 해결 or 재미] 위해 [화면에서 어떤 행동]을 할 수 있다",
    "유저 시나리오 2",
    "유저 시나리오 3",
    "유저 시나리오 4",
    "유저 시나리오 5"
  ],
  "features": [
    {
      "id": "SYS-REQ-01",
      "name": "쉽게 풀어쓴 기능 이름",
      "desc": "이 기능이 왜 필요하고 유저가 어떻게 쓰는지 페르소나 말투로 설명",
      "criteria": [
        "AI 코딩 완료 후 눈으로 검사할 기준 1",
        "검사 기준 2",
        "검사 기준 3"
      ]
    },
    {
      "id": "SYS-REQ-02",
      "name": "기능 이름 2",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2"]
    },
    {
      "id": "SYS-REQ-03",
      "name": "기능 이름 3",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2"]
    },
    {
      "id": "SYS-REQ-04",
      "name": "기능 이름 4",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2"]
    }
  ],
  "screens": [
    {
      "id": "UI-SCR-01",
      "name": "쉬운 화면 이름 (예: 첫 화면 - 추천 피드와 검색창)",
      "desc": "유저가 앱을 켰을 때 처음 보게 될 화면의 레이아웃과 버튼들의 위치 기획 설명"
    },
    {
      "id": "UI-SCR-02",
      "name": "화면 이름 2",
      "desc": "화면 레이아웃 및 흐름 설명"
    },
    {
      "id": "UI-SCR-03",
      "name": "화면 이름 3",
      "desc": "화면 레이아웃 및 흐름 설명"
    },
    {
      "id": "UI-SCR-04",
      "name": "화면 이름 4",
      "desc": "화면 레이아웃 및 흐름 설명"
    }
  ],
  "prompts": {
    "ui": [
      "v0.dev나 Bolt.new에 복사+붙여넣기하면 세련된 화면 디자인이 튀어나오도록, 레이아웃/색상/Shadcn UI 아이콘까지 완벽하게 지정한 한글 프롬프트 1",
      "버튼 인터랙션과 애니메이션, 반응형 레이아웃까지 포함한 디자인 업그레이드용 프롬프트 2",
      "세부 페이지(상세/설정/프로필 등)의 레이아웃을 지정하는 프롬프트 3"
    ],
    "ide": [
      "Cursor/Windsurf 채팅창에 붙여넣어서 전체 폴더 뼈대와 기본 파일을 생성하라는 아키텍처 프롬프트",
      "API 라우터와 데이터 연결을 자동으로 짜주는 프롬프트",
      "인증/로그인 흐름을 구현하라는 프롬프트"
    ],
    "db": "Supabase SQL Editor에 그대로 붙여넣을 수 있는 완전한 DDL SQL 코드. CREATE TABLE 문과 각 컬럼에 대한 한글 주석을 반드시 포함. RLS(Row Level Security) 정책 예시도 1개 이상 포함."
  }
}
      `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. 에러 해결사
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === "error") {
      prompt = `
${toneDirective}

당신은 초보자를 위한 에러 코치입니다. 아래 에러 로그를 분석하여 **위 페르소나 말투**로 원인과 해결책을 JSON으로 리턴하세요.

에러 내용: "${idea}"

아래 JSON 형식으로만 답변하세요:
{
  "cause": "뭐가 꼬인 건지 페르소나 말투로 일상 비유를 들어 설명 (2-3문장)",
  "solution": "비전공자도 따라 할 수 있게 단계별로 어떻게 고치면 되는지 페르소나 말투로 가이드 (3-4문장)",
  "prompt": "Cursor나 코딩 AI에게 이 문제를 해결해달라고 복붙할 최적의 디버깅 프롬프트 문장 (한글, 1-2문장)"
}
      `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. 프롬프트 리파이너
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === "prompt") {
      prompt = `
${toneDirective}

당신은 최고 수준의 프롬프트 엔지니어입니다.
사용자가 입력한 러프한 프롬프트를 AI 코딩 툴(Cursor, v0 등)이 가장 잘 알아듣는 엔지니어링 품질로 업그레이드하세요.

원본 프롬프트: "${idea}"

아래 JSON 형식으로만 답변해주세요:
{
  "original": "원본 입력 그대로",
  "improved": "역할(Role), 제약 조건(Constraints), 출력 포맷(Output), 기술 스택 지정까지 완벽하게 가미된 고도화 프롬프트 (한글)"
}
      `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. 목 데이터 생성기
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === "mock") {
      prompt = `
기획 주제를 기반으로 프론트엔드에 즉시 사용할 수 있는 고품질 목업 JSON 데이터를 생성하세요.
기획 주제: "${idea}"

반드시 아래 구조를 따르세요. mockData 배열 안에 샘플 객체가 5~8개 들어가야 합니다.
각 객체에는 id, 제목, 설명, 가격/날짜 등 주제에 맞는 현실적인 필드를 포함하세요.

{
  "mockData": [
    { "id": 1, "title": "샘플 1", "description": "설명", "price": 10000, "createdAt": "2025-01-15" },
    { "id": 2, "title": "샘플 2", "description": "설명", "price": 25000, "createdAt": "2025-01-16" }
  ]
}
      `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. 커밋 메시지 메이커
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === "commit") {
      prompt = `
개발자가 작업한 내용을 바탕으로 Conventional Commits 규칙(feat:, fix:, refactor:, docs:, style:, chore:)에 부합하는 세련된 영어 커밋 메시지를 작성하세요.

작업 내용: "${idea}"

아래 JSON 형식으로만 답변하세요:
{
  "message": "feat: 완성된 커밋 메시지"
}
      `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. 가이드 대화 (비JSON)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    else if (type === "guide") {
      useJson = false;
      const lessonMatch = idea.match(/\[레슨:\s*(.+?)\]/);
      const lessonTitle = lessonMatch ? lessonMatch[1] : null;
      const questionOnly = idea
        .replace(/\[레슨:.*?\]/g, "")
        .replace(/이전 대화:/g, "")
        .trim();

      prompt = `
${toneDirective}

당신은 VIBE PROJECT의 바이브코딩 전문 AI 튜터입니다.
학생이 현재 보고 있는 레슨: "${lessonTitle || "일반 질문"}"
대화 내용: ${questionOnly}

위 페르소나 말투로 한국어 3-5문장으로 답변해주세요.
      `;
    } else {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 타입입니다." },
        { status: 400 }
      );
    }

    // ── Groq 호출 ──
    const result = await callGroq(prompt, useJson);

    // guide 타입은 텍스트 그대로 반환
    if (type === "guide") {
      return NextResponse.json({
        success: true,
        data: result.text,
        model: result.model,
      });
    }

    // ── JSON 파싱 (안정성 강화) ──
    let cleanedText = result.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(
        /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
        " "
      )
      .trim();

    const jsonMatch = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error("JSON 형식 응답을 파싱하지 못했습니다.");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      try {
        let fixTarget = jsonMatch[0];
        const lastBrace = fixTarget.lastIndexOf("}");
        const lastBracket = fixTarget.lastIndexOf("]");
        const cutPoint = Math.max(lastBrace, lastBracket);
        fixTarget = fixTarget.substring(0, cutPoint + 1);
        parsed = JSON.parse(fixTarget);
      } catch {
        throw new Error(
          "AI의 출력 데이터를 규격화된 객체로 전환하는 데 실패했습니다."
        );
      }
    }

    // mock 데이터 가공
    if (type === "mock") {
      const mockArray =
        parsed?.mockData ||
        (Array.isArray(parsed) ? parsed : [parsed]);
      return NextResponse.json({
        success: true,
        data: { jsonCode: JSON.stringify(mockArray, null, 2) },
        model: result.model,
      });
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      model: result.model,
    });
  } catch (error: any) {
    console.error("API 상세 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "AI 응답 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
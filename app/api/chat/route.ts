import { NextRequest, NextResponse } from "next/server";

// ── API 키 배열 (3개) ──
const API_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = "llama-3.3-70b-versatile";

let currentKeyIndex = 0;

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
    max_tokens: 8000,
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

export async function GET() {
  return NextResponse.json({
    success: true,
    model: MODEL,
    provider: "Groq",
    keysActive: API_KEYS.length,
    status: "정상 작동 중",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { idea, type, platform, bm, tone } = await req.json();
    const toneDirective = getToneDirective(tone || "kind");
    let prompt = "";
    let useJson = true;

    if (type === "plan") {
      prompt = `
${toneDirective}

당신은 실리콘밸리 출신 10년차 스타트업 전문 컨설턴트이자, 비전공자 대학생들을 위한 최고의 서비스 기획 멘토입니다.
반드시 아래 규칙을 따르세요:
1. 모든 내용은 반드시 한국어로 작성하세요.
2. 전문적이고 구체적인 내용으로 작성하되, 비전공자도 이해할 수 있는 쉬운 언어를 사용하세요.
3. 실제 존재하는 서비스(당근마켓, 카카오, 토스 등)를 예시로 들어 설명하세요.
4. 각 기능은 실제로 구현 가능한 수준으로 구체적으로 작성하세요.
5. userStories는 실제 사용자가 겪을 법한 구체적인 상황을 묘사하세요.
6. features의 criteria는 실제로 테스트 가능한 기준으로 작성하세요.
7. prompts의 ui/ide/db는 실제로 복붙해서 바로 쓸 수 있는 수준으로 매우 상세하게 작성하세요.

**위 [페르소나 지시]의 말투를 summary, problem, target, 각 기능의 desc, criteria 전체에 일관되게 적용하세요.**

사용자 아이디어 원문: "${idea}"
선택된 타겟 플랫폼 규격: "${platform || "지정되지 않음"}"
선택된 비즈니스 모델(BM): "${bm || "지정되지 않음"}"

아래의 JSON Schema 형식을 정확하게 준수하여 채워주세요. Key 명칭을 절대 바꾸지 마십시오.
마크다운 등 앞뒤 부연설명 없이 오직 순수한 JSON만 반환해야 합니다:

{
  "summary": "이 서비스의 핵심 구조와 오늘 당장 무엇을 만들면 되는지 페르소나 말투로 요약한 코칭 메시지 (2-3문장, 구체적인 기술 스택과 구현 방법 포함)",
  "problem": "이 서비스가 해결하려는 불편함을 당근마켓/토스/카카오 같은 실제 서비스 사례를 들어 페르소나 말투로 정의 (2-3문장)",
  "target": "나이/직업/생활패턴까지 구체적으로 묘사한 타겟 페르소나 설명. 예: '매일 아침 지하철을 타는 25세 직장인 김지수씨는...' (2-3문장)",
  "userStories": [
    "구체적인 상황과 행동이 담긴 유저 시나리오 1 (예: 자취생 유저가 냉장고 속 재료를 앱에 입력하면...)",
    "유저 시나리오 2",
    "유저 시나리오 3",
    "유저 시나리오 4",
    "유저 시나리오 5"
  ],
  "features": [
    {
      "id": "SYS-REQ-01",
      "name": "기능 이름 (한국어로 쉽게)",
      "desc": "이 기능이 왜 필요하고 유저가 어떻게 쓰는지 페르소나 말투로 구체적으로 설명 (당근마켓의 채팅기능처럼 구체적인 예시 포함)",
      "criteria": [
        "버튼을 클릭했을 때 1초 이내에 응답이 오는가",
        "입력값이 비어있을 때 빨간 경고 문구가 뜨는가",
        "완료 후 성공 메시지가 화면에 표시되는가"
      ]
    },
    {
      "id": "SYS-REQ-02",
      "name": "기능 이름 2",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2", "검사 기준 3"]
    },
    {
      "id": "SYS-REQ-03",
      "name": "기능 이름 3",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2", "검사 기준 3"]
    },
    {
      "id": "SYS-REQ-04",
      "name": "기능 이름 4",
      "desc": "기능 설명",
      "criteria": ["검사 기준 1", "검사 기준 2", "검사 기준 3"]
    }
  ],
  "screens": [
    {
      "id": "UI-SCR-01",
      "name": "화면 이름",
      "desc": "이 화면에서 유저가 보게 될 요소들을 위에서 아래 순서로 나열. 예: 상단 로고/검색바 → 카테고리 필터 탭 → 상품 카드 그리드(이미지+제목+가격) → 하단 네비게이션 바"
    },
    {
      "id": "UI-SCR-02",
      "name": "화면 이름 2",
      "desc": "화면 구성 상세 설명"
    },
    {
      "id": "UI-SCR-03",
      "name": "화면 이름 3",
      "desc": "화면 구성 상세 설명"
    },
    {
      "id": "UI-SCR-04",
      "name": "화면 이름 4",
      "desc": "화면 구성 상세 설명"
    }
  ],
  "prompts": {
    "ui": [
      "【v0.dev/bolt.new 전용 UI 프롬프트 1】 다음 조건을 모두 만족하는 Next.js 14 + Tailwind CSS + shadcn/ui 기반의 [서비스명] 메인 페이지를 만들어줘. 1) 상단 네비게이션: 로고(좌측) + 메뉴(우측, 모바일에서는 햄버거 메뉴로 변환) 2) 히어로 섹션: 큰 제목 + 부제목 + CTA 버튼 2개(주요/보조) + 배경은 그라디언트 3) 기능 소개 섹션: 카드 3개를 가로로 배치(아이콘+제목+설명) 4) 색상 테마: 메인컬러 파란색 계열(#2563eb), 배경 흰색, 다크모드 지원 5) 폰트: 한국어 최적화를 위해 Noto Sans KR 사용 6) 반응형: 모바일/태블릿/데스크탑 모두 완벽 지원 7) 모든 텍스트는 한국어로 작성",
      "【v0.dev/bolt.new 전용 UI 프롬프트 2】 위에서 만든 페이지에 추가로 다음을 구현해줘. 1) 사용자 리뷰/후기 섹션: 별점(★) + 텍스트 + 작성자 이름이 있는 카드 3개를 가로 배치 2) FAQ 아코디언 섹션: 질문 클릭시 답변이 펼쳐지는 인터랙션 5개 3) 하단 푸터: 회사명/이용약관/개인정보처리방침 링크 + 소셜미디어 아이콘 4) 스크롤 애니메이션: 각 섹션이 화면에 들어올 때 부드럽게 페이드인 5) 로딩 스피너: 버튼 클릭시 로딩 상태 표시",
      "【v0.dev/bolt.new 전용 UI 프롬프트 3】 다음 조건의 상세 페이지와 폼 화면을 만들어줘. 1) 상세 페이지: 좌측 이미지 갤러리 + 우측 정보(제목/가격/설명/버튼) 레이아웃 2) 입력 폼: 각 필드에 라벨+플레이스홀더+에러메시지 표시, 제출 버튼은 입력 완료시에만 활성화 3) 모달 팝업: 확인/취소 버튼이 있는 다이얼로그 4) 토스트 알림: 성공(초록)/실패(빨강)/정보(파랑) 3가지 5) 빈 상태 화면: 데이터 없을 때 일러스트+안내문구+액션버튼 표시"
    ],
    "ide": [
      "【Cursor AI 채팅창(Ctrl+L 또는 Cmd+L) 전용 프롬프트 1 - 프로젝트 초기 세팅】 나는 비전공자 대학생이고 Next.js로 처음 프로젝트를 만들고 있어. 아래 스펙으로 프로젝트 초기 구조를 완성해줘. [기술 스택] - Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui - Backend: Next.js API Routes - Database: Supabase (PostgreSQL) - 배포: Vercel [폴더 구조 요청] app/ 폴더 안에 (메인페이지)/(상세페이지)/(마이페이지) 라우트를 만들고, components/ 폴더에 공통 컴포넌트(Header, Footer, Button, Card)를 만들어줘. 각 파일에 한국어 주석을 달아줘.",
      "【Cursor AI 채팅창 전용 프롬프트 2 - API 및 데이터 연결】 Supabase와 연결해서 데이터를 불러오는 기능을 만들어줘. 1) app/api/ 폴더에 GET/POST/PUT/DELETE API 라우트 파일을 만들어줘 2) Supabase 클라이언트 설정 파일(lib/supabase.ts)을 만들어줘 3) 데이터를 불러올 때 로딩 스피너를 보여주고, 에러 발생시 사용자에게 친절한 한국어 에러 메시지를 보여줘 4) 환경변수는 .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 사용해줘 5) 모든 코드에 한국어 주석을 달아줘",
      "【Cursor AI 채팅창 전용 프롬프트 3 - 로그인/회원가입 구현】 Supabase Auth를 사용해서 이메일/비밀번호 로그인과 구글 소셜 로그인을 구현해줘. 1) 로그인 페이지(app/login/page.tsx): 이메일+비밀번호 입력폼 + 구글 로그인 버튼 2) 회원가입 페이지(app/signup/page.tsx): 이름+이메일+비밀번호+비밀번호확인 입력폼 3) 로그인 상태에 따라 헤더의 버튼이 '로그인'에서 '로그아웃+내 프로필'로 바뀌게 해줘 4) 로그인 안한 사용자가 보호된 페이지에 접근하면 자동으로 로그인 페이지로 이동시켜줘 5) 모든 에러 메시지는 한국어로 보여줘"
    ],
    "db": "-- =============================================\n-- [서비스명] Supabase 데이터베이스 설계\n-- Supabase 대시보드 → SQL Editor → 아래 코드 전체 복사 후 실행\n-- =============================================\n\n-- 1. 사용자 프로필 테이블 (Supabase Auth와 연동)\nCREATE TABLE IF NOT EXISTS public.profiles (\n  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, -- 사용자 고유 ID (자동생성)\n  nickname VARCHAR(50) NOT NULL, -- 닉네임\n  email VARCHAR(255) NOT NULL, -- 이메일\n  avatar_url TEXT, -- 프로필 이미지 URL\n  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- 가입일시\n  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- 최종수정일시\n);\n\n-- 2. 메인 콘텐츠 테이블\nCREATE TABLE IF NOT EXISTS public.posts (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 게시물 고유 ID\n  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- 작성자 ID\n  title VARCHAR(200) NOT NULL, -- 제목\n  content TEXT NOT NULL, -- 내용\n  category VARCHAR(50), -- 카테고리\n  image_url TEXT, -- 이미지 URL\n  view_count INTEGER DEFAULT 0, -- 조회수\n  is_active BOOLEAN DEFAULT TRUE, -- 활성화 여부\n  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- 작성일시\n  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL -- 수정일시\n);\n\n-- 3. RLS(행 수준 보안) 정책 설정\n-- 누구나 읽기 가능\nALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"누구나 게시물 조회 가능\" ON public.posts FOR SELECT USING (true);\n-- 본인 글만 수정/삭제 가능\nCREATE POLICY \"본인 게시물만 수정 가능\" ON public.posts FOR UPDATE USING (auth.uid() = user_id);\nCREATE POLICY \"본인 게시물만 삭제 가능\" ON public.posts FOR DELETE USING (auth.uid() = user_id);\n-- 로그인한 사용자만 작성 가능\nCREATE POLICY \"로그인 사용자만 작성 가능\" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);\n\n-- 4. 자동 updated_at 갱신 트리거\nCREATE OR REPLACE FUNCTION update_updated_at()\nRETURNS TRIGGER AS $$\nBEGIN NEW.updated_at = NOW(); RETURN NEW; END;\n$$ LANGUAGE plpgsql;\nCREATE TRIGGER set_updated_at BEFORE UPDATE ON public.posts\nFOR EACH ROW EXECUTE FUNCTION update_updated_at();"
  }
}
      `;
    }

    else if (type === "error") {
      prompt = `
${toneDirective}

당신은 초보자를 위한 에러 코치입니다. 아래 에러 로그를 분석하여 **위 페르소나 말투**로 원인과 해결책을 JSON으로 리턴하세요.

에러 내용: "${idea}"

반드시 아래 규칙을 따르세요:
1. 모든 내용은 한국어로 작성하세요.
2. 에러 원인을 일상적인 비유를 들어 설명하세요. (예: "마치 편의점에서 존재하지 않는 상품 바코드를 찍으려는 것과 같아요")
3. 해결 방법은 1단계, 2단계, 3단계로 나눠서 설명하세요.
4. Cursor AI에게 전달할 프롬프트는 복붙해서 바로 쓸 수 있도록 구체적으로 작성하세요.

아래 JSON 형식으로만 답변하세요:
{
  "cause": "에러 원인을 일상적인 비유를 들어 2-3문장으로 쉽게 설명",
  "solution": "1단계: [첫 번째 할 일]\\n2단계: [두 번째 할 일]\\n3단계: [세 번째 할 일]",
  "prompt": "Cursor AI 채팅창에 그대로 복붙할 수 있는 구체적인 한국어 디버깅 프롬프트 (예: '다음 에러가 발생했어. [에러내용]. 이 에러의 원인을 찾아서 수정해줘. 수정 후 동일한 에러가 다시 발생하지 않도록 방어 코드도 추가해줘.')"
}
      `;
    }

    else if (type === "prompt") {
      prompt = `
${toneDirective}

당신은 최고 수준의 프롬프트 엔지니어입니다.
사용자가 입력한 러프한 프롬프트를 v0.dev, bolt.new, Cursor AI가 가장 잘 알아듣는 엔지니어링 품질로 업그레이드하세요.

반드시 아래 규칙을 따르세요:
1. 개선된 프롬프트는 한국어로 작성하세요.
2. 역할(Role), 기술스택(Stack), 제약조건(Constraints), 출력포맷(Output Format)을 명시하세요.
3. UI 관련이면 색상/레이아웃/반응형/한국어 지원을 반드시 포함하세요.
4. 기능 관련이면 에러처리/로딩상태/성공메시지를 반드시 포함하세요.

원본 프롬프트: "${idea}"

아래 JSON 형식으로만 답변해주세요:
{
  "original": "원본 입력 그대로",
  "improved": "역할/기술스택/제약조건/출력포맷이 모두 포함된 고도화 프롬프트 (한국어, 복붙해서 바로 쓸 수 있는 수준)"
}
      `;
    }

    else if (type === "mock") {
      prompt = `
기획 주제를 기반으로 프론트엔드에 즉시 사용할 수 있는 고품질 한국어 목업 JSON 데이터를 생성하세요.
기획 주제: "${idea}"

반드시 아래 규칙을 따르세요:
1. 모든 텍스트 데이터는 한국어로 작성하세요.
2. 이름은 실제 한국 이름처럼 (김민준, 이서연 등), 주소는 한국 주소처럼 작성하세요.
3. mockData 배열 안에 샘플 객체가 6~8개 들어가야 합니다.
4. 각 객체에는 id, 제목, 설명, 가격/날짜 등 주제에 맞는 현실적인 필드를 포함하세요.
5. 가격은 원화(10000, 25000 등)로 표시하세요.

{
  "mockData": [
    { "id": 1, "title": "한국어 샘플 제목 1", "description": "한국어 설명", "price": 10000, "author": "김민준", "createdAt": "2025-01-15" },
    { "id": 2, "title": "한국어 샘플 제목 2", "description": "한국어 설명", "price": 25000, "author": "이서연", "createdAt": "2025-01-16" }
  ]
}
      `;
    }

    else if (type === "commit") {
      prompt = `
개발자가 작업한 내용을 바탕으로 Conventional Commits 규칙(feat:, fix:, refactor:, docs:, style:, chore:)에 부합하는 세련된 영어 커밋 메시지를 작성하세요.

작업 내용: "${idea}"

규칙:
1. 타입(feat/fix 등) 선택이 정확해야 합니다.
2. 제목은 50자 이내로 간결하게 작성하세요.
3. 동사는 현재형으로 시작하세요. (add, fix, update, remove 등)

아래 JSON 형식으로만 답변하세요:
{
  "message": "feat: 완성된 커밋 메시지"
}
      `;
    }

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

반드시 아래 규칙을 따르세요:
1. 위 페르소나 말투로 한국어 3-5문장으로 답변하세요.
2. 어려운 개발 용어는 일상적인 비유로 설명하세요.
3. 구체적인 다음 행동 지침을 포함하세요.
      `;
    } else {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 타입입니다." },
        { status: 400 }
      );
    }

    const result = await callGroq(prompt, useJson);

    if (type === "guide") {
      return NextResponse.json({
        success: true,
        data: result.text,
        model: result.model,
      });
    }

    let cleanedText = result.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
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
        throw new Error("AI의 출력 데이터를 규격화된 객체로 전환하는 데 실패했습니다.");
      }
    }

    if (type === "mock") {
      const mockArray =
        parsed?.mockData || (Array.isArray(parsed) ? parsed : [parsed]);
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
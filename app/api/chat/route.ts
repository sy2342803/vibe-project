import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

// [기존 유지] 사용 가능한 구글 모델 목록을 조회하는 뼈대
async function getAvailableModels() {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`모델 목록 조회 실패: ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  const models =
    data.models
      ?.filter((model: any) =>
        (model.supportedGenerationMethods || []).includes("generateContent")
      )
      .map((model: any) => model.name.replace("models/", "")) || [];

  return models;
}

// [기존 유지] 선호하는 최신 모델 순서 배치
async function getPreferredModels() {
  const availableModels = await getAvailableModels();

  const preferredOrder = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest",
  ];

  const matched = preferredOrder.filter((model) =>
    availableModels.includes(model)
  );

  if (matched.length > 0) {
    return matched;
  }

  const fallback = availableModels.filter((model: string) =>
    model.includes("gemini")
  );

  if (fallback.length === 0) {
    throw new Error("사용 가능한 Gemini 모델을 찾지 못했습니다.");
  }

  return fallback;
}

// [기존 유지] 모델 호출 API 가공 레이어
async function tryModel(model: string, prompt: string, useJson: boolean = true) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const body: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  if (useJson) {
    body.generationConfig = {
      responseMimeType: "application/json",
    };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `모델 호출 실패: ${model}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error(`${model} 응답 텍스트가 비어 있습니다.`);
  }

  return { text, model };
}

// [기존 유지] 폴백 순회 호출기
async function callGemini(prompt: string, useJson: boolean = true) {
  const modelsToTry = await getPreferredModels();
  const errors: string[] = [];

  for (const model of modelsToTry) {
    try {
      const result = await tryModel(model, prompt, useJson);
      return result;
    } catch (error: any) {
      errors.push(`${model}: ${error.message}`);
    }
  }

  throw new Error(
    `사용 가능한 모델 호출에 모두 실패했습니다.\n${errors.join("\n")}`
  );
}

// [기존 유지] GET 라우트 호환
export async function GET() {
  try {
    const models = await getAvailableModels();
    const preferredModels = await getPreferredModels();

    return NextResponse.json({
      success: true,
      models,
      preferredModels,
    });
  } catch (error: any) {
    console.error("모델 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "모델 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 🚀 POST 라우트: 비전공자 맞춤형 친절한 멘토 버전
export async function POST(req: NextRequest) {
  try {
    const { idea, type, platform, bm } = await req.json();

    let prompt = "";
    let useJson = true;

    // 1. 메인 초보자 친화적 기획서 생성 엔진
    if (type === "plan") {
      prompt = `
당신은 코딩과 개발 용어를 전혀 모르는 비전공자 대학생들을 위한 최고의 친절한 스타트업 멘토이자 가이드입니다.
사용자가 입력한 대략적인 아이디어를 분석하여, 개발자 수준의 전문성을 내포하되 "철저하게 초등학생도 이해할 수 있는 쉬운 일상 용어와 비유"를 사용하여 기획 요건을 정리하고 JSON 포맷으로 생성해야 합니다.

사용자 아이디어 원문: "${idea}"
선택된 타겟 플랫폼 규격: "${platform || "지정되지 않음 (전체 플랫폼)"}"
선택된 비즈니스 모델(BM): "${bm || "지정되지 않음"}"

아래의 JSON Schema 형식을 정확하게 준수하여 채워주세요. 프론트엔드와 완벽하게 연동되어야 하므로 Key 명칭을 절대 바꾸지 마십시오.
마크다운(\`\`\`json) 등 앞뒤 부연설명 없이 오직 순수한 JSON만 반환해야 합니다:

{
  "summary": "비전공자가 이 기획을 보고 바로 안심할 수 있도록, 이 서비스의 핵심 구조와 오늘 당장 무엇을 만들면 되는지 다정한 말투로 요약한 코칭 메시지 (2-3문장)",
  "problem": "이 서비스가 해결하려는 불편함을 친근한 일상 사례를 들어 쉽게 정의한 내용 (2-3문장)",
  "target": "이 서비스를 가장 먼저 좋아해 줄 구체적인 사람들의 모습이나 페르소나 설명 (2-3문장)",
  "userStories": [
    "유저 시나리오 1 (형식: [어떤 유저]는 [불편함을 해결하거나 재미를 느끼기] 위해 [화면에서 어떤 행동]을 할 수 있다)",
    "유저 시나리오 2"
  ],
  "features": [
    {
      "id": "SYS-REQ-01",
      "name": "쉽게 풀어쓴 기능 이름 (예: 1초만에 물건 등록하는 카메라 버튼)",
      "desc": "이 기능이 왜 필요하고 유저가 어떻게 쓰는지 친절하게 설명",
      "criteria": [
        "AI에게 코드를 다 짜달라고 한 뒤, 제대로 만들어졌는지 눈으로 검사할 기준 1 (예: 카메라 버튼을 누르면 스마트폰 갤러리가 열려야 해요.)",
        "AI에게 검사할 기준 2"
      ]
    },
    {
      "id": "SYS-REQ-02",
      "name": "쉽게 풀어쓴 기능 이름 2",
      "desc": "기능 설명",
      "criteria": [
        "AI에게 검사할 기준 1",
        "AI에게 검사할 기준 2"
      ]
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
      "name": "쉬운 화면 이름 2",
      "desc": "화면 레이아웃 및 흐름 상세 설명"
    }
  ],
  "prompts": {
    "ui": [
      "v0.dev 나 Bolt.new 사이트에 그대로 복사+붙여넣기 하면 '코딩 없이' 실무 등급의 세련된 화면 디자인 컴포넌트가 마법처럼 튀어나오도록, 레이아웃/색상/Shadcn UI 아이콘까지 완벽하게 지정하여 명령하는 한글 초고품질 프롬프트 1",
      "사용자가 버튼을 누르거나 필터를 바꿀 때 화면이 부드럽게 움직이도록 유도하는 디자인 완성도 업그레이드용 프롬프트 2"
    ],
    "ide": [
      "Cursor 나 Windsurf 같은 AI 코드 에디터 프로그램의 채팅창에 붙여넣어서 '이 앱의 전체 폴더 뼈대와 기본 파일들을 알아서 만들라'고 지시하는 초보자 맞춤형 아키텍처 프롬프트",
      "데이터가 화면 및 서버 사이에서 안전하게 오고 가도록 API 라우터를 자동으로 파주는 연결용 프롬프트"
    ],
    "db": "데이터베이스(엑셀처럼 정보가 저장되는 방)에 데이터를 쌓기 위해 필요한 테이블 구조입니다. Supabase나 SQL 툴에 그대로 붙여넣을 수 있는 완벽한 DDL SQL 코드 블록을 작성하고, 비전공자도 이해하기 쉽게 '어떤 정보들이 저장되는지' 해설을 덧붙여주세요."
  }
}
      `;
    } 
    
    // 2. Step 4 전용: 초보자 맞춤 에러 코치
    else if (type === "error") {
      prompt = `
당신은 초보자를 위한 에러 코치입니다. 아래 에러 로그를 분석하여 아주 쉬운 말로 원인과 해결책을 JSON으로 리턴하세요.
에러 내용: "${idea}"

아래 JSON 형식으로만 답변하세요:
{
  "cause": "어려운 컴퓨터 용어 빼고, 뭐가 꼬인 건지 일상 비유로 설명 (2-3문장)",
  "solution": "메모장을 켜서 몇 번째 줄을 어떻게 고치면 되는지 주니어/비전공자도 따라 할 수 있는 가이드라인",
  "prompt": "Cursor나 코딩 AI에게 이 문제를 해결해달라고 요청할 때 복사해서 붙여넣기 좋은 최적의 디버깅 프롬프트 문장"
}
      `;
    } 
    
    // 3. Step 4 전용: 프롬프트 리파이너
    else if (type === "prompt") {
      prompt = `
당신은 최고 수준의 프롬프트 엔지니어입니다. 사용자가 입력한 러프한 프롬프트를 AI 코딩 툴(Cursor, v0 등)이 가장 잘 알아듣는 엔지니어링 폼으로 빌드업하세요.
원본 프롬프트: "${idea}"

아래 JSON 형식으로만 답변해주세요:
{
  "original": "원본 입력 조건 그대로 출력",
  "improved": "역할 부여(Role), 제약 조건(Constraints), 출력 포맷(Output)이 완벽하게 가미된 초고품질 고도화 프롬프트 문장"
}
      `;
    } 
    
    // 4. Step 4 전용: 더미 데이터 생성기
    else if (type === "mock") {
      prompt = `
사용자가 기획 중인 서비스 아이디어 주제를 기반으로, 프론트엔드 마크업 개발에 즉시 임베딩할 수 있는 고품질의 가짜 목업 JSON 데이터를 생성하세요.
기획 주제: "${idea}"

데이터는 무조건 배열 구조를 포함해야 하며 가짜 샘플 데이터 객체가 5개 이상 꼼꼼하게 들어가 있어야 합니다. 
아래 JSON 형식으로만 답변하세요:
{
  "jsonCode": "이 자리에 문자열 형태로 이스케이프된 순수 JSON 배열 데이터를 넣어주세요. 예: [\\n  {\\n    \\\"id\\\": 1,\\n    ...\\n  }\\n]"
}
      `;
    } 
    
    // 5. Step 4 전용: 깃 커밋 메시지 메이커
    else if (type === "commit") {
      prompt = `
개발자가 작업한 내용을 바탕으로 Conventional Commits 규칙(feat:, fix:, refactor:, docs:)에 완벽히 부합하는 세련된 영어 커밋 메시지를 빌드하세요.
작업 내용: "${idea}"

아래 JSON 형식으로만 답변하세요:
{
  "message": "feat: 완성된 커밋 메시지 한 줄 기입"
}
      `;
    } 
    
    // 6. [기존 유지] 가이드 도구 호환 레이어
    else if (type === "guide") {
      useJson = false;
      const lessonMatch = idea.match(/\[레슨:\s*(.+?)\]/);
      const lessonTitle = lessonMatch ? lessonMatch[1] : null;
      const questionOnly = idea.replace(/\[레슨:.*?\]/g, "").replace(/이전 대화:/g, "").trim();

      prompt = `
당신은 VIBE PROJECT의 바이브코딩 전문 AI 튜터입니다.
학생이 현재 보고 있는 레슨: "${lessonTitle || "일반 질문"}"
대화 내용: ${questionOnly}

한국어로 3-5문장으로 친근하고 쉽게 풀어서 응원하는 톤으로 답변해주세요.
      `;
    } else {
      return NextResponse.json({ success: false, error: "잘못된 요청 타입입니다." }, { status: 400 });
    }

    // 기존의 안전한 가용 모델 폴백 순회 함수 호출
    const result = await callGemini(prompt, useJson);

    if (type === "guide") {
      return NextResponse.json({
        success: true,
        data: result.text,
        model: result.model,
      });
    }

    // [기존 유지] 안정적인 정규식 기반 JSON 파싱 및 구조 정리 로직
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON 형식 응답을 파싱하지 못했습니다.");
    }

    let cleanedJson = jsonMatch[0]
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedJson);
    } catch {
      const lastBrace = cleanedJson.lastIndexOf("}");
      cleanedJson = cleanedJson.substring(0, lastBrace + 1);
      parsed = JSON.parse(cleanedJson);
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
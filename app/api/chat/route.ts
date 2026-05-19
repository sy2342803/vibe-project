import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

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

async function getPreferredModels() {
  const availableModels = await getAvailableModels();

  const preferredOrder = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-001",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
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

export async function POST(req: NextRequest) {
  try {
    const { idea, type } = await req.json();

    let prompt = "";
    let useJson = true;

    if (type === "plan") {
      prompt = `
당신은 비전공자 대학생의 창업 아이디어를 도와주는 친절한 AI 튜터입니다.
아래 아이디어를 분석해서 JSON 형태로 기획을 정리해주세요.

아이디어: "${idea}"

아래 JSON 형식으로만 답변해주세요. 다른 말은 하지 마세요:
{
  "problem": "문제 정의 (2-3문장)",
  "target": "대상 사용자 (2-3문장)",
  "features": ["핵심 기능 1", "핵심 기능 2", "핵심 기능 3"],
  "screens": ["필요한 화면 1", "필요한 화면 2", "필요한 화면 3"],
  "prompts": [
    "Cursor나 ChatGPT에 바로 쓸 수 있는 구체적인 프롬프트 1",
    "Cursor나 ChatGPT에 바로 쓸 수 있는 구체적인 프롬프트 2",
    "Cursor나 ChatGPT에 바로 쓸 수 있는 구체적인 프롬프트 3"
  ]
}
      `;
    } else if (type === "error") {
      prompt = `
당신은 비전공자 대학생의 코딩 에러를 도와주는 친절한 AI 튜터입니다.
아래 에러 메시지를 쉬운 말로 해석하고 해결 방법을 알려주세요.

에러 메시지: "${idea}"

아래 JSON 형식으로만 답변해주세요. 다른 말은 하지 마세요:
{
  "cause": "에러 원인 (쉬운 말로 2-3문장)",
  "solution": "해결 방법 (단계별로 설명)",
  "prompt": "이 에러를 AI에게 해결 요청하는 프롬프트"
}
      `;
    } else if (type === "prompt") {
      prompt = `
당신은 비전공자 대학생의 바이브 코딩을 도와주는 친절한 AI 튜터입니다.
아래의 막연한 프롬프트를 AI가 이해하기 쉬운 구체적인 바이브 코딩용 프롬프트로 개선해주세요.

원본 프롬프트: "${idea}"

아래 JSON 형식으로만 답변해주세요. 다른 말은 하지 마세요:
{
  "original": "원본 프롬프트 그대로",
  "improved": "개선된 프롬프트 (구체적이고 명확하게)",
  "reason": "왜 이렇게 바꿨는지 쉬운 말로 설명 (2-3문장)",
  "tips": ["좋은 프롬프트 작성 팁 1", "좋은 프롬프트 작성 팁 2", "좋은 프롬프트 작성 팁 3"]
}
      `;
    } else if (type === "guide") {
      useJson = false;

      // 레슨 맥락 파싱
      const lessonMatch = idea.match(/\[레슨:\s*(.+?)\]/);
      const lessonTitle = lessonMatch ? lessonMatch[1] : null;
      const questionOnly = idea
        .replace(/\[레슨:.*?\]/g, "")
        .replace(/이전 대화:/g, "")
        .trim();

      prompt = `
당신은 VIBE PROJECT의 바이브코딩 전문 AI 튜터입니다.

## 당신의 역할
- 비전공자, 특히 지역 대학의 문과생들에게 바이브코딩을 가르치는 친절한 선생님
- 어려운 개발 용어 대신 일상적인 말로 설명
- 실용적인 예시와 함께 설명
- 학생이 스스로 할 수 있다는 자신감을 심어주기

## 바이브코딩 핵심 지식
- 바이브코딩(Vibe Coding): AI와 자연어로 대화하며 코드를 만드는 방식
- 2025년 Andrej Karpathy가 제안한 새로운 개발 패러다임
- 핵심 도구: Cursor, ChatGPT, Claude, Gemini, v0.dev, Bolt.new
- 비전공자도 아이디어를 코드로 구현할 수 있게 해주는 혁신적인 방법

## 좋은 프롬프트 vs 나쁜 프롬프트
나쁜 예: "맛집 앱 만들어줘"
좋은 예: "React와 Tailwind CSS를 사용해서 학교 근처 맛집을 카드 형태로 보여주는 메인 페이지를 만들어줘. 각 카드에는 가게 이름, 별점, 리뷰 수가 포함되어야 해."

## 바이브코딩 5단계
1. 아이디어 구체화
2. 기획 정리
3. 프롬프트 작성
4. 코드 적용
5. 에러 해결

## 현재 상황
${lessonTitle ? `학생이 현재 보고 있는 레슨: "${lessonTitle}"` : "학생이 일반적인 질문을 하고 있습니다."}

## 답변 규칙
- 항상 한국어로 답변
- 3-5문장으로 간결하게
- 어려운 용어는 쉽게 풀어서 설명
- 필요하면 짧은 코드 예시 포함
- 학생을 응원하는 따뜻하고 친근한 톤 유지
- 이전 대화 맥락을 참고해서 자연스럽게 이어서 답변

## 대화 내용
${questionOnly}
      `;
    } else {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 타입입니다." },
        { status: 400 }
      );
    }

    const result = await callGemini(prompt, useJson);

    // guide 타입은 텍스트 그대로 반환
    if (type === "guide") {
      return NextResponse.json({
        success: true,
        data: result.text,
        model: result.model,
      });
    }

    // 나머지는 JSON 파싱
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
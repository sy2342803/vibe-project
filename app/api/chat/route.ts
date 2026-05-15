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

  // 더 안정적인 모델부터 우선 시도
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

async function tryModel(model: string, prompt: string) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
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

async function callGemini(prompt: string) {
  const modelsToTry = await getPreferredModels();
  const errors: string[] = [];

  for (const model of modelsToTry) {
    try {
      const result = await tryModel(model, prompt);
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
    } else {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 타입입니다." },
        { status: 400 }
      );
    }

    const result = await callGemini(prompt);

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON 형식 응답을 파싱하지 못했습니다.");
    }

    const parsed = JSON.parse(jsonMatch[0]);

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
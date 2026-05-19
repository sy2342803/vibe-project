import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL이 필요합니다." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Vibe Project)",
        },
      }
    );

    if (!response.ok) {
      throw new Error("단축 API 호출 실패");
    }

    const shortUrl = await response.text();

    if (!shortUrl.startsWith("https://tinyurl.com/")) {
      return NextResponse.json({
        success: true,
        shortUrl: url,
        fallback: true,
      });
    }

    return NextResponse.json({
      success: true,
      shortUrl,
    });
  } catch (error) {
    console.error("URL 단축 에러:", error);
    return NextResponse.json(
      { success: false, error: "단축 실패" },
      { status: 500 }
    );
  }
}
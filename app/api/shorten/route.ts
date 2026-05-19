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

    // ✅ TinyURL 호출 (미리보기 페이지 우회)
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error("단축 API 호출 실패");
    }

    let shortUrl = await response.text();

    // ✅ 미리보기 경로가 끼어들면 제거
    shortUrl = shortUrl
      .replace("/preview/deprecated/", "/")
      .replace("/preview/", "/");

    // 응답이 정상 URL인지 검증
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
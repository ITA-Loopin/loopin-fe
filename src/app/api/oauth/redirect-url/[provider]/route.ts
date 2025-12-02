import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.loopin.co.kr";

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;

    const response = await fetch(
      `${API_BASE_URL}/rest-api/v1/oauth/redirect-url/${provider}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // 서버 사이드에서는 CORS 문제가 없으므로 credentials 불필요
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch redirect URL", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OAuth redirect URL fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}




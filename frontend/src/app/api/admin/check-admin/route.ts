import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const res = await fetch(`http://localhost:8080/api/v1/admin/check?userId=${userId}`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error checking admin:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

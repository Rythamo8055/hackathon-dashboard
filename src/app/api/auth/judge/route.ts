import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.findUnique({
      where: { username },
    });

    if (!judge || judge.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return judge info without password
    const { password: _, ...judgeWithoutPassword } = judge;
    return NextResponse.json(judgeWithoutPassword);
  } catch (error) {
    console.error("Error authenticating judge:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

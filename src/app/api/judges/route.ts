import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const judges = await prisma.judge.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        ratings: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { username: "asc" },
    });

    return NextResponse.json(judges);
  } catch (error) {
    console.error("Error fetching judges:", error);
    return NextResponse.json(
      { error: "Failed to fetch judges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "Username, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await prisma.judge.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.create({
      data: { username, password, name },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    return NextResponse.json(judge, { status: 201 });
  } catch (error) {
    console.error("Error creating judge:", error);
    return NextResponse.json(
      { error: "Failed to create judge" },
      { status: 500 }
    );
  }
}

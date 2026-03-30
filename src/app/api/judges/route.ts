import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, invalidateCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "judges-list";
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const judges = await prisma.judge.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        _count: {
          select: { ratings: true },
        },
      },
      orderBy: { username: "asc" },
    });

    const result = judges.map((j) => ({
      ...j,
      ratings: Array(j._count.ratings).fill(null), // For backwards compat
      ratingsCount: j._count.ratings,
    }));

    setCache(cacheKey, result, CACHE_TTL.JUDGES);
    return NextResponse.json(result);
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

    const existing = await prisma.judge.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.create({
      data: { username, password, name },
      select: { id: true, username: true, name: true },
    });

    invalidateCache("judge");
    invalidateCache("dashboard");

    return NextResponse.json(judge, { status: 201 });
  } catch (error) {
    console.error("Error creating judge:", error);
    return NextResponse.json(
      { error: "Failed to create judge" },
      { status: 500 }
    );
  }
}

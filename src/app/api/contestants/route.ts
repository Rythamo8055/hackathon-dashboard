import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, invalidateCache, CACHE_TTL } from "@/lib/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, teamName, project } = body;

    if (!name || !phone || !teamName || !project) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get the next team number
    const lastContestant = await prisma.contestant.findFirst({
      orderBy: { teamNumber: "desc" },
      select: { teamNumber: true },
    });
    const nextTeamNumber = (lastContestant?.teamNumber ?? 0) + 1;

    const contestant = await prisma.contestant.create({
      data: { name, phone, teamName, project, teamNumber: nextTeamNumber },
      select: {
        id: true,
        name: true,
        teamName: true,
        teamNumber: true,
      },
    });

    // Invalidate caches
    invalidateCache("contestant");
    invalidateCache("dashboard");

    return NextResponse.json(contestant, { status: 201 });
  } catch (error) {
    console.error("Error creating contestant:", error);
    return NextResponse.json(
      { error: "Failed to register contestant" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cacheKey = "contestants-list";
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const contestants = await prisma.contestant.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        teamName: true,
        project: true,
        teamNumber: true,
        createdAt: true,
        ratings: {
          select: {
            id: true,
            score: true,
            round: true,
          },
        },
      },
      orderBy: { teamNumber: "asc" },
    });

    setCache(cacheKey, contestants, CACHE_TTL.CONTESTANTS);
    return NextResponse.json(contestants);
  } catch (error) {
    console.error("Error fetching contestants:", error);
    return NextResponse.json(
      { error: "Failed to fetch contestants" },
      { status: 500 }
    );
  }
}

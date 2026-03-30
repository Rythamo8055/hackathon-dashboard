import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contestantId, judgeId, round, score, reason } = body;

    if (!contestantId || !judgeId || !round || score === undefined || !reason) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (score < 1 || score > 10) {
      return NextResponse.json(
        { error: "Score must be between 1 and 10" },
        { status: 400 }
      );
    }

    if (round < 1 || round > 3) {
      return NextResponse.json(
        { error: "Round must be between 1 and 3" },
        { status: 400 }
      );
    }

    // Atomic upsert - single operation
    const rating = await prisma.rating.upsert({
      where: {
        contestantId_judgeId_round: { contestantId, judgeId, round },
      },
      update: { score, reason },
      create: { contestantId, judgeId, round, score, reason },
      select: {
        id: true,
        contestantId: true,
        judgeId: true,
        round: true,
        score: true,
        reason: true,
      },
    });

    // Invalidate relevant caches
    invalidateCache("rating");
    invalidateCache("dashboard");
    invalidateCache("contestant");

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const judgeId = searchParams.get("judgeId");

    const where: { judgeId?: string } = {};
    if (judgeId) where.judgeId = judgeId;

    const ratings = await prisma.rating.findMany({
      where,
      select: {
        id: true,
        contestantId: true,
        judgeId: true,
        round: true,
        score: true,
        reason: true,
      },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Upsert rating (update if exists, create if not)
    const rating = await prisma.rating.upsert({
      where: {
        contestantId_judgeId_round: {
          contestantId,
          judgeId,
          round,
        },
      },
      update: {
        score,
        reason,
      },
      create: {
        contestantId,
        judgeId,
        round,
        score,
        reason,
      },
    });

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
    const contestantId = searchParams.get("contestantId");
    const judgeId = searchParams.get("judgeId");

    const where: { contestantId?: string; judgeId?: string } = {};
    if (contestantId) where.contestantId = contestantId;
    if (judgeId) where.judgeId = judgeId;

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        contestant: true,
        judge: true,
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

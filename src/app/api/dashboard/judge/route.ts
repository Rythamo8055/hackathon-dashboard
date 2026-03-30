import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const judgeId = searchParams.get("judgeId");

    if (!judgeId) {
      return NextResponse.json({ error: "judgeId required" }, { status: 400 });
    }

    const cacheKey = `judge-dashboard-${judgeId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Single parallel query to get all needed data
    const [contestants, ratings] = await Promise.all([
      // Get contestants with minimal fields
      prisma.contestant.findMany({
        select: {
          id: true,
          name: true,
          teamName: true,
          project: true,
          teamNumber: true,
        },
        orderBy: { teamNumber: "asc" },
      }),
      // Get only this judge's ratings
      prisma.rating.findMany({
        where: { judgeId },
        select: {
          id: true,
          contestantId: true,
          round: true,
          score: true,
          reason: true,
        },
      }),
    ]);

    // Build response with ratings attached to contestants
    const ratingsByContestant = ratings.reduce(
      (acc, r) => {
        if (!acc[r.contestantId]) acc[r.contestantId] = {};
        acc[r.contestantId][r.round] = r;
        return acc;
      },
      {} as Record<string, Record<number, typeof ratings[0]>>
    );

    const result = {
      contestants: contestants.map((c) => ({
        ...c,
        myRatings: ratingsByContestant[c.id] || {},
      })),
      judgeRatings: ratings,
    };

    setCache(cacheKey, result, CACHE_TTL.DASHBOARD);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching judge dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

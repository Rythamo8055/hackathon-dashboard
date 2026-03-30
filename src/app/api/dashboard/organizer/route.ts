import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCache, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "organizer-dashboard";
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Single parallel query for all dashboard data
    const [contestants, judges, ratingCounts] = await Promise.all([
      // Contestants with rating scores only (not full rating objects)
      prisma.contestant.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          teamName: true,
          project: true,
          teamNumber: true,
          ratings: {
            select: {
              id: true,
              score: true,
              round: true,
            },
          },
        },
        orderBy: { teamNumber: "asc" },
      }),
      // Judges without password
      prisma.judge.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          _count: {
            select: { ratings: true },
          },
        },
        orderBy: { username: "asc" },
      }),
      // Total rating count
      prisma.rating.count(),
    ]);

    // Calculate stats
    const totalTeams = contestants.length;
    const ratedTeams = contestants.filter((c) => c.ratings.length > 0).length;

    const result = {
      contestants,
      judges: judges.map((j) => ({
        ...j,
        ratingsCount: j._count.ratings,
      })),
      stats: {
        totalTeams,
        totalRatings: ratingCounts,
        ratedTeams,
        totalJudges: judges.length,
      },
    };

    setCache(cacheKey, result, CACHE_TTL.DASHBOARD);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching organizer dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

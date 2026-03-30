import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    });
    const nextTeamNumber = (lastContestant?.teamNumber ?? 0) + 1;

    const contestant = await prisma.contestant.create({
      data: {
        name,
        phone,
        teamName,
        project,
        teamNumber: nextTeamNumber,
      },
    });

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
    const contestants = await prisma.contestant.findMany({
      include: {
        ratings: true,
      },
      orderBy: { teamNumber: "asc" },
    });

    return NextResponse.json(contestants);
  } catch (error) {
    console.error("Error fetching contestants:", error);
    return NextResponse.json(
      { error: "Failed to fetch contestants" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Create default judges
    const judges = [
      { username: "judge1", password: "judge123", name: "Judge One" },
      { username: "judge2", password: "judge123", name: "Judge Two" },
      { username: "judge3", password: "judge123", name: "Judge Three" },
    ];

    for (const judge of judges) {
      await prisma.judge.upsert({
        where: { username: judge.username },
        update: {},
        create: judge,
      });
    }

    // Create default organizer
    const organizers = [
      { username: "admin", password: "admin123", name: "Admin" },
    ];

    for (const organizer of organizers) {
      await prisma.organizer.upsert({
        where: { username: organizer.username },
        update: {},
        create: organizer,
      });
    }

    return NextResponse.json({ 
      message: "Database seeded successfully",
      judges: judges.map((j) => j.username),
      organizers: organizers.map((o) => o.username)
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}

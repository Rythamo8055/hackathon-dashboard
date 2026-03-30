import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, teamName, project } = body;

    if (!name || !phone || !teamName || !project) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data: {
        name,
        phone,
        teamName,
        project,
      },
    });

    return NextResponse.json(contestant);
  } catch (error) {
    console.error("Error updating contestant:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all ratings for this contestant first
    await prisma.rating.deleteMany({
      where: { contestantId: id },
    });

    // Delete the contestant
    await prisma.contestant.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting contestant:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}

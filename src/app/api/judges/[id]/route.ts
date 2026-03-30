import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !name) {
      return NextResponse.json(
        { error: "Username and name are required" },
        { status: 400 }
      );
    }

    // Check if username is taken by another judge
    const existing = await prisma.judge.findUnique({
      where: { username },
    });

    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    const updateData: { username: string; name: string; password?: string } = {
      username,
      name,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    const judge = await prisma.judge.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    return NextResponse.json(judge);
  } catch (error) {
    console.error("Error updating judge:", error);
    return NextResponse.json(
      { error: "Failed to update judge" },
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

    // Delete all ratings by this judge first
    await prisma.rating.deleteMany({
      where: { judgeId: id },
    });

    // Delete the judge
    await prisma.judge.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Judge deleted successfully" });
  } catch (error) {
    console.error("Error deleting judge:", error);
    return NextResponse.json(
      { error: "Failed to delete judge" },
      { status: 500 }
    );
  }
}

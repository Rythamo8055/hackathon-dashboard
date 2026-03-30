import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const organizer = await prisma.organizer.findUnique({
      where: { username },
    });

    if (!organizer || organizer.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return organizer info without password
    const { password: _, ...organizerWithoutPassword } = organizer;
    return NextResponse.json(organizerWithoutPassword);
  } catch (error) {
    console.error("Error authenticating organizer:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

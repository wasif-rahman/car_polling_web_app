import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Query database for the user email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No registered account was found with this email address" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { exists: true, message: "User account verified" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during email verification" },
      { status: 500 }
    );
  }
}

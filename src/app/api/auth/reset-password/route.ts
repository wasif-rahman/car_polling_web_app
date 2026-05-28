import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Password validation (at least 8 characters, 1 uppercase, 1 number, 1 special character)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':",./<>?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character",
        },
        { status: 400 }
      );
    }

    // Check if user exists in the DB
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in DB
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during password reset" },
      { status: 500 }
    );
  }
}

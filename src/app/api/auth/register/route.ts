import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, brand, model: carModel, year, color, plateNumber } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, role" },
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
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character" },
        { status: 400 }
      );
    }

    if (role !== "DRIVER" && role !== "PASSENGER") {
      return NextResponse.json(
        { error: "Role must be either DRIVER or PASSENGER" },
        { status: 400 }
      );
    }

    let vehicleLegacyStr = null;
    if (role === "DRIVER") {
      if (!brand || !carModel || !year || !color || !plateNumber) {
        return NextResponse.json(
          { error: "Drivers must provide all vehicle details (brand, model, year, color, plate number)" },
          { status: 400 }
        );
      }
      vehicleLegacyStr = `${brand} ${carModel} (${color}, ${plateNumber})`;
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        vehicleDetails: vehicleLegacyStr,
        rating: 5.0,
        vehicles: role === "DRIVER" ? {
          create: {
            brand,
            model: carModel,
            year: parseInt(year),
            color,
            plateNumber
          }
        } : undefined
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}

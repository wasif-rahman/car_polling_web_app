import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "DRIVER") {
      return NextResponse.json(
        { error: "Access denied. Only registered drivers have vehicles." },
        { status: 403 }
      );
    }

    const vehicles = await db.vehicle.findMany({
      where: { driverId: (session.user as any).id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    console.error("Fetch vehicles error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "DRIVER") {
      return NextResponse.json(
        { error: "Access denied. Only registered drivers can add vehicles." },
        { status: 403 }
      );
    }

    const { brand, model, year, color, plateNumber } = await req.json();

    if (!brand || !model || !year || !color || !plateNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if plate number already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { plateNumber }
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "A vehicle with this license plate number is already registered" },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        driverId: (session.user as any).id,
        brand,
        model,
        year: parseInt(year),
        color,
        plateNumber
      }
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while registering the vehicle" },
      { status: 500 }
    );
  }
}

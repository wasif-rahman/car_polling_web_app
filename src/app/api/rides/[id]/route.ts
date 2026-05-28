import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rideId = id;

    if (!rideId) {
      return NextResponse.json({ error: "Missing ride ID" }, { status: 400 });
    }

    const ride = await db.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
            vehicleDetails: true
          }
        },
        vehicle: true
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride offer not found" }, { status: 404 });
    }

    return NextResponse.json(ride);
  } catch (error: any) {
    console.error("Fetch single ride error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching ride details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rideId = id;
    const { status } = await req.json(); // "ACTIVE", "COMPLETED", "CANCELLED"

    if (!status || !["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Fetch ride details to check ownership
    const ride = await db.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride offer not found" }, { status: 404 });
    }

    if (ride.driverId !== userId) {
      return NextResponse.json({ error: "Forbidden. You are not the driver of this ride." }, { status: 403 });
    }

    // Process status update
    const updatedRide = await db.ride.update({
      where: { id: rideId },
      data: { status }
    });

    return NextResponse.json({
      message: `Ride status successfully updated to ${status}`,
      ride: updatedRide
    });
  } catch (error: any) {
    console.error("Ride PATCH error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the ride" },
      { status: 500 }
    );
  }
}


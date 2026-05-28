import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rideId, seatsBooked } = await req.json();

    if (!rideId || !seatsBooked) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passengerId = (session.user as any).id;

    // Fetch ride details
    const ride = await db.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.driverId === passengerId) {
      return NextResponse.json(
        { error: "You cannot book your own offered ride" },
        { status: 400 }
      );
    }

    if (ride.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "This ride is no longer accepting bookings" },
        { status: 400 }
      );
    }

    if (ride.availableSeats < seatsBooked) {
      return NextResponse.json(
        { error: "Not enough available seats left on this ride" },
        { status: 400 }
      );
    }

    // Check if already booked
    const existingBooking = await db.booking.findFirst({
      where: {
        rideId,
        passengerId,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already requested or confirmed a booking for this ride" },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        rideId,
        passengerId,
        seatsBooked: parseInt(seatsBooked),
        status: "PENDING"
      }
    });

    return NextResponse.json(
      { message: "Booking request submitted successfully", booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while booking" },
      { status: 500 }
    );
  }
}

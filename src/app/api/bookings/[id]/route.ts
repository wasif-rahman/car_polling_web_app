import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    const bookingId = id;
    const { status } = await req.json(); // "APPROVED", "REJECTED", "CANCELLED"

    if (!status || !["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Fetch booking and corresponding ride details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isDriver = booking.ride.driverId === userId;
    const isPassenger = booking.passengerId === userId;

    if (!isDriver && !isPassenger) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Restrictions on status updates
    if (status === "APPROVED" || status === "REJECTED") {
      if (!isDriver) {
        return NextResponse.json(
          { error: "Only drivers can approve or reject booking requests" },
          { status: 403 }
        );
      }
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          { error: `Cannot update booking that is already ${booking.status}` },
          { status: 400 }
        );
      }
    }

    if (status === "CANCELLED" && !isPassenger) {
      return NextResponse.json(
        { error: "Only the booking passenger can cancel their request" },
        { status: 403 }
      );
    }

    // Update Transaction
    let updatedBooking;

    if (status === "APPROVED") {
      // Deduct seats
      if (booking.ride.availableSeats < booking.seatsBooked) {
        return NextResponse.json(
          { error: "Not enough remaining seats available on the ride" },
          { status: 400 }
        );
      }

      const result = await db.$transaction([
        db.booking.update({
          where: { id: bookingId },
          data: { status }
        }),
        db.ride.update({
          where: { id: booking.rideId },
          data: {
            availableSeats: {
              decrement: booking.seatsBooked
            }
          }
        })
      ]);
      updatedBooking = result[0];
    } else {
      updatedBooking = await db.booking.update({
        where: { id: bookingId },
        data: { status }
      });
    }

    return NextResponse.json({
      message: `Booking successfully updated to ${status}`,
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error("Booking patch error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the booking" },
      { status: 500 }
    );
  }
}

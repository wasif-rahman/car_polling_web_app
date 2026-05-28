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

    const { rideId, rating, comment } = await req.json();

    if (!rideId || rating === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: rideId and rating are required." },
        { status: 400 }
      );
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    const passengerId = (session.user as any).id;

    // 1. Fetch ride details to verify it exists and get driver ID
    const ride = await db.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride offer not found." }, { status: 404 });
    }

    if (ride.driverId === passengerId) {
      return NextResponse.json(
        { error: "You cannot review yourself as a driver." },
        { status: 400 }
      );
    }

    // 2. Verify passenger has an APPROVED booking for this ride
    const booking = await db.booking.findFirst({
      where: {
        rideId,
        passengerId,
        status: "APPROVED"
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "You can only review rides that you booked and were approved for." },
        { status: 403 }
      );
    }

    // 3. Verify ride is completed or active
    // Allowing review once COMPLETED is typical, let's enforce COMPLETED status for a strict policy,
    // or let it be if it's COMPLETED. Let's require it to be COMPLETED or ACTIVE. Let's enforce COMPLETED.
    if (ride.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only review a ride that has been marked as COMPLETED by the driver." },
        { status: 400 }
      );
    }

    // 4. Verify user has not already reviewed this ride
    const existingReview = await db.review.findFirst({
      where: {
        rideId,
        passengerId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this ride." },
        { status: 400 }
      );
    }

    // 5. Create review and recalculate driver average rating inside a transaction
    const review = await db.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          rideId,
          passengerId,
          driverId: ride.driverId,
          rating: parsedRating,
          comment: comment || null
        }
      });

      // Calculate all reviews of the driver
      const allReviews = await tx.review.findMany({
        where: { driverId: ride.driverId },
        select: { rating: true }
      });

      const totalRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRatingSum / allReviews.length : 5.0;

      // Round to 1 decimal place or 2
      const roundedRating = Math.round(averageRating * 10) / 10;

      // Update user rating
      await tx.user.update({
        where: { id: ride.driverId },
        data: { rating: roundedRating }
      });

      return newReview;
    });

    return NextResponse.json(
      { message: "Review submitted successfully!", review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while submitting your review." },
      { status: 500 }
    );
  }
}

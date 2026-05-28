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

    const userId = (session.user as any).id;

    const bookings = await db.booking.findMany({
      where: { passengerId: userId },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                rating: true,
                vehicleDetails: true
              }
            },
            vehicle: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Passenger dashboard fetch error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching dashboard statistics" },
      { status: 500 }
    );
  }
}

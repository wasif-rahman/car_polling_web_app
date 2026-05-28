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
    const userRole = (session.user as any).role;

    if (userRole !== "DRIVER") {
      return NextResponse.json({ error: "Forbidden. Drivers only." }, { status: 403 });
    }

    const rides = await db.ride.findMany({
      where: { driverId: userId },
      include: {
        bookings: {
          include: {
            passenger: {
              select: {
                id: true,
                name: true,
                email: true,
                rating: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        departureTime: "desc"
      }
    });

    return NextResponse.json({ rides });
  } catch (error: any) {
    console.error("Driver dashboard fetch error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching dashboard statistics" },
      { status: 500 }
    );
  }
}

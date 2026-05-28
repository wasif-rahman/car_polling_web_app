import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ rideId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rideId } = await params;

    // Fetch messages
    const messages = await db.message.findMany({
      where: { rideId },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ rideId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rideId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const senderId = (session.user as any).id;

    // Verify user is member of this ride pool (either driver or approved passenger)
    const ride = await db.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: {
          where: {
            passengerId: senderId,
            status: "APPROVED"
          }
        }
      }
    });

    if (!ride) {
      return NextResponse.json({ error: "Ride pool not found" }, { status: 404 });
    }

    const isDriver = ride.driverId === senderId;
    const isApprovedPassenger = ride.bookings.length > 0;

    if (!isDriver && !isApprovedPassenger) {
      return NextResponse.json(
        { error: "Forbidden. You are not an approved member of this ride pool." },
        { status: 403 }
      );
    }

    // Save message in DB
    const message = await db.message.create({
      data: {
        rideId,
        senderId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Trigger Pusher real-time event
    try {
      await pusherServer.trigger(`chat-${rideId}`, "new-message", message);
    } catch (pushErr) {
      console.error("Pusher trigger failed:", pushErr);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

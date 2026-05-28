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

    const userRole = (session.user as any).role;
    if (userRole !== "DRIVER") {
      return NextResponse.json(
        { error: "Access denied. Only registered drivers can publish rides." },
        { status: 403 }
      );
    }
 
    const {
      startLocation,
      startLat,
      startLng,
      endLocation,
      endLat,
      endLng,
      departureTime,
      availableSeats,
      pricePerSeat,
      vehicleId
    } = await req.json();
 
    if (
      !startLocation ||
      startLat === undefined ||
      startLng === undefined ||
      !endLocation ||
      endLat === undefined ||
      endLng === undefined ||
      !departureTime ||
      !availableSeats ||
      pricePerSeat === undefined ||
      !vehicleId
    ) {
      return NextResponse.json(
        { error: "Missing required fields: please provide all coordinates, price, seats, and select a vehicle." },
        { status: 400 }
      );
    }
 
    // Robust date parser to handle timezone and locale variations safely
    let parsedDate = new Date(departureTime);
    if (isNaN(parsedDate.getTime())) {
      // Fallback parser for standard HTML5 datetime-local format YYYY-MM-DDTHH:mm
      const match = String(departureTime).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
      if (match) {
        const [_, year, month, day, hours, minutes] = match;
        parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes)
        );
      }
    }
 
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid departure time format. Please select a valid date and time." },
        { status: 400 }
      );
    }
 
    // Ensure departure time is in the future
    if (parsedDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Departure time must be in the future. Please select a future time." },
        { status: 400 }
      );
    }
 
    const ride = await db.ride.create({
      data: {
        driverId: (session.user as any).id,
        vehicleId,
        startLocation,
        startLat: parseFloat(startLat),
        startLng: parseFloat(startLng),
        endLocation,
        endLat: parseFloat(endLat),
        endLng: parseFloat(endLng),
        departureTime: parsedDate,
        availableSeats: parseInt(availableSeats),
        pricePerSeat: parseFloat(pricePerSeat),
        status: "UPCOMING"
      }
    });
 
    return NextResponse.json(
      { message: "Ride published successfully", ride },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Ride creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during ride creation" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromLat = searchParams.get("fromLat");
    const fromLng = searchParams.get("fromLng");
    const toLat = searchParams.get("toLat");
    const toLng = searchParams.get("toLng");
    const date = searchParams.get("date");

    // Standard base query
    const whereClause: any = {
      status: "UPCOMING",
      availableSeats: { gt: 0 }
    };

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      whereClause.departureTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const rides = await db.ride.findMany({
      where: whereClause,
      include: {
        driver: {
          select: {
            name: true,
            email: true,
            rating: true,
            vehicleDetails: true
          }
        },
        vehicle: true
      },
      orderBy: {
        departureTime: "asc"
      }
    });

    // Let's filter by coordinate distance if requested
    // Leaflet OpenStreetMap searches will calculate a bounding area box.
    // If fromLat/fromLng and toLat/toLng coordinates are provided, let's filter nearby.
    let filteredRides = rides;
    const offset = 0.5; // Roughly ~50km bounding radius for academic convenience

    if (fromLat && fromLng) {
      const flat = parseFloat(fromLat);
      const flng = parseFloat(fromLng);
      filteredRides = filteredRides.filter((ride) => {
        const latDiff = Math.abs(ride.startLat - flat);
        const lngDiff = Math.abs(ride.startLng - flng);
        return latDiff <= offset && lngDiff <= offset;
      });
    }

    if (toLat && toLng) {
      const tlat = parseFloat(toLat);
      const tlng = parseFloat(toLng);
      filteredRides = filteredRides.filter((ride) => {
        const latDiff = Math.abs(ride.endLat - tlat);
        const lngDiff = Math.abs(ride.endLng - tlng);
        return latDiff <= offset && lngDiff <= offset;
      });
    }

    return NextResponse.json(filteredRides);
  } catch (error: any) {
    console.error("Fetch rides error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching rides" },
      { status: 500 }
    );
  }
}

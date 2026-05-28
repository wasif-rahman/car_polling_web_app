"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Car, MapPin, Calendar, Users, Clock, Navigation, Star, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

// Dynamic Map import for SSR safety
const LeafletMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full flex items-center justify-center font-medium shimmer"
      style={{ background: "rgba(30,41,59,0.5)", color: "#475569", borderRadius: "16px" }}
    >
      Loading interactive route...
    </div>
  ),
});

export default function RideDetailPage() {
  const { id: rideId } = useParams();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/rides/${rideId}`);
      if (!res.ok) throw new Error("Could not find this ride pool offer");
      const data = await res.json();
      setRide(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) fetchRideDetails();
  }, [rideId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authStatus === "unauthenticated") { router.push("/login"); return; }

    setErrorMsg("");
    setBookingLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, seatsBooked: seatsToBook }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit booking request");

      setBookingSuccess(true);
      setTimeout(() => { router.push("/dashboard"); }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-12 w-12 rounded-full border-2"
              style={{ borderTopColor: "#22C55E", borderRightColor: "#06B6D4", borderColor: "transparent", animation: "spin 1s linear infinite" }}
            />
            <p className="text-sm font-semibold" style={{ color: "#64748B" }}>Loading ride specifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg && !ride) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md text-center flex flex-col items-center gap-5 p-10 animate-scaleIn"
            style={{ background: "rgba(30,41,59,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}
          >
            <div className="p-4 rounded-2xl" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
              <ShieldAlert className="h-8 w-8" style={{ color: "#FB7185" }} />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
              Ride Offer Not Found
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{errorMsg}</p>
            <button
              onClick={() => router.push("/rides/search")}
              className="mt-2 w-full py-3 font-bold rounded-xl cursor-pointer transition-all"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Back to Searches
            </button>
          </div>
        </main>
      </div>
    );
  }

  const mapRides = ride ? [ride] : [];
  const mapCenter: [number, number] = ride ? [ride.startLat, ride.startLng] : [37.7749, -122.4194];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">

        {/* Left: Ride Details & Booking */}
        <div className="w-full lg:w-3/5 flex flex-col gap-5">
          <div
            className="animate-slideUp"
            style={{
              background: "rgba(30,41,59,0.65)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-widest mb-3"
                  style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#22D3EE" }}
                >
                  Upcoming Trip
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
                  Route Details
                </h1>
              </div>
              <div className="text-right">
                <span
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: "linear-gradient(135deg, #22C55E, #4ADE80)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Rs. {ride.pricePerSeat}
                </span>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#475569" }}>/seat</div>
              </div>
            </div>

            {/* Route */}
            <div
              className="flex flex-col gap-5 py-5 mb-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5" style={{ color: "#475569" }}>Departure Point</span>
                  <span className="font-bold leading-tight block" style={{ color: "#F8FAFC" }}>{ride.startLocation}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#06B6D4" }} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5" style={{ color: "#475569" }}>Destination Point</span>
                  <span className="font-bold leading-tight block" style={{ color: "#F8FAFC" }}>{ride.endLocation}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-2 gap-4 p-4 rounded-xl mb-6"
              style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 shrink-0" style={{ color: "#3B82F6" }} />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: "#475569" }}>Departure</span>
                  <span className="text-xs font-bold block mt-0.5" style={{ color: "#CBD5E1" }}>
                    {new Date(ride.departureTime).toLocaleDateString()} at{" "}
                    {new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "16px" }}>
                <Users className="h-5 w-5 shrink-0" style={{ color: "#22C55E" }} />
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: "#475569" }}>Availability</span>
                  <span className="text-xs font-bold block mt-0.5" style={{ color: "#CBD5E1" }}>
                    {ride.availableSeats} seats left
                  </span>
                </div>
              </div>
            </div>

            {/* Driver */}
            <div
              className="flex items-center justify-between p-4 rounded-xl mb-6"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 flex items-center justify-center font-black rounded-xl shrink-0"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ADE80", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "18px" }}
                >
                  {ride.driver.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "#F8FAFC" }}>Offered by {ride.driver.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs" style={{ color: "#F59E0B" }}>
                      <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                      {ride.driver.rating.toFixed(1)} Rating
                    </span>
                    <span className="text-xs" style={{ color: "#475569" }}>• {ride.vehicle ? `${ride.vehicle.color} ${ride.vehicle.brand} ${ride.vehicle.model} (${ride.vehicle.plateNumber})` : (ride.driver.vehicleDetails || "Verified Driver")}</span>
                  </div>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
              >
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>

            {/* Booking */}
            {bookingSuccess ? (
              <div
                className="flex flex-col items-center gap-3 text-center p-6 rounded-xl animate-scaleIn"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle2 className="h-10 w-10" style={{ color: "#4ADE80" }} strokeWidth={2} />
                <div>
                  <p className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
                    Booking Request Sent!
                  </p>
                  <p className="text-xs mt-1 max-w-xs leading-normal" style={{ color: "#64748B" }}>
                    Request submitted to driver. Redirecting to your travel dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="flex flex-col gap-4">
                {ride.availableSeats > 0 ? (
                  <div
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      Book multiple seats?
                    </span>
                    <select
                      value={seatsToBook}
                      onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                      className="px-3 py-1.5 text-sm font-bold rounded-lg cursor-pointer outline-none"
                      style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "#F8FAFC", colorScheme: "dark" }}
                    >
                      {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map((s) => (
                        <option key={s} value={s} style={{ background: "#1E293B" }}>
                          {s} {s === 1 ? "seat" : "seats"}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-xl text-center text-xs font-semibold"
                    style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#FB7185" }}
                  >
                    This ride is currently fully booked.
                  </div>
                )}

                {ride.availableSeats > 0 && (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-sm rounded-xl transition-all cursor-pointer mt-1"
                    style={{
                      background: bookingLoading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                      color: "#fff",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: bookingLoading ? "none" : "0 6px 20px rgba(34,197,94,0.4)",
                      opacity: bookingLoading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => { if (!bookingLoading) { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(34,197,94,0.55)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    {bookingLoading ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 1s linear infinite" }} />
                        Requesting Seats...
                      </>
                    ) : (
                      <>
                        <span>Submit Booking Request</span>
                        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                )}
              </form>
            )}

            {errorMsg && !bookingSuccess && (
              <div
                className="flex items-center gap-2.5 p-4 rounded-xl text-sm mt-4 animate-fadeIn"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FB7185" }}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div
          className="w-full lg:w-2/5 h-[400px] lg:h-[600px] sticky top-24 rounded-2xl overflow-hidden animate-fadeIn"
          style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}
        >
          <LeafletMap rides={mapRides} center={mapCenter} zoom={12} />
        </div>
      </main>
    </div>
  );
}

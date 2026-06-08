"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Navigation,
  Star,
  MessageSquare,
  PlusCircle,
  Search,
  UserRound,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { t } from "@/lib/i18n";

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  rating?: number;
  vehicleDetails?: string | null;
}

interface Vehicle {
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
}

interface Passenger {
  id: string;
  name: string;
  email: string;
  rating: number;
}

interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  passenger: Passenger;
  seatsBooked: number;
  status: string;
  createdAt: string;
  ride: Ride;
}

interface Ride {
  id: string;
  driverId: string;
  driver: Driver;
  origin: string;
  destination: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;
  status: string;
  bookings: Booking[];
  vehicle?: Vehicle | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Feedback / Review Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRideId, setReviewRideId] = useState("");
  const [reviewDriverName, setReviewDriverName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [completedReviewsList, setCompletedReviewsList] = useState<string[]>([]); // Array of rideIds already reviewed

  // Guard routing
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const role = (session?.user as CustomUser)?.role;

      if (role === "DRIVER") {
        const res = await fetch("/api/driver/dashboard");
        if (res.ok) {
          const data = await res.json();
          setRides(data.rides || []);
        } else {
          throw new Error("Failed to load driver dashboard");
        }
      } else {
        const res = await fetch("/api/passenger/dashboard");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else {
          throw new Error("Failed to load passenger dashboard");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      const init = async () => {
        await Promise.resolve();
        fetchData();
      };
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const handleBookingAction = async (
    bookingId: string,
    action: "APPROVED" | "REJECTED" | "CANCELLED"
  ) => {
    setActionLoading(bookingId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }

      setSuccessMsg(`Booking successfully ${action.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setErrorMsg(message);
    } finally {
      setActionLoading(null);
      setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
    }
  };

  const handleUpdateRideStatus = async (rideId: string, nextStatus: "ACTIVE" | "COMPLETED" | "CANCELLED") => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update ride status");
      
      setSuccessMsg(`Ride successfully marked as ${nextStatus.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setErrorMsg(message);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewLoading(true);
    setReviewSuccess(false);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId: reviewRideId,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewSuccess(true);
      setCompletedReviewsList(prev => [...prev, reviewRideId]);
      
      setTimeout(() => {
        setShowReviewModal(false);
        fetchData();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setReviewError(message);
    } finally {
      setReviewLoading(false);
    }
  };

  // Loading State
  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-12 w-12 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "#22C55E",
                borderRightColor: "#06B6D4",
                animation: "spin 1s linear infinite",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
              }}
            />
            <p className="text-sm font-semibold" style={{ color: "#64748B" }}>
              {t("Loading dashboard...")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const role = (session?.user as CustomUser)?.role;

  const StatusBadge = ({ status }: { status: string }) => {
    let badgeStyle: React.CSSProperties;
    switch (status) {
      case "PENDING":
        badgeStyle = { background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" };
        break;
      case "APPROVED":
        badgeStyle = { background: "rgba(34,197,94,0.12)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.25)" };
        break;
      case "REJECTED":
      case "CANCELLED":
        badgeStyle = { background: "rgba(244,63,94,0.12)", color: "#FB7185", border: "1px solid rgba(244,63,94,0.25)" };
        break;
      case "UPCOMING":
        badgeStyle = { background: "rgba(6,182,212,0.12)", color: "#22D3EE", border: "1px solid rgba(6,182,212,0.25)" };
        break;
      case "COMPLETED":
        badgeStyle = { background: "rgba(100,116,139,0.12)", color: "#94A3B8", border: "1px solid rgba(100,116,139,0.25)" };
        break;
      default:
        badgeStyle = { background: "rgba(6,182,212,0.12)", color: "#22D3EE", border: "1px solid rgba(6,182,212,0.25)" };
    }
    return (
      <span
        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg"
        style={badgeStyle}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* Welcome Banner */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slideUp relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(6,182,212,0.08) 50%, rgba(59,130,246,0.06) 100%)",
            border: "1px solid rgba(34,197,94,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(34,197,94,0.05)",
          }}
        >
          {/* Background shimmer */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)",
              backgroundSize: "200% auto",
              animation: "shimmer 4s linear infinite",
            }}
          />

          <div className="relative">
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
            {t("Welcome back, ")}{session?.user?.name}!
            </h1>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              {t("Manage your rides, view seat requests, and coordinate travels from your dashboard.")}
            </p>
          </div>

          <span
            className="px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-widest relative shrink-0 flex items-center gap-1.5"
            style={
              role === "DRIVER"
                ? { background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.3)" }
                : { background: "rgba(59,130,246,0.15)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)" }
            }
          >
            {role === "DRIVER" ? (
              <Car className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <UserRound className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {role}
          </span>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div
            className="flex items-center gap-2.5 p-4 rounded-xl mb-6 text-sm animate-fadeIn"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            className="flex items-center gap-2.5 p-4 rounded-xl mb-6 text-sm animate-fadeIn"
            style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FB7185" }}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── DRIVER VIEW ── */}
        {role === "DRIVER" && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2
                  className="text-lg font-black uppercase tracking-wider"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
                >
                  {t("My Offered Rides")}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  {rides.length} {rides.length === 1 ? "ride" : "rides"} posted
                </p>
              </div>
              <Link
                href="/rides/create"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.5)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(34,197,94,0.35)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <PlusCircle className="h-4 w-4" strokeWidth={2.5} />
                Offer Another Seat
              </Link>
            </div>

            {rides.length === 0 ? (
              <div
                className="rounded-2xl p-14 text-center flex flex-col items-center gap-5"
                style={{
                  background: "rgba(30,41,59,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="p-5 rounded-2xl animate-float"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
                >
                  <Car className="h-10 w-10" style={{ color: "#22C55E" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
                  >
                    {t("No rides posted yet")}
                  </h3>
                  <p className="text-xs mt-1.5 max-w-sm leading-relaxed" style={{ color: "#475569" }}>
                    {t("Earn money, split fuel expenses, and lower your carbon footprint by publishing your upcoming trips.")}
                  </p>
                </div>
                <Link
                  href="/rides/create"
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #22C55E, #16A34A)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                    textDecoration: "none",
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create First Ride Offer
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {rides.map((ride: Ride, idx: number) => (
                  <div
                    key={ride.id}
                    className="rounded-2xl overflow-hidden animate-slideUp transition-all duration-300"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      animationDelay: `${idx * 80}ms`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.2)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Ride Header */}
                    <div
                      className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.3)" }}
                    >
                      <div className="flex items-center gap-2" style={{ color: "#94A3B8" }}>
                        <Calendar className="h-4 w-4" style={{ color: "#22C55E" }} />
                        <span className="text-sm font-semibold">
                          {new Date(ride.departureTime).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                          <Users className="h-3.5 w-3.5" />
                          {ride.availableSeats} seats available
                        </span>
                        <span className="text-sm font-bold" style={{ color: "#22C55E" }}>
                          {t("Rs. ")}{ride.pricePerSeat}{t("/seat")}
                        </span>
                        {ride.status === "UPCOMING" && (
                          <button
                            onClick={() => handleUpdateRideStatus(ride.id, "ACTIVE")}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all cursor-pointer"
                          >
                            {t("Start Ride")}
                          </button>
                        )}
                        {ride.status === "ACTIVE" && (
                          <button
                            onClick={() => handleUpdateRideStatus(ride.id, "COMPLETED")}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all cursor-pointer"
                          >
                            {t("Complete Ride")}
                          </button>
                        )}
                        <StatusBadge status={ride.status} />
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
                          {t("Pickup From")}
                        </span>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#22C55E" }} />
                          <span className="text-sm font-semibold leading-tight" style={{ color: "#F8FAFC" }}>
                            {ride.startLocation}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
                          {t("Destination To")}
                        </span>
                        <div className="flex items-start gap-2">
                          <Navigation className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#06B6D4" }} />
                          <span className="text-sm font-semibold leading-tight" style={{ color: "#F8FAFC" }}>
                            {ride.endLocation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Requests */}
                    <div className="px-6 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest block mb-4" style={{ color: "#475569" }}>
                        {t("Passenger Seat Requests (")}{ride.bookings.length}{t(")")}
                      </span>

                      {ride.bookings.length === 0 ? (
                        <p className="text-xs italic" style={{ color: "#334155" }}>
                          {t("No requests yet for this ride.")}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {ride.bookings.map((booking: Booking) => (
                            <div
                              key={booking.id}
                              className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-xl"
                              style={{
                                background: "rgba(15,23,42,0.4)",
                                border: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-10 w-10 flex items-center justify-center font-black rounded-xl shrink-0 text-sm"
                                  style={{
                                    background: "rgba(34,197,94,0.12)",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                    color: "#4ADE80",
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  }}
                                >
                                  {booking.passenger.name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                                    {booking.passenger.name}
                                  </p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="flex items-center gap-1 text-xs" style={{ color: "#F59E0B" }}>
                                      <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                                      {booking.passenger.rating.toFixed(1)}
                                    </span>
                                    <span className="text-xs" style={{ color: "#475569" }}>
                                      {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""} requested
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {booking.status === "PENDING" ? (
                                  <>
                                    <button
                                      onClick={() => handleBookingAction(booking.id, "APPROVED")}
                                      disabled={actionLoading !== null}
                                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                                      style={{
                                        background: "rgba(34,197,94,0.15)",
                                        border: "1px solid rgba(34,197,94,0.3)",
                                        color: "#4ADE80",
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.25)"; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.15)"; }}
                                    >
                                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleBookingAction(booking.id, "REJECTED")}
                                      disabled={actionLoading !== null}
                                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                                      style={{
                                        background: "rgba(244,63,94,0.1)",
                                        border: "1px solid rgba(244,63,94,0.2)",
                                        color: "#FB7185",
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.18)"; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.1)"; }}
                                    >
                                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2.5">
                                    <StatusBadge status={booking.status} />
                                    {booking.status === "APPROVED" && (
                                      <Link
                                        href={`/chat/${booking.rideId}`}
                                        className="p-2 rounded-lg transition-all"
                                        style={{
                                          background: "rgba(34,197,94,0.1)",
                                          border: "1px solid rgba(34,197,94,0.2)",
                                          color: "#22C55E",
                                        }}
                                        title="Open Chat"
                                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.2)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.1)"; }}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PASSENGER VIEW ── */}
        {role === "PASSENGER" && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2
                  className="text-lg font-black uppercase tracking-wider"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
                >
                  {t("My Booked Travels")}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} found
                </p>
              </div>
              <Link
                href="/rides/search"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(59,130,246,0.5)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(59,130,246,0.35)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
                Find a New Ride
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div
                className="rounded-2xl p-14 text-center flex flex-col items-center gap-5"
                style={{
                  background: "rgba(30,41,59,0.5)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="p-5 rounded-2xl animate-float"
                  style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <Navigation className="h-10 w-10" style={{ color: "#3B82F6" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="text-base font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
                  >
                    {t("No bookings yet")}
                  </h3>
                  <p className="text-xs mt-1.5 max-w-sm leading-relaxed" style={{ color: "#475569" }}>
                    {t("Search active driver pools, view pricing details, and request empty seats instantly for your upcoming trips.")}
                  </p>
                </div>
                <Link
                  href="/rides/search"
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                    textDecoration: "none",
                  }}
                >
                  <Search className="h-4 w-4" />
                  Search Available Rides
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking: Booking, idx: number) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl overflow-hidden animate-slideUp transition-all duration-300"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      animationDelay: `${idx * 80}ms`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.2)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Header: Driver info */}
                    <div
                      className="px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(15,23,42,0.3)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 flex items-center justify-center font-black text-sm rounded-xl shrink-0"
                          style={{
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.2)",
                            color: "#93C5FD",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {booking.ride.driver.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                            {t("Driver: ")}{booking.ride.driver.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-xs" style={{ color: "#F59E0B" }}>
                              <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                              {(booking.ride.driver.rating ?? 5.0).toFixed(1)}
                            </span>
                            <span className="text-xs" style={{ color: "#475569" }}>
                              • {booking.ride.vehicle ? `${booking.ride.vehicle.color} ${booking.ride.vehicle.brand} ${booking.ride.vehicle.model}` : (booking.ride.driver.vehicleDetails || "Verified Vehicle")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold" style={{ color: "#4ADE80" }}>
                          {t("Rs. ")}{booking.seatsBooked * booking.ride.pricePerSeat}{t(" Total")}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
                          {t("Start Location")}
                        </span>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#22C55E" }} />
                          <span className="text-sm font-semibold leading-tight" style={{ color: "#F8FAFC" }}>
                            {booking.ride.startLocation}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
                          {t("Destination")}
                        </span>
                        <div className="flex items-start gap-2">
                          <Navigation className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#06B6D4" }} />
                          <span className="text-sm font-semibold leading-tight" style={{ color: "#F8FAFC" }}>
                            {booking.ride.endLocation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div
                      className="px-6 py-4 flex justify-between items-center"
                      style={{ background: "rgba(15,23,42,0.2)" }}
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#64748B" }}>
                        <Calendar className="h-4 w-4" style={{ color: "#3B82F6" }} />
                        <span>
                          {t("Departure: ")}{" "}
                          {new Date(booking.ride.departureTime).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {booking.status === "PENDING" && (
                          <button
                            onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                            disabled={actionLoading !== null}
                            className="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            style={{
                              background: "rgba(244,63,94,0.1)",
                              border: "1px solid rgba(244,63,94,0.2)",
                              color: "#FB7185",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.18)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.1)"; }}
                          >
                            {t("Cancel Request")}
                          </button>
                        )}
                        {booking.status === "APPROVED" && (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/chat/${booking.rideId}`}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              style={{
                                background: "rgba(34,197,94,0.1)",
                                border: "1px solid rgba(34,197,94,0.2)",
                                color: "#22C55E",
                                textDecoration: "none",
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.2)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.1)"; }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Chat
                            </Link>

                            {booking.ride.status === "COMPLETED" && (
                              <button
                                onClick={() => {
                                  setReviewRideId(booking.rideId);
                                  setReviewDriverName(booking.ride.driver.name);
                                  setReviewRating(5);
                                  setReviewComment("");
                                  setReviewError("");
                                  setReviewSuccess(false);
                                  setShowReviewModal(true);
                                }}
                                disabled={completedReviewsList.includes(booking.rideId)}
                                className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                                style={
                                  completedReviewsList.includes(booking.rideId)
                                    ? {
                                        background: "rgba(100,116,139,0.12)",
                                        border: "1px solid rgba(100,116,139,0.25)",
                                        color: "#64748B",
                                        cursor: "default"
                                      }
                                    : {
                                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                        color: "#fff",
                                        boxShadow: "0 3px 10px rgba(245,158,11,0.3)",
                                      }
                                }
                              >
                                <Star className="h-3 w-3 fill-current" />
                                {completedReviewsList.includes(booking.rideId) ? "Rated" : "Rate Driver"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Premium Glassmorphic Feedback Modal */}
      {showReviewModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div 
            className="w-full max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-scaleIn"
            style={{
              background: "rgba(30,41,59,0.9)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
            }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">{t("Rate Your Journey")}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{t("Share feedback for Driver ")}{reviewDriverName}</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 flex flex-col gap-4">
              {reviewError && (
                <div className="p-3 text-xs rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-400">
                  {reviewError}
                </div>
              )}

              {reviewSuccess ? (
                <div className="py-6 flex flex-col items-center gap-3 text-center animate-scaleIn">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="h-6 w-6 text-emerald-400" strokeWidth={3} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{t("Feedback Submitted!")}</h4>
                  <p className="text-xs text-slate-400">{t("Thank you for rating your ride. Updating dashboard...")}</p>
                </div>
              ) : (
                <>
                  {/* Rating Stars Selector */}
                  <div className="flex flex-col items-center gap-2 my-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("Select Rating")}</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 rounded transition-all transform hover:scale-110 cursor-pointer"
                          style={{ background: "none", border: "none" }}
                        >
                          <Star 
                            className={`h-8 w-8 ${reviewRating >= star ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" : "text-slate-600"}`} 
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold mt-1 text-amber-400">
                      {reviewRating === 5 ? "Excellent! (5/5)" :
                       reviewRating === 4 ? "Very Good (4/5)" :
                       reviewRating === 3 ? "Good Journey (3/5)" :
                       reviewRating === 2 ? "Could Be Better (2/5)" : "Poor Commute (1/5)"}
                    </span>
                  </div>

                  {/* Comment input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t("Write a Comment (Optional)")}
                    </label>
                    <textarea
                      placeholder="Tell us about the driver's driving, vehicle cleanliness, or pleasant conversation..."
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-white/5 text-slate-100 placeholder-slate-500 outline-none resize-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-3 font-bold text-xs rounded-xl transition-all cursor-pointer mt-2"
                    style={{
                      background: "linear-gradient(135deg, #F59E0B, #D97706)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(245,158,11,0.35)"
                    }}
                  >
                    {reviewLoading ? "Submitting Review..." : "Submit Rating"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

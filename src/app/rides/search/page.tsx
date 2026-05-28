"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Calendar, Users, Clock, ArrowRight, Star, Car } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { loadGoogleMapsScript } from "@/components/Map";

// Dynamic map import to prevent Next.js SSR document-not-defined reference crashes
const LeafletMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full flex items-center justify-center font-medium shimmer"
      style={{ background: "rgba(30,41,59,0.5)", color: "#475569", borderRadius: "16px" }}
    >
      Loading interactive map...
    </div>
  ),
});

export default function SearchRidesPage() {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dateQuery, setDateQuery] = useState("");
  const [rides, setRides] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.5204, 74.3587]); // Default to Lahore
  const [mapZoom, setMapZoom] = useState(8);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Inject and setup Google Places Autocomplete on our input inputs
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA0fY4F3W06R6BuUd_GKNlgZFQ497Luk20";
    loadGoogleMapsScript(apiKey)
      .then((google) => {
        const startInput = document.getElementById("start-location-input") as HTMLInputElement;
        if (startInput) {
          const autocomplete = new google.maps.places.Autocomplete(startInput, {
            fields: ["geometry", "formatted_address", "name"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setStartCoords({ lat, lng });
              setStartQuery(place.formatted_address || place.name || "");
            }
          });
        }

        const endInput = document.getElementById("end-location-input") as HTMLInputElement;
        if (endInput) {
          const autocomplete = new google.maps.places.Autocomplete(endInput, {
            fields: ["geometry", "formatted_address", "name"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setEndCoords({ lat, lng });
              setEndQuery(place.formatted_address || place.name || "");
            }
          });
        }
      })
      .catch((err) => console.error("Places Autocomplete loading error:", err));
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let queryStr = "/api/rides?";
      const params: string[] = [];

      if (startQuery.trim()) {
        if (startCoords) {
          params.push(`fromLat=${startCoords.lat}`);
          params.push(`fromLng=${startCoords.lng}`);
          setMapCenter([startCoords.lat, startCoords.lng]);
          setMapZoom(11);
        } else {
          const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}&limit=1`;
          const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "ShareMyRide-Search" } });
          const geoData = await geoRes.json();

          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            params.push(`fromLat=${lat}`);
            params.push(`fromLng=${lng}`);
            setMapCenter([lat, lng]);
            setMapZoom(11);
          } else {
            throw new Error("Could not locate your starting address coordinates.");
          }
        }
      }

      if (endQuery.trim()) {
        if (endCoords) {
          params.push(`toLat=${endCoords.lat}`);
          params.push(`toLng=${endCoords.lng}`);
        } else {
          const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endQuery)}&limit=1`;
          const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "ShareMyRide-Search" } });
          const geoData = await geoRes.json();

          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            params.push(`toLat=${lat}`);
            params.push(`toLng=${lng}`);
          } else {
            throw new Error("Could not locate your destination address coordinates.");
          }
        }
      }

      if (dateQuery) params.push(`date=${dateQuery}`);

      const res = await fetch(queryStr + params.join("&"));
      if (!res.ok) throw new Error("Failed to search rides from database.");
      const data = await res.json();
      setRides(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">

        {/* Left panel */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">

          {/* Search form card */}
          <div
            className="animate-slideUp"
            style={{
              background: "rgba(30,41,59,0.65)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h1
              className="text-xl font-black tracking-tight mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
              Find Your Commute Pool
            </h1>

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#22C55E" }}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    id="start-location-input"
                    type="text"
                    placeholder="From (e.g. Lahore)"
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setStartCoords(null);
                    }}
                    className="input-dark"
                    style={{ paddingLeft: "44px" }}
                  />
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#06B6D4" }}>
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    id="end-location-input"
                    type="text"
                    placeholder="To (e.g. Islamabad)"
                    value={endQuery}
                    onChange={(e) => {
                      setEndQuery(e.target.value);
                      setEndCoords(null);
                    }}
                    className="input-dark"
                    style={{ paddingLeft: "44px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    value={dateQuery}
                    onChange={(e) => setDateQuery(e.target.value)}
                    className="input-dark"
                    style={{ paddingLeft: "44px", colorScheme: "dark" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 font-bold text-sm rounded-xl cursor-pointer transition-all"
                  style={{
                    background: loading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                    color: "#fff",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: loading ? "none" : "0 4px 14px rgba(34,197,94,0.35)",
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.5)"; } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(34,197,94,0.35)"; }}
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 1s linear infinite" }} />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search Rides
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              className="p-4 rounded-xl text-sm animate-fadeIn"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FB7185" }}
            >
              {errorMsg}
            </div>
          )}

          {/* Results count */}
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
              {rides.length} {rides.length === 1 ? "pool" : "pools"} found
            </span>
          </div>

          {/* Rides list */}
          {rides.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center flex flex-col items-center gap-4 animate-fadeIn"
              style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="p-4 rounded-2xl animate-float"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <Car className="h-8 w-8" style={{ color: "#22C55E" }} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
                No active pools available
              </h3>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: "#475569" }}>
                Adjust your travel dates or city spelling to view surrounding active routes.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[520px] pr-1">
              {rides.map((ride, idx) => (
                <div
                  key={ride.id}
                  className="animate-slideUp"
                  style={{
                    background: "rgba(30,41,59,0.6)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    padding: "20px",
                    transition: "all 0.3s ease",
                    animationDelay: `${idx * 60}ms`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.25)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Driver & Price */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 flex items-center justify-center font-black text-sm rounded-xl shrink-0"
                        style={{
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.2)",
                          color: "#4ADE80",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {ride.driver.name[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                          {ride.driver.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-xs" style={{ color: "#F59E0B" }}>
                            <Star className="h-3 w-3 fill-current" strokeWidth={0} />
                            {ride.driver.rating.toFixed(1)}
                          </span>
                          <span className="text-xs" style={{ color: "#475569" }}>
                            • {ride.vehicle ? `${ride.vehicle.color} ${ride.vehicle.brand} ${ride.vehicle.model}` : (ride.driver.vehicleDetails || "Verified Vehicle")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-lg font-black"
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
                      <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
                        /seat
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div
                    className="grid grid-cols-2 gap-3 py-3 mb-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#22C55E" }} />
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>From</div>
                        <div className="text-xs font-semibold leading-tight" style={{ color: "#CBD5E1" }}>
                          {ride.startLocation.split(",")[0]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#06B6D4" }} />
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>To</div>
                        <div className="text-xs font-semibold leading-tight" style={{ color: "#CBD5E1" }}>
                          {ride.endLocation.split(",")[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748B" }}>
                      <Clock className="h-3.5 w-3.5" style={{ color: "#3B82F6" }} />
                      <span>
                        {new Date(ride.departureTime).toLocaleDateString()} at{" "}
                        {new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <Link
                      href={`/rides/${ride.id}`}
                      className="px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #22C55E, #16A34A)",
                        color: "#fff",
                        boxShadow: "0 3px 10px rgba(34,197,94,0.3)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(34,197,94,0.45)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 3px 10px rgba(34,197,94,0.3)"; }}
                    >
                      Book Seat →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right map panel */}
        <div
          className="w-full lg:w-1/2 h-[400px] lg:h-[650px] sticky top-24 rounded-2xl overflow-hidden animate-fadeIn"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          <LeafletMap rides={rides} center={mapCenter} zoom={mapZoom} />
        </div>
      </main>
    </div>
  );
}

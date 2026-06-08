"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MapPin, Calendar, Clock, Users, ArrowRight, Car, ShieldAlert, Sparkles, AlertTriangle, Plus, Minus } from "lucide-react";
import Navbar from "@/components/Navbar";
import LocationInput from "@/components/LocationInput";
import { t } from "@/lib/i18n";

interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
}

const formatFullDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CreateRidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoords, setEndCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [timeHour, setTimeHour] = useState("09");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timePeriod, setTimePeriod] = useState("AM");
  const [availableSeats, setAvailableSeats] = useState("3");
  const [pricePerSeat, setPricePerSeat] = useState("500");

  // Autocomplete inputs are now handled by the self-contained LocationInput component.

  // Vehicles states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  // Inline register vehicle states
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);
  const [addVehicleError, setAddVehicleError] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in or not a DRIVER
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as CustomUser).role !== "DRIVER") {
      const triggerError = async () => {
        await Promise.resolve();
        setError("Access denied. Only registered drivers can publish rides.");
      };
      triggerError();
    }
  }, [status, session, router]);

  // Fetch driver's vehicles
  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
        if (data.length > 0) {
          setSelectedVehicleId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setVehiclesLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as CustomUser).role === "DRIVER") {
      const triggerFetch = async () => {
        await Promise.resolve();
        fetchVehicles();
      };
      triggerFetch();
    }
  }, [status, session]);

  // Set default tomorrow at 09:00 AM
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    const hours = String(tomorrow.getHours()).padStart(2, "0");
    const minutes = String(tomorrow.getMinutes()).padStart(2, "0");

    const deferSet = async () => {
      await Promise.resolve();
      setDepartureDate(`${year}-${month}-${day}`);
      setTimeHour("09");
      setTimeMinute("00");
      setTimePeriod("AM");
    };
    deferSet();
  }, []);

  const geocodeAddress = async (address: string) => {
    try {
      // 1. Try Photon Geocoding API (Fast and free)
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
      const photonRes = await fetch(photonUrl);
      const photonData = await photonRes.json();
      if (photonData && photonData.features && photonData.features.length > 0) {
        const feat = photonData.features[0];
        const coords = feat.geometry.coordinates;
        const props = feat.properties;
        const name = [props.name, props.city, props.state, props.country].filter(Boolean).join(", ");
        return { lat: coords[1], lng: coords[0], displayName: name };
      }

      // 2. Fallback to Nominatim OSM
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url, { headers: { "User-Agent": "ShareMyRide-Web-App" } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
      }
      throw new Error(`Location not found: ${address}`);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleAddVehicle = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAddVehicleError("");
    
    if (!newBrand || !newModel || !newYear || !newColor || !newPlateNumber) {
      setAddVehicleError("Please fill out all vehicle fields.");
      return;
    }

    setAddVehicleLoading(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: newBrand,
          model: newModel,
          year: parseInt(newYear),
          color: newColor,
          plateNumber: newPlateNumber
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register vehicle");
      }

      // Success
      setNewBrand("");
      setNewModel("");
      setNewYear("");
      setNewColor("");
      setNewPlateNumber("");
      setShowAddVehicle(false);
      
      // Refresh vehicles
      const updatedRes = await fetch("/api/vehicles");
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setVehicles(updatedData);
        // Set new vehicle as selected
        const newRegistered = updatedData.find((v: Vehicle) => v.plateNumber === newPlateNumber) || updatedData[0];
        if (newRegistered) {
          setSelectedVehicleId(newRegistered.id);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during vehicle registration.";
      setAddVehicleError(message);
    } finally {
      setAddVehicleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedVehicleId) {
        throw new Error("Please select or register a vehicle to offer this ride.");
      }

      let hoursNum = parseInt(timeHour);
      if (timePeriod === "PM" && hoursNum < 12) {
        hoursNum += 12;
      } else if (timePeriod === "AM" && hoursNum === 12) {
        hoursNum = 0;
      }
      const formattedHours = String(hoursNum).padStart(2, "0");
      const departureTime = `${departureDate}T${formattedHours}:${timeMinute}`;
      const parsedDate = new Date(departureTime);
      if (isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
        throw new Error("Please select a valid departure date and time in the future.");
      }

      let startLat = startCoords?.lat;
      let startLng = startCoords?.lng;
      let resolvedStartLocation = startLocation;
      if (!startCoords) {
        const startGeo = await geocodeAddress(startLocation);
        if (!startGeo) throw new Error("Could not find coordinates for your starting location. Please be more specific.");
        startLat = startGeo.lat;
        startLng = startGeo.lng;
        resolvedStartLocation = startGeo.displayName || startLocation;
      }

      let endLat = endCoords?.lat;
      let endLng = endCoords?.lng;
      let resolvedEndLocation = endLocation;
      if (!endCoords) {
        const endGeo = await geocodeAddress(endLocation);
        if (!endGeo) throw new Error("Could not find coordinates for your destination location. Please be more specific.");
        endLat = endGeo.lat;
        endLng = endGeo.lng;
        resolvedEndLocation = endGeo.displayName || endLocation;
      }

      const payload = {
        startLocation: resolvedStartLocation,
        startLat,
        startLng,
        endLocation: resolvedEndLocation,
        endLat,
        endLng,
        departureTime,
        availableSeats: parseInt(availableSeats),
        pricePerSeat: parseFloat(pricePerSeat),
        vehicleId: selectedVehicleId
      };

      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish ride");

      setSuccess(true);
      setTimeout(() => { router.push("/dashboard"); }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || vehiclesLoading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div
            className="h-10 w-10 rounded-full border-2"
            style={{ borderTopColor: "#22C55E", borderRightColor: "#06B6D4", borderColor: "transparent", animation: "spin 1s linear infinite" }}
          />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && (session?.user as CustomUser).role !== "DRIVER") {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md text-center flex flex-col items-center gap-5 p-10 animate-scaleIn"
            style={{
              background: "rgba(30,41,59,0.65)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(244,63,94,0.2)",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="p-4 rounded-2xl"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}
            >
              <ShieldAlert className="h-8 w-8" style={{ color: "#FB7185" }} />
            </div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
              {t("Driver Registration Required")}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
              {t("Your account is set to ")}<strong style={{ color: "#93C5FD" }}>{t("Passenger")}</strong>. {t("To offer rides, register a new account with the ")}<strong style={{ color: "#4ADE80" }}>{t("Driver")}</strong>{t(" role and vehicle credentials.")}
            </p>
            <button
              onClick={() => router.push("/register")}
              className="mt-2 w-full py-3 font-bold rounded-xl cursor-pointer transition-all"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {t("Register as Driver")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #22C55E, transparent)", animation: "blob-drift 9s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl opacity-6"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)", animation: "blob-drift 11s ease-in-out infinite reverse" }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center py-14 px-4 relative z-10">
        <div
          className="w-full max-w-xl animate-scaleIn"
          style={{
            background: "rgba(30,41,59,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-widest mb-3"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
              >
                {t("Driver Module")}
              </div>
              <h1
                className="text-2xl font-black tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
              >
                {t("Publish a New Ride")}
              </h1>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                {t("Share your empty seats with travelers")}
              </p>
            </div>
            <div
              className="p-3 rounded-xl shrink-0"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                boxShadow: "0 0 20px rgba(34,197,94,0.15)",
              }}
            >
              <Car className="h-6 w-6" style={{ color: "#22C55E" }} strokeWidth={2} />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm animate-fadeIn"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FB7185" }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm animate-fadeIn"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t("Ride published successfully! Navigating to dashboard...")}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Vehicle Selection Block */}
            <div 
              className="p-4 rounded-xl flex flex-col gap-3.5"
              style={{
                background: "rgba(15,23,42,0.4)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Select Vehicle")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="text-xs font-bold transition-all flex items-center gap-1"
                  style={{ color: "#22C55E", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showAddVehicle ? t("Cancel Register") : t("+ Register Another Vehicle")}
                </button>
              </div>

              {!showAddVehicle ? (
                vehicles.length === 0 ? (
                  <div className="text-center py-3 flex flex-col items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="text-xs text-slate-400">{t("No vehicles registered yet. Please register your car below.")}</p>
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(true)}
                      className="px-4 py-2 mt-1 text-xs font-bold text-white rounded-lg transition-all"
                      style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", cursor: "pointer" }}
                    >
                      {t("Register Car Now")}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#22C55E" }}>
                      <Car className="h-4 w-4" />
                    </span>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="input-dark cursor-pointer font-medium"
                      style={{ paddingLeft: "44px", colorScheme: "dark" }}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id} style={{ background: "#1E293B" }}>
                          {v.color} {v.brand} {v.model} ({v.plateNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                /* Inline Add Vehicle Sub-Form */
                <div className="flex flex-col gap-3.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800 animate-slideDown">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Register New Vehicle")}</h4>
                  
                  {addVehicleError && (
                    <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/50 text-[11px] text-rose-400">
                      {addVehicleError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t("Brand")}</label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t("Model")}</label>
                      <input
                        type="text"
                        placeholder="e.g. Corolla"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t("Year")}</label>
                      <input
                        type="number"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                        placeholder="2020"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t("Color")}</label>
                      <input
                        type="text"
                        placeholder="e.g. Black"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t("Plate No.")}</label>
                      <input
                        type="text"
                        placeholder="LE-7890"
                        value={newPlateNumber}
                        onChange={(e) => setNewPlateNumber(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddVehicle}
                    disabled={addVehicleLoading}
                    className="w-full py-2 font-bold text-xs rounded transition-all mt-1"
                    style={{
                      background: "linear-gradient(135deg, #22C55E, #16A34A)",
                      color: "#fff",
                      cursor: "pointer"
                    }}
                  >
                    {addVehicleLoading ? "Registering..." : "Register Car"}
                  </button>
                </div>
              )}
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Start Location")}
                </label>
                <LocationInput
                  id="create-start-location-input"
                  placeholder="e.g. Lahore, Pakistan"
                  value={startLocation}
                  onChange={setStartLocation}
                  onSelectCoords={setStartCoords}
                  icon={<MapPin className="h-4 w-4" style={{ color: "#22C55E" }} />}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Destination")}
                </label>
                <LocationInput
                  id="create-end-location-input"
                  placeholder="e.g. Islamabad, Pakistan"
                  value={endLocation}
                  onChange={setEndLocation}
                  onSelectCoords={setEndCoords}
                  icon={<MapPin className="h-4 w-4" style={{ color: "#06B6D4" }} />}
                />
              </div>
            </div>

            {/* Time & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Departure Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Departure Date")}
                </label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    ref={dateInputRef}
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="input-dark w-full cursor-pointer"
                    style={{ paddingLeft: "44px", colorScheme: "dark" }}
                  />
                </div>
                {departureDate && (
                  <div className="text-[11px] font-semibold text-emerald-400 mt-1 flex items-center gap-1.5 animate-fadeIn">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>{formatFullDate(departureDate)}</span>
                  </div>
                )}
              </div>

              {/* Departure Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Departure Time")}
                </label>
                <div className="flex gap-2">
                  {/* Hour */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: "#475569" }}>
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <select
                      value={timeHour}
                      onChange={(e) => setTimeHour(e.target.value)}
                      className="input-dark cursor-pointer w-full"
                      style={{ paddingLeft: "34px", colorScheme: "dark" }}
                    >
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((h) => (
                        <option key={h} value={h} style={{ background: "#1E293B" }}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minute */}
                  <div className="relative flex-1">
                    <select
                      value={timeMinute}
                      onChange={(e) => setTimeMinute(e.target.value)}
                      className="input-dark cursor-pointer w-full"
                      style={{ colorScheme: "dark" }}
                    >
                      {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                        <option key={m} value={m} style={{ background: "#1E293B" }}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AM/PM */}
                  <div className="relative w-20">
                    <select
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      className="input-dark cursor-pointer w-full text-center"
                      style={{ colorScheme: "dark" }}
                    >
                      {["AM", "PM"].map((p) => (
                        <option key={p} value={p} style={{ background: "#1E293B" }}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Seats & Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seats Offered */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Seats Offered")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                    <Users className="h-4 w-4" />
                  </span>
                  <select
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(e.target.value)}
                    className="input-dark cursor-pointer w-full"
                    style={{ paddingLeft: "44px", colorScheme: "dark" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} style={{ background: "#1E293B" }}>
                        {s} {s === 1 ? t("seat") : t("seats")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price per Seat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Price/Seat (PKR)")}
                </label>
                <div className="flex items-center gap-2.5">
                  {/* Decrease Button */}
                  <button
                    type="button"
                    onClick={() => setPricePerSeat(prev => {
                      const val = Math.max(1, parseInt(prev || "0") - 5);
                      return String(val);
                    })}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer shrink-0"
                    title="Decrease Price by 5"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} />
                  </button>

                  {/* Input displaying the price */}
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-emerald-400">
                      Rs
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={pricePerSeat}
                      onChange={(e) => setPricePerSeat(e.target.value)}
                      className="input-dark w-full text-center text-sm font-bold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ paddingLeft: "36px", paddingRight: "12px" }}
                    />
                  </div>

                  {/* Increase Button */}
                  <button
                    type="button"
                    onClick={() => setPricePerSeat(prev => {
                      const val = parseInt(prev || "0") + 5;
                      return String(val);
                    })}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer shrink-0"
                    title="Increase Price by 5"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Geocode Info */}
            <div
              className="p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                color: "#94A3B8",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#22C55E" }} strokeWidth={2} />
              <span>{t("We calculate routing paths, total distance, and duration estimates instantly using our premium open-source directions routing service.")}</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success || vehicles.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-sm rounded-xl transition-all cursor-pointer mt-1"
              style={{
                background: loading || success || vehicles.length === 0 ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: loading || success || vehicles.length === 0 ? "none" : "0 6px 20px rgba(34,197,94,0.4)",
                opacity: loading || success || vehicles.length === 0 ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && !success && vehicles.length > 0) {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(34,197,94,0.55)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.4)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <>
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span>{t("Publishing Ride...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Publish Ride Offer")}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Navigation } from "lucide-react";
import { t } from "@/lib/i18n";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  driver?: {
    name: string;
  } | null;
}

interface MapProps {
  rides: Ride[];
  center?: [number, number];
  zoom?: number;
}

const formatDistance = (meters: number) => {
  const km = meters / 1000;
  return km >= 1 ? `${km.toFixed(1)} km` : `${meters.toFixed(0)} m`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours} hr ${remainingMins} min` : `${hours} hr`;
};

export default function Map({ rides, center = [30.3753, 69.3451], zoom = 6 }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pathsRef = useRef<L.Polyline[]>([]);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, zoom);

      // Add CartoDB Dark Matter tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      setMapReady(true);

      // User Geolocation Indicator
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove();
            }

            const userIcon = L.divIcon({
              className: "custom-user-marker",
              html: `
                <div style="position: relative; width: 14px; height: 14px;">
                  <div style="
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    background-color: #3B82F6;
                    border: 2px solid white;
                    border-radius: 50%;
                    z-index: 2;
                  "></div>
                  <div style="
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    background-color: rgba(59, 130, 246, 0.4);
                    border-radius: 50%;
                    top: -8px;
                    left: -8px;
                    animation: pulse 2s infinite ease-out;
                    z-index: 1;
                  "></div>
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                  }
                </style>
              `,
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });

            if (mapInstanceRef.current) {
              userLocationMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
                .addTo(mapInstanceRef.current)
                .bindPopup("Your Location");
            }
          },
          (err) => console.warn("Geolocation permission not allowed:", err)
        );
      }
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear old routes/polylines
    pathsRef.current.forEach((path) => path.remove());
    pathsRef.current = [];
    setRouteInfo(null);

    // Scenario A: Single Ride Details Page (Routing Polyline + Start/End Markers)
    if (rides.length === 1) {
      const ride = rides[0];
      if (ride.startLat && ride.startLng && ride.endLat && ride.endLng) {
        const fetchRoute = async () => {
          const start = [ride.startLng, ride.startLat];
          const end = [ride.endLng, ride.endLat];
          const orsApiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
          let routeCoords: [number, number][] = [];
          let distance = "";
          let duration = "";

          try {
            // 1. Try OpenRouteService if key is available
            if (orsApiKey) {
              const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${start.join(",")}&end=${end.join(",")}`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                if (data.features && data.features.length > 0) {
                  const feature = data.features[0];
                  routeCoords = feature.geometry.coordinates.map(([lng, lat]: any) => [lat, lng]);
                  const summary = feature.properties.summary;
                  distance = formatDistance(summary.distance);
                  duration = formatDuration(summary.duration);
                }
              }
            }

            // 2. Fallback to Open Source Routing Machine (OSRM)
            if (routeCoords.length === 0) {
              const url = `https://router.project-osrm.org/route/v1/driving/${start.join(",")};${end.join(",")}?overview=full&geometries=geojson`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                  const route = data.routes[0];
                  routeCoords = route.geometry.coordinates.map(([lng, lat]: any) => [lat, lng]);
                  distance = formatDistance(route.distance);
                  duration = formatDuration(route.duration);
                }
              }
            }

            if (routeCoords.length > 0 && mapInstanceRef.current) {
              const polyline = L.polyline(routeCoords, {
                color: "#10B981", // Glowing emerald green
                weight: 5,
                opacity: 0.85,
              }).addTo(mapInstanceRef.current);

              pathsRef.current.push(polyline);
              setRouteInfo({ distance, duration });

              // Auto zoom and pan to fit the entire route path
              mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
            }
          } catch (err) {
            console.error("Leaflet routing estimation error:", err);
          }
        };

        fetchRoute();

        // Custom A (Start) and B (End) HTML DivIcon Markers
        const startIcon = L.divIcon({
          className: "custom-marker-start",
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: #22C55E;
              color: white;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">A</div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const endIcon = L.divIcon({
          className: "custom-marker-end",
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: #06B6D4;
              color: white;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">B</div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const startMarker = L.marker([ride.startLat, ride.startLng], { icon: startIcon }).addTo(map);
        markersRef.current.push(startMarker);

        const endMarker = L.marker([ride.endLat, ride.endLng], { icon: endIcon }).addTo(map);
        markersRef.current.push(endMarker);
      }
    } else {
      // Scenario B: Search results view (Multiple markers with custom Leaflet popups)
      const rideIcon = L.divIcon({
        className: "custom-marker-ride",
        html: `
          <div style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #10B981;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      rides.forEach((ride) => {
        if (!ride.startLat || !ride.startLng) return;

        const departureDate = new Date(ride.departureTime).toLocaleDateString();
        const departureTime = new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const startLocShort = ride.startLocation.split(",")[0];
        const endLocShort = ride.endLocation.split(",")[0];

        const infoContent = `
          <div style="
            font-family: 'Plus Jakarta Sans', var(--font-display), sans-serif;
            color: #f8fafc;
            padding: 14px;
            min-width: 220px;
            max-width: 260px;
          ">
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #f8fafc; display: flex; align-items: center; gap: 4px;">
              <span style="color: #22C55E;">🟢</span> From: ${startLocShort}
            </h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; font-weight: 500;">
              <span style="color: #06B6D4;">🔵</span> To: ${endLocShort}
            </p>
            
            <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">👤</span> <strong>Driver:</strong> ${ride.driver?.name || "Verified Driver"}
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px;">📅</span> <strong>Time:</strong> ${departureDate} at ${departureTime}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #4ade80;">
                <span style="font-size: 12px;">💰</span> Rs. ${ride.pricePerSeat} per seat
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: #64748b;">
                👥 ${ride.availableSeats} seats left
              </div>
            </div>
            
            <a href="/rides/${ride.id}" style="
              display: block;
              width: 100%;
              text-align: center;
              padding: 7px 0;
              font-size: 11px;
              font-weight: 700;
              color: #ffffff;
              background: linear-gradient(135deg, #22C55E, #16A34A);
              border-radius: 6px;
              text-decoration: none;
              box-shadow: 0 3px 8px rgba(34, 197, 94, 0.25);
              transition: transform 0.2s ease;
            ">Book Seat Now</a>
          </div>
        `;

        const marker = L.marker([ride.startLat, ride.startLng], { icon: rideIcon })
          .addTo(map)
          .bindPopup(infoContent, {
            className: "custom-leaflet-popup",
            maxWidth: 280,
          });

        markersRef.current.push(marker);
      });
    }

    // Cleanup logic on unmount
    return () => {
      // Clean up markers and paths if unmounting
    };
  }, [rides, center, zoom]);

  return (
    <div className="relative h-full w-full">
      {/* Styles for glassmorphic Leaflet popup */}
      <style jsx global>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6) !important;
          color: #f8fafc !important;
          padding: 0 !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.85) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: none !important;
        }
        .custom-leaflet-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
          top: 10px !important;
          right: 10px !important;
        }
      `}</style>

      {/* Leaflet Map container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-2xl overflow-hidden border border-zinc-250/10 shadow-inner"
        style={{ minHeight: "100%", zIndex: 1 }}
      />

      {/* Floating Travel Information Overlay (Glassmorphic Card) */}
      {routeInfo && (
        <div
          className="absolute top-4 left-4 z-10 p-4 animate-slideDown"
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            width: "calc(100% - 32px)",
            maxWidth: "280px",
            zIndex: 10,
          }}
        >
          <div className="flex flex-col gap-2.5">
            <h4
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#22D3EE", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {t("Route Overview")}
            </h4>
            <div className="h-px bg-white/5" />
            <div className="flex items-center gap-3">
              <Navigation className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  {t("Total Distance")}
                </span>
                <span className="text-xs font-bold text-slate-200 block">
                  {routeInfo.distance}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0" style={{ color: "#3B82F6" }} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  {t("Estimated Travel Time")}
                </span>
                <span className="text-xs font-bold text-slate-200 block">
                  {routeInfo.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Loader State Overlay */}
      {!mapReady && (
        <div
          className="absolute inset-0 flex items-center justify-center font-medium shimmer z-20"
          style={{ background: "rgba(30,41,59,0.7)", color: "#475569", borderRadius: "16px", zIndex: 10 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-8 w-8 rounded-full border-2"
              style={{
                borderTopColor: "#22C55E",
                borderRightColor: "#06B6D4",
                borderColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
            <p className="text-xs font-bold text-slate-400">{t("Loading Premium Map Engine...")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

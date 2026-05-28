"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Navigation } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

// Google Maps Dark Mode Styling Stylesheet
const mapDarkStyles = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#064e3b" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#34d399" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#10b981" }, { weight: 1.5 }], // Emerald green highways
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#0284c7" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#06b6d4" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0b1528" }], // Deep blue water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
];

let scriptLoadingPromise: Promise<any> | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google && window.google.maps && window.google.maps.Map) return Promise.resolve(window.google);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const callbackName = "initGoogleMapsCallback";
    
    (window as any)[callbackName] = () => {
      resolve(window.google);
      delete (window as any)[callbackName];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      scriptLoadingPromise = null;
      delete (window as any)[callbackName];
      reject(err);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

interface MapProps {
  rides: any[];
  center?: [number, number];
  zoom?: number;
}

export default function Map({ rides, center = [37.7749, -122.4194], zoom = 5 }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    // Inject and load the API key provided
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA0fY4F3W06R6BuUd_GKNlgZFQ497Luk20";
    loadGoogleMapsScript(apiKey)
      .then(() => setGoogleLoaded(true))
      .catch((err) => console.error("Google Maps failed to load script:", err));
  }, []);

  useEffect(() => {
    if (!googleLoaded || !mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: zoom,
        styles: mapDarkStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      // User Geolocation Indicator
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.setMap(null);
            }

            userLocationMarkerRef.current = new window.google.maps.Marker({
              position: { lat: userLat, lng: userLng },
              map: mapInstanceRef.current,
              title: "Your Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#3B82F6", // Pulsing blue theme color
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              },
            });
          },
          (err) => console.warn("Geolocation permission not allowed:", err)
        );
      }
    } else {
      // Re-center map if center coordinates changed
      mapInstanceRef.current.setCenter({ lat: center[0], lng: center[1] });
      mapInstanceRef.current.setZoom(zoom);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear old routes
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    setRouteInfo(null);

    // Scenario A: Single Ride Details Page (Routing Polyline + Start/End Markers)
    if (rides.length === 1) {
      const ride = rides[0];
      if (ride.startLat && ride.startLng && ride.endLat && ride.endLng) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#10B981", // Glowing emerald green
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        });
        directionsRendererRef.current = directionsRenderer;

        directionsService.route(
          {
            origin: { lat: ride.startLat, lng: ride.startLng },
            destination: { lat: ride.endLat, lng: ride.endLng },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response: any, status: string) => {
            if (status === "OK" && response) {
              directionsRenderer.setDirections(response);
              const leg = response.routes[0].legs[0];
              setRouteInfo({
                distance: leg.distance?.text || "",
                duration: leg.duration?.text || "",
              });
            } else {
              console.error("Directions lookup failed status:", status);
            }
          }
        );

        // Custom A (Start) and B (End) Markers
        const startMarker = new window.google.maps.Marker({
          position: { lat: ride.startLat, lng: ride.startLng },
          map: map,
          title: "Start Point",
          label: {
            text: "A",
            color: "#FFFFFF",
            fontWeight: "bold",
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#22C55E", // Emerald green
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(startMarker);

        const endMarker = new window.google.maps.Marker({
          position: { lat: ride.endLat, lng: ride.endLng },
          map: map,
          title: "End Point",
          label: {
            text: "B",
            color: "#FFFFFF",
            fontWeight: "bold",
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 11,
            fillColor: "#06B6D4", // Cyan
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(endMarker);
      }
    } else {
      // Scenario B: Search results view (Multiple markers with custom InfoWindows)
      const infoWindow = new window.google.maps.InfoWindow();

      rides.forEach((ride) => {
        if (!ride.startLat || !ride.startLng) return;

        const marker = new window.google.maps.Marker({
          position: { lat: ride.startLat, lng: ride.startLng },
          map: map,
          title: `Ride offered by ${ride.driver?.name || "Verified Driver"}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#10B981", // Emerald theme dots
            fillOpacity: 0.9,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
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

          infoWindow.setContent(infoContent);
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });
    }

  }, [googleLoaded, rides, center, zoom]);

  return (
    <div className="relative h-full w-full">
      {/* Google Map Element container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-2xl overflow-hidden border border-zinc-250/10 shadow-inner"
        style={{ minHeight: "100%" }}
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
          }}
        >
          <div className="flex flex-col gap-2.5">
            <h4
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#22D3EE", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Route Overview
            </h4>
            <div className="h-px bg-white/5" />
            <div className="flex items-center gap-3">
              <Navigation className="h-4 w-4 shrink-0" style={{ color: "#10B981" }} />
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Total Distance
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
                  Estimated Travel Time
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
      {!googleLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center font-medium shimmer z-20"
          style={{ background: "rgba(30,41,59,0.7)", color: "#475569", borderRadius: "16px" }}
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
            <p className="text-xs font-bold text-slate-400">Loading Premium Map Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface LocationInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCoords: (coords: { lat: number; lng: number } | null) => void;
  icon?: React.ReactNode;
}

export default function LocationInput({
  id,
  placeholder,
  value,
  onChange,
  onSelectCoords,
  icon,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with a simple debounce
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // If the input value matches the exact last selection, do not query API again
    if (lastSelectedRef.current === value.trim()) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.features) {
            setSuggestions(data.features);
          }
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  const handleSelect = (feature: any) => {
    const coords = feature.geometry.coordinates; // Photon returns [lng, lat]
    const props = feature.properties;
    
    // Construct address string: Name, City, State, Country
    const parts = [
      props.name,
      props.city || props.town || props.village,
      props.state,
      props.country,
    ].filter(Boolean);
    
    // De-duplicate names/cities if they are equivalent
    const uniqueParts: string[] = [];
    parts.forEach((p) => {
      if (!uniqueParts.includes(p)) {
        uniqueParts.push(p);
      }
    });

    const fullAddress = uniqueParts.join(", ");
    
    lastSelectedRef.current = fullAddress;
    onChange(fullAddress);
    onSelectCoords({ lat: coords[1], lng: coords[0] });
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
          {icon || <MapPin className="h-4 w-4" />}
        </span>
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onSelectCoords(null); // Reset coords as user edits text
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="input-dark"
          style={{ paddingLeft: "44px" }}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            <span
              className="h-3 w-3 rounded-full border border-white/20 border-t-emerald-500 animate-spin"
            />
          </span>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 z-50 overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          {suggestions.map((feature, idx) => {
            const props = feature.properties;
            const title = props.name;
            const subtitle = [
              props.city || props.town || props.village,
              props.state,
              props.country,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-4 py-3 text-xs border-b border-white/5 last:border-b-0 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors flex flex-col gap-0.5 cursor-pointer outline-none"
                style={{ color: "#E2E8F0" }}
              >
                <span className="font-bold text-[13px]">{title}</span>
                {subtitle && <span className="text-[10px] opacity-60">{subtitle}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

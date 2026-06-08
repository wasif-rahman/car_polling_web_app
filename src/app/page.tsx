"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Leaf,
  Shield,
  Landmark,
  Car,
  Zap,
  CheckCircle2,
  Star,
  TrendingUp,
} from "lucide-react";

const ThreeLogo = dynamic(() => import("@/components/ThreeLogo"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] lg:h-[450px] w-full flex items-center justify-center text-xs text-slate-500 uppercase tracking-widest font-black animate-pulse">
      Loading Classy 3D Model...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <header className="relative overflow-hidden py-28 sm:py-36 hero-bg">
        {/* Floating animated blobs */}
        <div
          className="absolute top-16 right-12 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #22C55E 0%, transparent 70%)",
            animation: "blob-drift 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-10 left-8 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
            animation: "blob-drift 10s ease-in-out infinite reverse",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #3B82F6 0%, transparent 70%)",
            animation: "blob-drift 12s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side text column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-7 max-w-3xl">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold animate-fadeIn"
                style={{
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#4ADE80",
                }}
              >
                <Leaf className="h-3.5 w-3.5" strokeWidth={2.5} />
                Eco-Friendly Commuting Made Simple
              </div>

              {/* Headline */}
              <h1
                className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] sm:leading-[0.95] animate-slideUp animate-delay-100"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span style={{ color: "#F8FAFC" }}>Share Rides.</span>
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Split Travel Costs.
                </span>
                <br />
                <span style={{ color: "#CBD5E1" }}>Meet Your Neighbors.</span>
              </h1>

              {/* Sub text */}
              <p
                className="text-lg sm:text-xl leading-relaxed max-w-2xl animate-slideUp animate-delay-200"
                style={{ color: "#94A3B8" }}
              >
                Connect with verified drivers heading your way. Reduce carbon emissions, beat
                urban traffic, and turn boring daily commutes into budget-friendly social journeys.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto animate-slideUp animate-delay-300">
                <Link
                  href="/rides/search"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "15px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: "12px",
                    boxShadow: "0 6px 25px rgba(34,197,94,0.4)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 35px rgba(34,197,94,0.55)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 25px rgba(34,197,94,0.4)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Find Available Rides
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>

                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px 32px",
                    background: "rgba(30,41,59,0.6)",
                    backdropFilter: "blur(12px)",
                    color: "#F8FAFC",
                    fontWeight: 600,
                    fontSize: "15px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid rgba(34,197,94,0.4)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(38,51,71,0.8)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(30,41,59,0.6)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <Zap className="h-4 w-4" strokeWidth={2.5} style={{ color: "#22C55E" }} />
                  Offer an Empty Seat
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-5 mt-2 animate-fadeIn animate-delay-500">
                {[
                  { icon: CheckCircle2, label: "Verified drivers" },
                  { icon: Shield, label: "Safe & Secure" },
                  { icon: Star, label: "4.8★ rated" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5" style={{ color: "#64748B" }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: "#22C55E" }} strokeWidth={2} />
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side 3D Interactive column */}
            <div className="lg:col-span-5 w-full h-[350px] lg:h-[450px] flex items-center justify-center relative animate-fadeIn animate-delay-300">
              <ThreeLogo />
            </div>
          </div>
        </div>
      </header>

      {/* ─── CORE ADVANTAGES ─── */}
      <section className="py-24" style={{ background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#22C55E" }}>
              Why Choose Us
            </p>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#F8FAFC",
              }}
            >
              Why pool with{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #22C55E, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Pooler?
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "#94A3B8" }}>
              We provide the core trust architecture to ensure safety, reliability, and ease of
              use in every carpool session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                color: "#22C55E",
                title: "Fully Verified Profiles",
                desc: "Drivers are vetted using valid driving licenses and car registration documentation. Passenger ratings keep the community accountable.",
                delay: "0ms",
              },
              {
                icon: Landmark,
                color: "#06B6D4",
                title: "Smart Fare Calculations",
                desc: "Our smart cost calculator automatically divides commute and toll expenses fairly among users, avoiding awkward price negotiations.",
                delay: "100ms",
              },
              {
                icon: Leaf,
                color: "#3B82F6",
                title: "Zero Carbon Overhead",
                desc: "Every empty seat we fill removes a car from the highway. Watch your profile dashboard carbon offset metrics grow with each mile.",
                delay: "200ms",
              },
            ].map(({ icon: Icon, color, title, desc, delay }) => (
              <div
                key={title}
                className="glass-card p-8 group cursor-default"
                style={{ animationDelay: delay }}
              >
                <div
                  className="p-3 rounded-xl w-fit mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color }} strokeWidth={2} />
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "#F8FAFC",
                  }}
                >
                  {title}
                </h3>
                <p className="leading-relaxed text-sm" style={{ color: "#94A3B8" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section
        className="py-24"
        style={{
          background: "rgba(30,41,59,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#06B6D4" }}>
              Getting Started
            </p>
            <h2
              className="text-3xl sm:text-5xl font-black"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "#F8FAFC",
              }}
            >
              Simple 3-Step Workflow
            </h2>
            <p className="text-lg mt-4 leading-relaxed" style={{ color: "#94A3B8" }}>
              Getting started takes less than three minutes, whether you are a driver looking
              to fill seats or a passenger seeking a commute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.3), rgba(6,182,212,0.3), transparent)",
              }}
            />

            {[
              {
                num: "01",
                color: "#22C55E",
                title: "Set Route & Time",
                desc: "Drivers define origin, destination, and departure dates. Passengers input their destination coordinates to search nearby routes.",
              },
              {
                num: "02",
                color: "#06B6D4",
                title: "Request & Approve",
                desc: "Passengers click to request booking. Drivers receive notification prompts instantly and can review profiles before approving.",
              },
              {
                num: "03",
                color: "#3B82F6",
                title: "Meet & Connect",
                desc: "Once approved, in-app messaging unlocks. Coordinate pickup details, meet at the coordinate stop, and travel together!",
              },
            ].map(({ num, color, title, desc }, i) => (
              <div
                key={num}
                className="flex flex-col items-center text-center gap-5 p-6 animate-slideUp"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div
                  className="relative flex items-center justify-center w-16 h-16 rounded-2xl font-black text-lg z-10"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                    border: `2px solid ${color}40`,
                    color,
                    boxShadow: `0 0 25px ${color}25`,
                  }}
                >
                  {num}
                </div>
                <div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "#F8FAFC",
                    }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#94A3B8" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section
        className="py-20 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #052e16 0%, #0c1a3a 50%, #0d2638 100%)",
          borderTop: "1px solid rgba(34,197,94,0.15)",
        }}
      >
        {/* Animated shimmer */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.6) 50%, transparent 100%)",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite",
          }}
        />
        <div
          className="absolute top-4 right-20 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #22C55E, transparent)" }}
        />
        <div
          className="absolute bottom-4 left-20 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 relative">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ADE80" }}
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
            Join thousands of commuters
          </div>

          <h2
            className="text-3xl sm:text-5xl font-black max-w-2xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
          >
            Ready to change the way you{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #22C55E, #06B6D4)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              travel?
            </span>
          </h2>

          <p className="max-w-lg text-lg" style={{ color: "#94A3B8" }}>
            Create your account today and connect with thousands of active drivers and
            passengers on the network.
          </p>

          <Link
            href="/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 40px",
              background: "linear-gradient(135deg, #22C55E, #16A34A)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(34,197,94,0.45)",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 40px rgba(34,197,94,0.6)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(34,197,94,0.45)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
            }}
          >
            Create Your Account
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="mt-auto py-10"
        style={{
          background: "#080F1E",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Pooler Logo"
              className="h-10 w-auto rounded-lg"
            />
            <span
              className="font-bold text-base"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "linear-gradient(135deg, #22C55E, #06B6D4)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pooler
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs" style={{ color: "#334155" }}>
            <span>© {new Date().getFullYear()} Pooler. All rights reserved.</span>
            <span className="hidden sm:block" style={{ color: "#1E293B" }}>•</span>
            <span>Built for Web Engineering 2026.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Share2, Search, PlusCircle, LogOut, User, Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(15, 23, 42, 0.92)"
          : "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="relative p-1.5 rounded-lg transition-all duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(6,182,212,0.2))",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                <Share2
                  className="h-5 w-5"
                  style={{ color: "#22C55E" }}
                  strokeWidth={2.5}
                />
              </div>
              <span
                className="font-bold text-lg tracking-tight"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: "linear-gradient(135deg, #22C55E, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ShareMyRide
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/rides/search"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#22C55E";
                (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Search className="h-4 w-4" strokeWidth={2} />
              Find a Ride
            </Link>

            {session?.user && (
              <>
                <Link
                  href="/rides/create"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#22C55E";
                    (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <PlusCircle className="h-4 w-4" strokeWidth={2} />
                  Post a Ride
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{ color: "#94A3B8" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#22C55E";
                    (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <User className="h-4 w-4" strokeWidth={2} />
                  Dashboard
                </Link>
              </>
            )}

            {/* Auth section */}
            <div className="flex items-center gap-3 pl-4 ml-2" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold" style={{ color: "#F8FAFC" }}>{session.user.name}</p>
                    <span
                      className="inline-block px-2 py-0.5 text-[9px] font-bold rounded mt-0.5 tracking-widest uppercase"
                      style={
                        (session.user as any).role === "DRIVER"
                          ? { background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.3)" }
                          : { background: "rgba(59,130,246,0.15)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)" }
                      }
                    >
                      {(session.user as any).role}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-2 rounded-lg transition-all duration-200 cursor-pointer"
                    style={{ color: "#64748B" }}
                    title="Logout"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#F43F5E";
                      (e.currentTarget as HTMLElement).style.background = "rgba(244,63,94,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#64748B";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium transition-all duration-200"
                    style={{ color: "#94A3B8" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F8FAFC"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm px-4 py-2 rounded-lg font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #22C55E, #16A34A)",
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                      transition: "all 0.3s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.5)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(34,197,94,0.35)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: "#94A3B8" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F8FAFC"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="md:hidden animate-slideDown py-3 px-4 flex flex-col gap-1"
          style={{
            background: "rgba(15, 23, 42, 0.98)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Link
            href="/rides/search"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 text-sm font-medium rounded-xl transition-all"
            style={{ color: "#94A3B8" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Search className="h-4 w-4" />
            Find a Ride
          </Link>

          {session?.user && (
            <>
              <Link
                href="/rides/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3 text-sm font-medium rounded-xl transition-all"
                style={{ color: "#94A3B8" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <PlusCircle className="h-4 w-4" />
                Post a Ride
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 p-3 text-sm font-medium rounded-xl transition-all"
                style={{ color: "#94A3B8" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          )}

          <div className="my-2" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {session?.user ? (
            <div className="flex flex-col gap-3 p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>{session.user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{session.user.email}</p>
                </div>
                <span
                  className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest"
                  style={
                    (session.user as any).role === "DRIVER"
                      ? { background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.3)" }
                      : { background: "rgba(59,130,246,0.15)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)" }
                  }
                >
                  {(session.user as any).role}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer w-full"
                style={{
                  color: "#F87171",
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-1">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  color: "#94A3B8",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex justify-center items-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={{
                  color: "#fff",
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                }}
              >
                <Zap className="h-4 w-4" strokeWidth={2.5} />
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

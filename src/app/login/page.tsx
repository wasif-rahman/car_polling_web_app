"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        throw new Error(res.error || "Invalid credentials");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #22C55E, transparent)", animation: "blob-drift 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)", animation: "blob-drift 10s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-3/4 left-3/4 w-48 h-48 rounded-full blur-3xl opacity-6"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)", animation: "blob-drift 12s ease-in-out infinite", animationDelay: "3s" }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <div
          className="w-full max-w-md animate-scaleIn"
          style={{
            background: "rgba(30, 41, 59, 0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.05)",
          }}
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="p-3.5 rounded-2xl mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(6,182,212,0.1))",
                border: "1px solid rgba(34,197,94,0.25)",
                boxShadow: "0 0 20px rgba(34,197,94,0.15)",
              }}
            >
              <Car className="h-8 w-8" style={{ color: "#22C55E" }} strokeWidth={2} />
            </div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#64748B" }}>
              Sign in to manage your pools and travels
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm animate-fadeIn"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#FB7185",
              }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm animate-fadeIn"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#4ADE80",
              }}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Logged in successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5"
                  style={{ color: "#475569" }}
                >
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#94A3B8" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold transition-all"
                  style={{ color: "#22C55E" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4ADE80"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-3.5"
                  style={{ color: "#475569" }}
                >
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer mt-1 relative overflow-hidden"
              style={{
                background: loading || success
                  ? "rgba(34,197,94,0.4)"
                  : "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: loading || success ? "none" : "0 6px 20px rgba(34,197,94,0.4)",
                opacity: loading || success ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && !success) {
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
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="px-3 font-medium"
                  style={{ background: "rgba(30,41,59,0.65)", color: "#475569" }}
                >
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 py-3 font-semibold text-sm rounded-xl transition-all cursor-pointer"
              style={{
                background: "rgba(15,23,42,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#CBD5E1",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(15,23,42,0.8)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(15,23,42,0.5)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 15.02 1 12 1 7.35 1 3.39 3.67 1.41 7.56l3.87 3C6.24 7.62 8.88 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57v2.96h3.91c2.28-2.1 3.54-5.19 3.54-8.68z" />
                <path fill="#FBBC05" d="M5.28 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.41 6.94C.51 8.75 0 10.77 0 12.9s.51 4.15 1.41 5.96l3.87-3.3z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.91-2.96c-1.08.72-2.48 1.16-4.05 1.16-3.12 0-5.76-2.58-6.71-5.52l-3.87 3C3.39 20.33 7.35 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: "#475569" }}>
            New to ShareMyRide?{" "}
            <Link
              href="/register"
              className="font-semibold transition-all"
              style={{ color: "#22C55E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4ADE80"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

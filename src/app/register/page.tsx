"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Mail, Lock, User, ShieldAlert, ArrowRight, ShieldCheck, Check, X, UserRound } from "lucide-react";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";

const PasswordRule = ({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) => (
  <div className="flex items-center gap-1.5">
    <div
      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
      style={{
        background: met ? "rgba(34,197,94,0.2)" : "rgba(100,116,139,0.15)",
        border: met ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(100,116,139,0.2)",
      }}
    >
      {met ? (
        <Check className="h-2.5 w-2.5" style={{ color: "#4ADE80" }} strokeWidth={3} />
      ) : (
        <X className="h-2.5 w-2.5" style={{ color: "#475569" }} strokeWidth={3} />
      )}
    </div>
    <span
      className="text-xs transition-all duration-300"
      style={{ color: met ? "#4ADE80" : "#475569", fontWeight: met ? 600 : 400 }}
    >
      {label}
    </span>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PASSENGER" | "DRIVER">("PASSENGER");
  
  // Specific vehicle registration parameters
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password rules validation logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':",./\<>?]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please satisfy all password security requirements before signing up.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        brand: role === "DRIVER" ? brand : undefined,
        model: role === "DRIVER" ? model : undefined,
        year: role === "DRIVER" ? year : undefined,
        color: role === "DRIVER" ? color : undefined,
        plateNumber: role === "DRIVER" ? plateNumber : undefined,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
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
          className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #22C55E, transparent)", animation: "blob-drift 9s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #06B6D4, transparent)", animation: "blob-drift 11s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-2/3 right-1/3 w-44 h-44 rounded-full blur-3xl opacity-6"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)", animation: "blob-drift 13s ease-in-out infinite", animationDelay: "4s" }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
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
            <img
              src="/logo.png"
              alt="Pooler Logo"
              className="h-16 w-auto rounded-2xl mb-5 object-contain"
              style={{
                boxShadow: "0 0 20px rgba(34,197,94,0.15)",
              }}
            />
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
              {t("Create your account")}
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#64748B" }}>
              {t("Join Pooler and start saving today")}
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
              <span>{t("Account created! Redirecting to login...")}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                {t("Full Name")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Dominic Toretto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark"
                  style={{ paddingLeft: "44px" }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                {t("Email Address")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
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
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                {t("Password")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
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

              {/* Password checklist */}
              <div
                className="mt-2 p-3 rounded-xl"
                style={{
                  background: "rgba(15,23,42,0.4)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-xs font-semibold mb-2 block" style={{ color: "#64748B" }}>
                  {t("Security Requirements:")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <PasswordRule met={hasMinLength} label="8+ characters" />
                  <PasswordRule met={hasUppercase} label="Uppercase letter" />
                  <PasswordRule met={hasNumber} label="At least 1 number" />
                  <PasswordRule met={hasSpecialChar} label="Special symbol" />
                </div>
              </div>
            </div>

            {/* Role Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                {t("I want to join as a")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([("PASSENGER" as const), ("DRIVER" as const)]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    style={
                      role === r
                        ? {
                            background: "rgba(34,197,94,0.12)",
                            border: "1px solid rgba(34,197,94,0.4)",
                            color: "#4ADE80",
                            boxShadow: "0 0 15px rgba(34,197,94,0.15)",
                          }
                        : {
                            background: "rgba(15,23,42,0.4)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#475569",
                          }
                    }
                  >
                    {r === "PASSENGER" ? (
                      <UserRound className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Car className="h-4 w-4" strokeWidth={2} />
                    )}
                    {r === "PASSENGER" ? "Passenger" : "Driver"}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Driver Details */}
            {role === "DRIVER" && (
              <div className="flex flex-col gap-4 animate-slideDown">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      {t("Car Brand")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Honda"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      {t("Car Model")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Civic"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      {t("Year")}
                    </label>
                    <input
                      type="number"
                      required
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      placeholder="2021"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      {t("Color")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="White"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                      {t("Plate No.")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ABC-1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>
                <span className="text-[11px]" style={{ color: "#64748B" }}>
                  {t("Verified vehicle details build trust and ensure safety for all passengers.")}
                </span>
              </div>
            )}

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
                  <span>{t("Creating Account...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Sign Up")}</span>
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
                <span className="px-3 font-medium" style={{ background: "rgba(30,41,59,0.65)", color: "#475569" }}>
                  {t("Or continue with")}
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
              <span>{t("Continue with Google")}</span>
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: "#475569" }}>
            {t("Already have an account?")}{" "}
            <Link
              href="/login"
              className="font-semibold transition-all"
              style={{ color: "#22C55E" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4ADE80"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; }}
            >
              {t("Sign In")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

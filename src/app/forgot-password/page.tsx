"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck, KeyRound, Check, X, FlaskConical } from "lucide-react";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";

const PasswordRule = ({ met, label }: { met: boolean; label: string }) => (
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = simulated code / reset form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password rules validation logic
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':",./\<>?]/.test(newPassword);

  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Email verification failed.");
      }

      setStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during verification.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please ensure your password meets all complexity rules.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again.";
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
          className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: "radial-gradient(circle, #22C55E, transparent)", animation: "blob-drift 9s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full blur-3xl opacity-6"
          style={{ background: "radial-gradient(circle, #3B82F6, transparent)", animation: "blob-drift 12s ease-in-out infinite reverse" }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <div
          className="w-full max-w-md animate-scaleIn"
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
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="p-3.5 rounded-2xl mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(34,197,94,0.1))",
                border: "1px solid rgba(245,158,11,0.25)",
                boxShadow: "0 0 20px rgba(245,158,11,0.1)",
              }}
            >
              <KeyRound className="h-8 w-8" style={{ color: "#F59E0B" }} strokeWidth={2} />
            </div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
            >
              {step === 1 ? "Forgot Password?" : "Reset Password"}
            </h1>
            <p className="text-sm mt-1.5 max-w-xs" style={{ color: "#64748B" }}>
              {step === 1
                ? "Enter your email to start the password reset process."
                : "Secure your account with a strong new password."}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={
                    step >= s
                      ? { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ADE80" }
                      : { background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)", color: "#475569" }
                  }
                >
                  {s}
                </div>
                {s === 1 && (
                  <div className="w-12 h-px" style={{ background: step >= 2 ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.06)" }} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm animate-fadeIn"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#FB7185" }}
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div
              className="flex flex-col items-center text-center gap-4 p-6 rounded-xl mb-5 animate-scaleIn"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <ShieldCheck className="h-10 w-10" style={{ color: "#4ADE80" }} />
              <div>
                <p className="font-bold text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
                  {t("Password Reset Successfully!")}
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                  {t("You can now sign in using your new password.")}
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-2.5 font-bold text-sm rounded-xl text-center transition-all"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                  textDecoration: "none",
                }}
              >
                {t("Go to Sign In")}
              </Link>
            </div>
          )}

          {/* Step 1: Email */}
          {!success && step === 1 && (
            <form onSubmit={handleSendResetLink} className="flex flex-col gap-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer mt-1"
                style={{
                  background: loading ? "rgba(34,197,94,0.4)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: loading ? "none" : "0 6px 20px rgba(34,197,94,0.4)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 1s linear infinite" }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>{t("Verify and Reset")}</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: New Password */}
          {!success && step === 2 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div
                className="p-3.5 rounded-xl text-xs leading-relaxed"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#94A3B8" }}
              >
              <div className="flex items-start gap-2">
                <FlaskConical className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#F59E0B" }} strokeWidth={2} />
                <span><strong style={{ color: "#F59E0B" }}>{t("Testing Sandbox:")}</strong> {t("Token verification simulated. Set your new password below.")}</span>
              </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("New Password")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-dark"
                    style={{ paddingLeft: "44px" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                  {t("Confirm New Password")}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5" style={{ color: "#475569" }}>
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-dark"
                    style={{ paddingLeft: "44px" }}
                  />
                </div>
              </div>

              {/* Password checklist */}
              <div
                className="p-3 rounded-xl"
                style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
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

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-xl transition-all cursor-pointer mt-1"
                style={{
                  background: loading || !isPasswordValid ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: loading || !isPasswordValid ? "none" : "0 6px 20px rgba(34,197,94,0.4)",
                  opacity: loading || !isPasswordValid ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 1s linear infinite" }} />
                    Resetting...
                  </>
                ) : (
                  <>
                    <span>{t("Commit New Password")}</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="flex justify-center mt-7">
              <Link
                href="/login"
                className="text-sm font-semibold transition-all"
                style={{ color: "#22C55E" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4ADE80"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#22C55E"; }}
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

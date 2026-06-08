"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  MapPin,
  Navigation,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { pusherClient } from "@/lib/pusher";
import { t } from "@/lib/i18n";

interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface Message {
  id: string;
  rideId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
  driver: { id: string; name: string; email: string; rating: number; vehicleDetails: string | null };
  vehicle?: { id: string; color: string; brand: string; model: string; plateNumber: string } | null;
}

export default function ChatRoomPage() {
  const { id: rideId } = useParams();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [ride, setRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "fallback">("connecting");

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Safeguard: Redirect if not authenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") { router.push("/login"); }
  }, [authStatus, router]);

  // Fetch ride details and initial message history
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const rideRes = await fetch(`/api/rides/${rideId}`);
      if (!rideRes.ok) {
        throw new Error(rideRes.status === 404 ? "This ride pool does not exist or has been deleted." : "Failed to load ride pool details.");
      }
      const rideData = await rideRes.json();
      setRide(rideData);

      const chatRes = await fetch(`/api/chat/${rideId}`);
      if (!chatRes.ok) {
        throw new Error(chatRes.status === 403 ? "You are not an approved member of this ride pool chat." : "Failed to retrieve chat history.");
      }
      const chatData = await chatRes.json();
      setMessages(chatData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId && authStatus === "authenticated") {
      const init = async () => {
        await Promise.resolve();
        fetchInitialData();
      };
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rideId, authStatus]);

  const scrollToBottom = () => { messageEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Pusher subscription & Polling fallback
  useEffect(() => {
    if (!rideId || authStatus !== "authenticated" || errorMsg) return;

    let isPusherConnected = false;
    const channelName = `chat-${rideId}`;
    const channel = pusherClient.subscribe(channelName);
    Promise.resolve().then(() => {
      setConnectionStatus("connecting");
    });

    channel.bind("new-message", (newMessage: Message) => {
      setConnectionStatus("connected");
      isPusherConnected = true;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    const pollingInterval = setInterval(async () => {
      if (!isPusherConnected || pusherClient.connection.state !== "connected") {
        setConnectionStatus("fallback");
        try {
          const res = await fetch(`/api/chat/${rideId}`);
          if (res.ok) {
            const latestMessages = await res.json();
            setMessages((prev) => {
              if (latestMessages.length === prev.length) return prev;
              return latestMessages;
            });
          }
        } catch (pollErr) {
          console.warn("Polling fallback message synchronization failed:", pollErr);
        }
      }
    }, 4000);

    const handleStateChange = (state: { current: string }) => {
      if (state.current === "connected") { setConnectionStatus("connected"); isPusherConnected = true; }
      else if (state.current === "failed" || state.current === "disconnected") { setConnectionStatus("fallback"); }
    };

    pusherClient.connection.bind("state_change", handleStateChange);
    if (pusherClient.connection.state === "connected") {
      Promise.resolve().then(() => {
        setConnectionStatus("connected");
      });
      isPusherConnected = true;
    }

    return () => {
      pusherClient.unsubscribe(channelName);
      pusherClient.connection.unbind("state_change", handleStateChange);
      clearInterval(pollingInterval);
    };
  }, [rideId, authStatus, errorMsg]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageContent = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to transmit message.");
      }

      const sentMsg = await res.json();
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
    } catch (err) {
      console.error(err);
      setInputText(messageContent);
      const message = err instanceof Error ? err.message : "Could not deliver your message. Please try again.";
      alert(message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-12 w-12 rounded-full border-2"
              style={{ borderTopColor: "#22C55E", borderRightColor: "#06B6D4", borderColor: "transparent", animation: "spin 1s linear infinite" }}
            />
            <p className="text-sm font-semibold" style={{ color: "#64748B" }}>{t("Opening secure ride pool chat room...")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg || !ride) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md text-center flex flex-col items-center gap-5 p-10 animate-scaleIn"
            style={{ background: "rgba(30,41,59,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}
          >
            <div className="p-4 rounded-2xl" style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
              <AlertCircle className="h-8 w-8" style={{ color: "#FB7185" }} />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
              {t("Access Denied")}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{errorMsg || "You are not authorized to view this page."}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 w-full py-3 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentUser = session?.user as CustomUser;
  const isDriver = ride.driver.id === currentUser?.id;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-4 flex flex-col lg:flex-row gap-4 overflow-hidden">

        {/* Left: Ride Info Sidebar */}
        <div
          className="w-full lg:w-72 shrink-0 flex flex-col gap-4 max-h-[200px] lg:max-h-none overflow-y-auto"
          style={{
            background: "rgba(30,41,59,0.65)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F8FAFC"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <span
              className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest"
              style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#22D3EE" }}
            >
              {ride.status}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#475569" }}>{t("Start Point")}</span>
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                <span className="text-xs font-semibold line-clamp-2" style={{ color: "#CBD5E1" }}>{ride.startLocation}</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#475569" }}>{t("Destination")}</span>
              <div className="flex items-start gap-1.5">
                <Navigation className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#06B6D4" }} />
                <span className="text-xs font-semibold line-clamp-2" style={{ color: "#CBD5E1" }}>{ride.endLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2" style={{ color: "#64748B" }}>
              <Calendar className="h-3.5 w-3.5" style={{ color: "#3B82F6" }} />
              <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "#64748B" }}>
              <Clock className="h-3.5 w-3.5" style={{ color: "#3B82F6" }} />
              <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-[10px] uppercase font-semibold" style={{ color: "#475569" }}>{t("Contribution")}</span>
              <span className="font-bold text-sm" style={{ color: "#22C55E" }}>Rs. {ride.pricePerSeat}/seat</span>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div
              className="h-9 w-9 flex items-center justify-center font-black text-sm rounded-xl shrink-0"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ADE80", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {ride.driver.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "#F8FAFC" }}>
                {isDriver ? "You (Driver)" : `Driver: ${ride.driver.name}`}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#475569" }}>
                {ride.vehicle ? `${ride.vehicle.color} ${ride.vehicle.brand} ${ride.vehicle.model}` : (ride.driver.vehicleDetails || "Verified Vehicle")}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Chat Window */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: "rgba(30,41,59,0.5)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
          }}
        >
          {/* Chat Header */}
          <div
            className="px-5 py-3.5 flex items-center justify-between shrink-0"
            style={{ background: "rgba(15,23,42,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <MessageSquare className="h-4 w-4" style={{ color: "#22C55E" }} />
              </div>
              <div>
                <h2
                  className="text-sm font-black tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}
                >
                  {t("Pool Coordination Room")}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {connectionStatus === "connected" ? (
                    <>
                      <span className="h-2 w-2 rounded-full" style={{ background: "#22C55E", boxShadow: "0 0 6px #22C55E", animation: "glow-pulse 2s ease-in-out infinite" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#4ADE80" }}>{t("Sync Active")}</span>
                    </>
                  ) : connectionStatus === "connecting" ? (
                    <>
                      <span className="h-2 w-2 rounded-full" style={{ background: "#F59E0B", animation: "glow-pulse 2s ease-in-out infinite" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#F59E0B" }}>{t("Connecting...")}</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full" style={{ background: "#F59E0B", animation: "glow-pulse 2s ease-in-out infinite" }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#F59E0B" }}>{t("Polling Live")}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={fetchInitialData}
              title="Refresh messages"
              className="p-2 rounded-lg transition-all cursor-pointer"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#F8FAFC"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#475569"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Info Notice */}
          <div
            className="px-5 py-2.5 flex items-center gap-2 text-[11px] shrink-0"
            style={{ background: "rgba(6,182,212,0.05)", borderBottom: "1px solid rgba(6,182,212,0.08)", color: "#22D3EE" }}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{t("Private secure channel between verified driver and approved passengers.")}</span>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 px-5 py-5 overflow-y-auto space-y-4"
            style={{ background: "rgba(8,15,30,0.3)" }}
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
                <div
                  className="p-5 rounded-2xl animate-float"
                  style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.12)" }}
                >
                  <MessageSquare className="h-8 w-8" style={{ color: "#22C55E" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F8FAFC" }}>
                    {t("No Messages Yet")}
                  </h3>
                  <p className="text-xs mt-1 max-w-xs leading-relaxed" style={{ color: "#475569" }}>
                    {t("Start the conversation! Coordinate pickup landmarks, luggage sizes, and arrival timings here.")}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2.5 ${isOwnMessage ? "justify-end" : "justify-start"} animate-fadeIn`}
                  >
                    {!isOwnMessage && (
                      <div
                        className="h-8 w-8 flex items-center justify-center font-bold text-xs rounded-xl shrink-0 mt-0.5"
                        style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.2)", color: "#94A3B8" }}
                      >
                        {message.sender.name[0]}
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                      {!isOwnMessage && (
                        <span className="text-[10px] font-bold ml-1 mb-0.5" style={{ color: "#64748B" }}>
                          {message.sender.name}
                        </span>
                      )}
                      <div
                        className="px-4 py-2.5 text-xs leading-relaxed"
                        style={
                          isOwnMessage
                            ? {
                                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                                color: "#fff",
                                borderRadius: "14px 14px 2px 14px",
                                boxShadow: "0 2px 10px rgba(34,197,94,0.25)",
                              }
                            : {
                                background: "rgba(30,41,59,0.8)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#CBD5E1",
                                borderRadius: "14px 14px 14px 2px",
                              }
                        }
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <span className="text-[9px] mt-1 px-1" style={{ color: "#334155" }}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {isOwnMessage && (
                      <div
                        className="h-8 w-8 flex items-center justify-center font-black text-xs rounded-xl shrink-0 mt-0.5"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ADE80", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {currentUser?.name ? currentUser.name[0] : "Y"}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 flex items-center gap-3 shrink-0"
            style={{ background: "rgba(15,23,42,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Coordinate pickup landmarks, snacks, music..."
              disabled={sending}
              className="flex-1 text-xs px-4 py-2.5 rounded-xl outline-none transition-all"
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F8FAFC",
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#22C55E"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all"
              style={{
                background: !inputText.trim() || sending ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff",
                boxShadow: !inputText.trim() || sending ? "none" : "0 4px 14px rgba(34,197,94,0.35)",
                opacity: !inputText.trim() || sending ? 0.5 : 1,
              }}
            >
              {sending ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Send className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

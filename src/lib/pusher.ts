import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server instance (with fallback mock so it never crashes if env is missing)
const getPusherServer = () => {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.PUSHER_KEY ||
    !process.env.PUSHER_SECRET
  ) {
    console.warn("Pusher environment variables are missing. Real-time updates will run in mock mode.");
    return {
      trigger: async (channel: string, event: string, data: unknown) => {
        console.log(`[Mock Pusher Trigger] Channel: ${channel}, Event: ${event}`, data);
        return { status: 200 };
      }
    } as unknown as PusherServer;
  }

  const PusherServerClass = ((PusherServer as unknown as Record<string, unknown>).default ?? PusherServer) as {
    new (options: unknown): PusherServer;
  };
  return new PusherServerClass({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || "ap2",
    useTLS: true
  });
};

export const pusherServer = getPusherServer();

// Client instance
const getPusherClient = () => {
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy_pusher_key";
  const PusherClientClass = ((PusherClient as unknown as Record<string, unknown>).Pusher ?? (PusherClient as unknown as Record<string, unknown>).default ?? PusherClient) as {
    new (key: string, options: unknown): PusherClient;
  };
  return new PusherClientClass(pusherKey, {
    cluster: process.env.PUSHER_CLUSTER || "ap2"
  });
};

export const pusherClient = getPusherClient();

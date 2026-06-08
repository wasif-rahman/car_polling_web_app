import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Next.js 15+ passes dynamic parameters (params) as a Promise.
// We wrap the handler to await context.params before forwarding the request.
const wrappedHandler = async (req: any, context: any) => {
  if (context && context.params instanceof Promise) {
    context.params = await context.params;
  } else if (context && context.params && typeof context.params.then === "function") {
    context.params = await context.params;
  }
  return handler(req, context);
};

export { wrappedHandler as GET, wrappedHandler as POST };

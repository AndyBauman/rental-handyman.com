import { next } from "@vercel/functions";

/** Protect /admin at the edge. Set ADMIN_BASIC_USER + ADMIN_BASIC_PASSWORD in Vercel → Settings → Environment Variables. */
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export default function middleware(request) {
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASSWORD;

  if (!user || !pass) {
    return new Response("Not Found", { status: 404 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
      },
    });
  }

  let decoded;
  try {
    decoded = atob(authHeader.slice(6));
  } catch {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
      },
    });
  }

  const sep = decoded.indexOf(":");
  const u = sep >= 0 ? decoded.slice(0, sep) : "";
  const p = sep >= 0 ? decoded.slice(sep + 1) : "";

  if (u !== user || p !== pass) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
      },
    });
  }

  return next();
}

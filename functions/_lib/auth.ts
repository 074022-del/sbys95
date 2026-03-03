import { bad } from "./json";

function enc(s: string) {
  return new TextEncoder().encode(s);
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc(data));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
}

export async function makeSession(secret: string) {
  const ts = Date.now().toString();
  const sig = await hmac(secret, ts);
  return `${ts}.${sig}`;
}

export async function verifySession(secret: string, token: string | null) {
  if (!token) return false;
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return false;

  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age > 7 * 24 * 60 * 60 * 1000) return false;

  const expected = await hmac(secret, ts);
  return expected === sig;
}

export async function requireAdmin(ctx: any) {
  const secret = ctx.env.SESSION_SECRET as string;
  const cookie = ctx.request.headers.get("cookie") || "";
  const m = cookie.match(/sbys_session=([^;]+)/);
  const ok = await verifySession(secret, m?.[1] || null);
  if (!ok) return bad("unauthorized", 401);
  return null;
}

import { json, bad } from "../_lib/json";
import { makeSession } from "../_lib/auth";

export async function onRequestPost(ctx: any) {
  const { password } = await ctx.request.json().catch(() => ({}));
  if (!password) return bad("password required");

  if (password !== ctx.env.ADMIN_PASSWORD) return bad("wrong password", 401);

  const token = await makeSession(ctx.env.SESSION_SECRET);

  const headers = new Headers();
  headers.append(
    "set-cookie",
    `sbys_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
  );

  return json({ ok: true }, { headers });
}

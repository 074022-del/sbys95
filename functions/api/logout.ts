import { json } from "../_lib/json";

export async function onRequestPost() {
  const headers = new Headers();
  headers.append(
    "set-cookie",
    "sbys_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
  );
  return json({ ok: true }, { headers });
}

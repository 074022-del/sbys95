export function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function bad(msg: string, code = 400) {
  return json({ ok: false, error: msg }, { status: code });
}

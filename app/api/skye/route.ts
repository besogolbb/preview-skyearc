import { getPreview } from "@/lib/preview";

/**
 * "Skye" chat -> n8n Chat Trigger (POST { action, sessionId, chatInput }).
 * Webhook: preview.embeds.skyeWebhookUrl, else env SKYE_CHAT_WEBHOOK_URL.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").slice(0, 80);
  const sessionId = String(body.sessionId ?? "").slice(0, 80);
  const message = String(body.message ?? "").trim().slice(0, 1500);
  if (!sessionId || !message) return Response.json({ error: "invalid" }, { status: 422 });

  const preview = await getPreview(slug);
  if (!preview) return Response.json({ error: "unknown_preview" }, { status: 404 });

  const hook = preview.embeds.skyeWebhookUrl || process.env.SKYE_CHAT_WEBHOOK_URL;
  if (!hook) return Response.json({ error: "not_configured" }, { status: 501 });

  const res = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "sendMessage",
      sessionId: `${preview.slug}:${sessionId}`,
      chatInput: message,
      metadata: {
        slug: preview.slug,
        company: preview.company.name,
        trade: preview.company.trade,
        city: preview.company.city,
        market: preview.market,
        phone: preview.company.phone ?? null,
      },
    }),
    signal: AbortSignal.timeout(30_000),
  }).catch(() => null);

  if (!res || !res.ok) return Response.json({ error: "upstream" }, { status: 502 });

  const text = await res.text();
  let output = text;
  try {
    const j = JSON.parse(text);
    const first = Array.isArray(j) ? j[0] : j;
    output = first?.output ?? first?.text ?? first?.message ?? text;
  } catch {
    /* plain-text reply */
  }
  return Response.json({ output: String(output).slice(0, 4000) });
}

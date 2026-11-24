import { getPreview } from "@/lib/preview";

/**
 * Hero quick-quote form -> GHL inbound webhook.
 * Webhook: preview.embeds.quickQuoteWebhookUrl, else env GHL_QUICK_QUOTE_WEBHOOK_URL.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const str = (k: string, max = 120) => String(body[k] ?? "").trim().slice(0, max);
  const slug = str("slug", 80);
  const name = str("name");
  const phone = str("phone", 40);
  const postcode = str("postcode", 60);
  const jobType = str("jobType");

  if (name.length < 2 || phone.replace(/\D/g, "").length < 8 || postcode.length < 3 || !jobType) {
    return Response.json({ error: "invalid" }, { status: 422 });
  }

  const preview = await getPreview(slug);
  if (!preview) return Response.json({ error: "unknown_preview" }, { status: 404 });

  const hook = preview.embeds.quickQuoteWebhookUrl || process.env.GHL_QUICK_QUOTE_WEBHOOK_URL;
  if (!hook) return Response.json({ error: "not_configured" }, { status: 501 });

  const [first, ...rest] = name.split(/\s+/);
  const res = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      full_name: name,
      first_name: first,
      last_name: rest.join(" "),
      phone,
      [preview.market === "AU" ? "city" : "postal_code"]: postcode,
      job_type: jobType,
      source: "skyearc-concept-preview",
      preview_slug: preview.slug,
      company: preview.company.name,
      market: preview.market,
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!res || !res.ok) return Response.json({ error: "upstream" }, { status: 502 });
  return Response.json({ ok: true });
}

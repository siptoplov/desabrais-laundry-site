import { NextResponse } from "next/server";

type Lead = { name?: unknown; contact?: unknown; message?: unknown; company?: unknown };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // honeypot: bots fill hidden fields — pretend success
  if (clean(body.company, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  const contact = clean(body.contact, 120);
  const message = clean(body.message, 4000);
  if (name.length < 2 || contact.length < 5 || message.length < 5) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    const text = `Новая заявка VORQEN\n\nИмя: ${name}\nКонтакт: ${contact}\n\n${message}`;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: "delivery" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

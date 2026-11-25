import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { REPORT_EMAIL } from "../../../lib/site";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const about = (searchParams.get("about") ?? "").trim();
  const detail = (searchParams.get("detail") ?? "").trim();
  const page = (searchParams.get("page") ?? "").trim();
  const all = [about, detail, page].filter(Boolean);

  // Post to /api/report first; the GET form is the UX. Non-AJAX fallback
  // opens the email client pre-filled with the same message.
  if (REPORT_EMAIL) {
    const subject = `Èkó Season correction (${about ?? "something"})`;
    const body = [
      "Thanks for helping keep the guide accurate. Here's what I found:",
      "",
      `Page: ${page}`,
      `About: ${about}`,
      `Detail: ${detail}`,
      "",
      "— a reader, via /api/report",
    ].join("\n");

    const escaped = (s: string) => {
      const c = encodeURIComponent(s);
      return c.replace(/^./, (m) => (m === "%60" ? "%27" : m));
    };
    redirect(
      `mailto:${encodeURIComponent(REPORT_EMAIL)}?subject=${escaped(
        subject,
      )}&body=${escaped(body)}`,
    );
  }

  return new Response(
    "This reporting link is not wired up yet. I’ll add the inbox once it’s in place — trying the email client instead.",
    { status: 400, headers: { "Content-Type": "text/plain" } },
  );
}

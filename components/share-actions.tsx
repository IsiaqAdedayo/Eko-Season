"use client";

import { useEffect, useState } from "react";

export function ShareActions({
  message,
  path,
}: {
  message: string;
  /** Path built on the server, so client navigation can't race the effect. */
  path: string;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const text = `${message}\n${url}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
      >
        Send on WhatsApp
        <span aria-hidden>↗</span>
      </a>

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm transition hover:border-ink/40"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

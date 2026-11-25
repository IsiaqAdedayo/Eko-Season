"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MAX_PICKS,
  SHORTLIST_EVENT,
  SHORTLIST_KEY,
  isPick,
  samePick,
  shortlistHref,
  type Pick,
  type PickKind,
} from "../lib/shortlist";

function read(): Pick[] {
  try {
    const raw = window.localStorage.getItem(SHORTLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isPick).slice(0, MAX_PICKS) : [];
  } catch {
    return [];
  }
}

function write(items: Pick[]) {
  try {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(items));
  } catch {
    // Storage can be blocked (private mode, quota); the bar just stays empty.
  }
  window.dispatchEvent(new Event(SHORTLIST_EVENT));
}

export function useShortlist() {
  const [items, setItems] = useState<Pick[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    setReady(true);
    window.addEventListener(SHORTLIST_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback(
    (kind: PickKind, id: string) =>
      items.some((item) => item.kind === kind && item.id === id),
    [items],
  );

  const toggle = useCallback((pick: Pick) => {
    const current = read();
    const exists = current.some((item) => samePick(item, pick));
    write(
      exists
        ? current.filter((item) => !samePick(item, pick))
        : [...current, pick].slice(0, MAX_PICKS),
    );
  }, []);

  return { items, ready, has, toggle };
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ButtonProps = {
  kind: PickKind;
  id: string;
  name: string;
  variant?: "icon" | "pill";
  tone?: "light" | "dark";
  className?: string;
};

export function ShortlistButton({
  kind,
  id,
  name,
  variant = "icon",
  tone = "light",
  className = "",
}: ButtonProps) {
  const { has, toggle } = useShortlist();
  const saved = has(kind, id);
  const label = saved ? `Remove ${name} from your list` : `Add ${name} to your list`;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => toggle({ kind, id })}
        aria-pressed={saved}
        aria-label={label}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-medium transition ${
          saved
            ? tone === "dark"
              ? "border-transparent bg-gold text-ink"
              : "border-transparent bg-ink text-cream"
            : tone === "dark"
              ? "border-cream/25 text-cream hover:border-cream/60"
              : "border-ink/15 text-ink/75 hover:border-ink/40"
        } ${className}`}
      >
        {saved ? <CheckIcon /> : <PlusIcon />}
        {saved ? "Saved to list" : "Save to list"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle({ kind, id })}
      aria-pressed={saved}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
        saved
          ? tone === "dark"
            ? "border-transparent bg-gold text-ink"
            : "border-transparent bg-ink text-cream"
          : "border-ink/10 bg-cream/90 text-ink/70 hover:bg-cream"
      } ${className}`}
    >
      {saved ? <CheckIcon /> : <PlusIcon />}
    </button>
  );
}

export function ShortlistBar() {
  const { items, ready } = useShortlist();
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // The home hero has its own bottom bar; only show ours once it's gone.
      const threshold = pathname === "/" ? window.innerHeight * 0.9 : 160;
      setPastHero(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  if (!ready || items.length === 0 || pathname === "/list" || !pastHero) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:pr-6">
      <Link
        href={shortlistHref(items)}
        className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2.5 pl-2.5 pr-5 text-cream shadow-[0_20px_40px_-20px_rgba(23,16,11,0.6)] transition hover:bg-ember"
      >
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-ink">
          {items.length}
        </span>
        <span className="text-sm font-medium">Review &amp; share</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

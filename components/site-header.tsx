"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../lib/site";

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m16.5 16.5 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A route change unmounts the panel; Escape closes it without navigating.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Growing past the mobile breakpoint hides the panel, so clear the state too —
  // otherwise the bar stays solid with nothing open.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 640px)");
    const onChange = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // The open panel sits on a cream background, so the bar has to be solid too.
  const solidBar = solid || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solidBar
          ? "bg-cream/95 text-ink shadow-[0_1px_0_rgba(23,16,11,0.08)] backdrop-blur-md"
          : "bg-gradient-to-b from-ink/55 via-ink/20 to-transparent text-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4 sm:px-10">
        <Link href="/#top" className="flex items-baseline gap-2">
          <span className="font-display text-xl leading-none tracking-tight">
            Èkó Season
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.25em] opacity-60 sm:inline">
            Detty &rsquo;26
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-7 text-xs sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`transition ${
                isActive(link.href)
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Link
            href="/search"
            aria-label="Search the guide"
            className={`flex h-9 items-center gap-2 rounded-full border px-3 text-xs transition ${
              solidBar
                ? "border-ink/15 hover:border-ink/40"
                : "border-white/30 hover:border-white/70"
            }`}
          >
            <SearchIcon />
            <span className="hidden sm:inline">Search</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition sm:hidden ${
              solidBar
                ? "border-ink/15 hover:border-ink/40"
                : "border-white/30 hover:border-white/70"
            }`}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-ink/10 bg-cream/95 px-6 pb-4 text-ink backdrop-blur-md sm:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`flex items-center justify-between border-b border-ink/10 py-3 text-sm last:border-0 ${
                isActive(link.href) ? "text-ember" : "text-ink/80"
              }`}
            >
              {link.label}
              <span aria-hidden className="text-ink/30">
                →
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

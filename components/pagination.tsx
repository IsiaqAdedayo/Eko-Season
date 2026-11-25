"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  page: number;
  pageCount: number;
  /** Link mode: URL template, `{page}` swapped for the number. A string
   * because a function can't cross the server → client boundary. */
  pageHref?: string;
  /** Where page 1 lives when it isn't `?page=1` — usually the bare path. */
  firstPageHref?: string;
  /** Button mode: switch page in place (client-filtered lists). */
  onPage?: (page: number) => void;
  tone?: "light" | "dark";
};

/**
 * Page switcher for the long lists. Renders links when the list is server
 * rendered, buttons when the list is filtered in the browser — same look
 * either way.
 */
export function Pagination({
  page,
  pageCount,
  pageHref,
  firstPageHref,
  onPage,
  tone = "light",
}: Props) {
  if (pageCount <= 1) return null;

  const idle =
    tone === "dark"
      ? "border-cream/20 text-cream/65 hover:border-cream/50 hover:text-cream"
      : "border-ink/15 text-ink/65 hover:border-ink/40 hover:text-ink";
  const active =
    tone === "dark"
      ? "border-gold bg-gold text-ink"
      : "border-ink bg-ink text-cream";

  const item = (target: number, label: ReactNode, ariaLabel: string) => {
    const className = `flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-xs transition ${
      target === page ? active : idle
    }`;
    const current = target === page ? ("page" as const) : undefined;

    return pageHref ? (
      <Link
        key={ariaLabel}
        href={
          target === 1 && firstPageHref
            ? firstPageHref
            : pageHref.replace("{page}", String(target))
        }
        aria-label={ariaLabel}
        aria-current={current}
        className={className}
      >
        {label}
      </Link>
    ) : (
      <button
        key={ariaLabel}
        type="button"
        onClick={() => onPage?.(target)}
        aria-label={ariaLabel}
        aria-current={current}
        className={className}
      >
        {label}
      </button>
    );
  };

  return (
    <nav aria-label="Pages" className="mt-8 flex items-center gap-2">
      {page > 1 && item(page - 1, "←", "Previous page")}
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
        item(n, n, `Page ${n}`),
      )}
      {page < pageCount && item(page + 1, "→", "Next page")}
    </nav>
  );
}

"use client";

import Link from "next/link";

/**
 * A failed render should look like the guide having a bad night, not a blank
 * screen. `reset` retries the segment without a full reload.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-20 text-center text-ink">
      <p className="text-xs uppercase tracking-[0.3em] text-ember">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
        This page did not load
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        The guide is still there. Try again, or go back to the home page — if it
        keeps failing, the listings themselves are unaffected.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ember"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-ink/15 px-5 py-3 text-sm transition hover:border-ink/40"
        >
          Back to the guide
        </Link>
      </div>
    </main>
  );
}

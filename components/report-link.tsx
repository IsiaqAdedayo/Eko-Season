import Link from "next/link";

export function ReportLink({ page, about }: { page: string; about?: string }) {
  return (
    <Link
      href={`/api/report?page=${encodeURIComponent(page)}&about=${encodeURIComponent(
        about ?? "something",
      )}`}
      className="text-[11px] leading-none underline decoration-dash decoration-ink/25 underline-offset-2 hover:decoration-current"
    >
      Something wrong here?
    </Link>
  );
}

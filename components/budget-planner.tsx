"use client";

import { useState } from "react";
import type { ShowEvent } from "../lib/shows";

/**
 * A night-out budget that is honest about being arithmetic.
 *
 * The ticket figure comes from the listing; everything else is a number the
 * reader sets. That keeps it useful without pretending to know what a club
 * charges on 19 December.
 */

/** Local on purpose: importing lib/shows would pull every listing into the browser bundle. */
const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

type Props = {
  shows: Pick<ShowEvent, "id" | "title" | "priceFrom">[];
};

function AmountField({
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  step = 500,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(
            Math.min(max, Math.max(min, Math.round(Number(event.target.value) || min))),
          )
        }
        className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm"
      />
    </label>
  );
}

export function BudgetPlanner({ shows }: Props) {
  const [showId, setShowId] = useState(
    shows.find((show) => show.priceFrom != null)?.id ?? "",
  );
  const [people, setPeople] = useState(2);
  const [drinks, setDrinks] = useState(5000);
  const [food, setFood] = useState(8000);
  const [transport, setTransport] = useState(7000);

  const ticket = shows.find((show) => show.id === showId)?.priceFrom ?? 0;
  const total = (ticket + drinks + food + transport) * people;

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/60 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ember">
            Budget
          </p>
          <h2 className="mt-1 font-display text-2xl">What tonight costs</h2>
        </div>
        <p className="flex flex-col items-start sm:items-end">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Total for {people}
          </span>
          <span className="mt-0.5 font-display text-2xl leading-none sm:text-3xl">
            {naira(total)}
          </span>
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Show
          </span>
          <select
            value={showId}
            onChange={(event) => setShowId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm"
          >
            <option value="">No show — just the night out</option>
            {shows.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>

        <AmountField
          label="People"
          value={people}
          onChange={setPeople}
          min={1}
          max={20}
          step={1}
        />
        <AmountField label="Drinks, per person" value={drinks} onChange={setDrinks} />
        <AmountField label="Food, per person" value={food} onChange={setFood} />
        <AmountField label="Ride there and back" value={transport} onChange={setTransport} />
      </div>

      <p className="mt-4 border-t border-ink/10 pt-3 text-[11px] leading-relaxed text-muted">
        Estimates only: the ticket is the listed &ldquo;from&rdquo; price,
        everything else is your own figure, and ride prices rise with demand.
      </p>
    </div>
  );
}

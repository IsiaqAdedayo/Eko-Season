import { sections } from "../data/sections";
import { modes, recipes } from "../data/transport";
import { FARES_CHECKED } from "../lib/site";

export function TransportSection() {
  return (
    <section id="getting-around" className="bg-sand px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ember">
              {sections.transport.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {sections.transport.title}
            </h2>
          </div>
          <div className="max-w-sm rounded-2xl border border-ember/25 bg-ember/5 px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ember">
              No longer operating
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
              <strong className="font-medium">Uber</strong> stopped operating in
              Nigeria on 2 September 2026, and its keke tier went with it. Bolt,
              inDrive and LagRide below are the replacements.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-2xl sm:text-3xl">
            Journey recipes
          </h3>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            The three trips visitors actually make
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="flex flex-col rounded-2xl border border-ink/10 bg-cream/70 p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-ember">
                {recipe.from} → {recipe.to}
              </p>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-display text-2xl leading-tight">
                  {recipe.total}
                </p>
                <span className="rounded-full border border-ink/15 px-3 py-1 text-[11px] text-muted">
                  {recipe.time}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/70">{recipe.summary}</p>

              <ol className="mt-5 space-y-4 border-t border-ink/10 pt-5">
                {recipe.steps.map((step, stepIndex) => (
                  <li key={step.mode} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink/15 text-[11px] tabular-nums text-muted">
                      {stepIndex + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-sm font-medium">{step.mode}</p>
                        <p className="text-[11px] text-ember">{step.cost}</p>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-5 border-t border-ink/10 pt-4 text-[11px] leading-relaxed text-muted">
                {recipe.warning}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.3em] text-ember">
          Every mode, one by one
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {modes.map((mode, index) => (
            <article
              key={mode.name}
              className="rounded-2xl border border-ink/10 bg-cream/70 p-6 transition hover:border-ink/25"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] tabular-nums text-ember">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-2xl leading-tight">
                    {mode.name}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {mode.local}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{mode.fare}</p>
                  <p className="mt-1 text-[11px] text-muted">{mode.pay}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink/80">{mode.how}</p>
              <p className="mt-3 border-t border-ink/10 pt-3 text-xs leading-relaxed text-muted">
                {mode.tip}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-[11px] text-muted">
          Fares and journey estimates last checked {FARES_CHECKED}. Street fares
          move with fuel, rain and traffic, and app quotes surge in both —
          confirm before you pay.
        </p>
      </div>
    </section>
  );
}

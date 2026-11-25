import Link from "next/link";
import { sections } from "../data/sections";
import { allDishes, type Dish } from "../lib/dishes";
import { getPlace } from "../lib/place";

const plates = allDishes.filter((dish) => dish.kind !== "snack");
const snacks = allDishes.filter((dish) => dish.kind === "snack");

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const place =
    dish.kind === "plate" && dish.place ? getPlace(dish.place) : undefined;

  // The card opens the dish's own page, where the venue and the recipe live.
  const href = `/eat/${dish.id}`;
  const where = place ? `Served at ${place.name}` : dish.kind === "snack" ? dish.where : null;
  const permitted = dish.imageCredit.license === "Used with permission";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-cream transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(23,16,11,0.45)]">
      {/* Stretched link: the photo and the copy are all one target. */}
      <Link
        href={href}
        aria-label={`${dish.name} — read about it`}
        className="absolute inset-0 z-10 rounded-2xl"
      />

      <div className="overflow-hidden">
        <img
          src={dish.image}
          alt={dish.imageAlt}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.25em] text-ember">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-2 line-clamp-2 font-display text-xl leading-tight transition group-hover:text-ember">
          {dish.name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/70">
          {dish.note}
        </p>

        <p className="mt-4 text-xs text-ember underline-offset-4 group-hover:underline">
          Read about it <span aria-hidden>→</span>
        </p>

        {where && (
          <p className="mt-1 line-clamp-1 text-[10px] leading-snug text-muted">
            {where}
          </p>
        )}

        <a
          href={dish.imageCredit.page}
          target="_blank"
          rel="noreferrer"
          className="relative z-20 mt-3 text-[10px] leading-snug text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {permitted
            ? `Recipe & photo: ${dish.imageCredit.author}`
            : `Photo: ${dish.imageCredit.author} / ${dish.imageCredit.license}`}
          <span aria-hidden> ↗</span>
        </a>
      </div>
    </article>
  );
}

export function Dishes() {
  return (
    <section id="eat" className="bg-sand/60 px-6 py-20 text-ink sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ember">
              {sections.dishes.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {sections.dishes.title}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Eight plates to plan a day around, and eight snacks Lagos eats
            standing up — with somewhere to have each one.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plates.map((dish, index) => (
            <DishCard key={dish.id} dish={dish} index={index} />
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-2xl sm:text-3xl">Snacks</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Between meals is when Lagos eats best. Puff-puff from the fryer,
            meat pie from the bakery shelf, chin chin in the glovebox.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {snacks.map((dish, index) => (
            <DishCard key={dish.id} dish={dish} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

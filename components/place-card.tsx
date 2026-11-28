import Link from "next/link";
import { imageSrcSet, imageUrl } from "../lib/media";
import type { Place } from "../lib/place";
import { ShortlistButton } from "./shortlist";

export function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white/60 transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_rgba(23,16,11,0.45)]">
      <Link
        href={`/places/${place.id}`}
        aria-label={`${place.name}, ${place.area}`}
        className="absolute inset-0 z-10 rounded-2xl"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <img
          src={imageUrl(place.gallery[0], 900)}
          srcSet={imageSrcSet(place.gallery[0])}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
          alt={
            place.illustrativePhoto
              ? `Illustrative photo — not ${place.name}`
              : place.name
          }
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-medium text-ink">
          {place.price}
        </span>

        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="text-[11px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-white/70">
            {place.area}
          </p>
          <h3 className="mt-1 line-clamp-1 font-display text-base sm:text-lg leading-snug">
            {place.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-[11px] sm:text-xs text-white/80">{place.tagline}</p>
        </div>
      </div>

      {/* An illustrative picture gets a badge, not a paragraph: the venue name
          should be the loudest thing on the card, and the explanation is long
          enough to bury it. The full note stays in the tooltip, for screen
          readers, and on the detail page. */}
      {place.illustrativePhoto ? (
        <p
          title={place.imageNote}
          className="mx-1 mt-2 w-fit rounded-full bg-ember/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ember"
        >
          Illustrative photo
          {place.imageNote ? (
            <span className="sr-only"> — {place.imageNote}</span>
          ) : null}
        </p>
      ) : place.imageNote ? (
        <p className="mx-1 mt-2 border-l-2 border-ember/40 pl-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ember/80">
          {place.imageNote}
        </p>
      ) : null}

      {/* Clamp a long note so one card cannot become much taller than its
          neighbours in the same row. Show more on wider viewports where
          the card can breathe. */}
      <p className="line-clamp-2 px-1 py-4 text-xs leading-relaxed text-muted sm:line-clamp-3">
        {place.note}
      </p>

      <ShortlistButton
        kind="place"
        id={place.id}
        name={place.name}
        className="absolute right-3 top-3 z-20"
      />
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { planBar, scenes } from "../data/hero";
import { FILTER_EVENT } from "../lib/filters";
import { imageSrcSet, imageUrl } from "../lib/media";
import { AREA_OPTIONS, CATEGORY_TABS } from "../lib/place";

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

function ArrowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Explore the guide"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-ember sm:h-14 sm:w-14"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Hero({ seasonLabel }: { seasonLabel: string }) {
  const [index, setIndex] = useState(0);
  const [area, setArea] = useState("Anywhere");
  const [vibe, setVibe] = useState("all");
  const scene = scenes[index];

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % scenes.length),
      7000,
    );
    return () => clearInterval(timer);
  }, []);

  function explore() {
    window.dispatchEvent(
      new CustomEvent(FILTER_EVENT, { detail: { category: vibe, area } }),
    );
    document.getElementById("places")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-white">
      {/* Scene photography */}
      <AnimatePresence>
        <motion.div
          key={scene.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.8, ease: EASE },
            scale: { duration: 8, ease: "linear" },
          }}
        >
          <img
            src={imageUrl(scene.photo, 2000)}
            srcSet={imageSrcSet(scene.photo, [960, 1440, 2000])}
            sizes="100vw"
            alt=""
            className="h-full w-full object-cover"
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/10 to-transparent" />

      {/* Cloud layer sweeping across on every change */}
      <motion.div
        key={`clouds-${scene.id}`}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.6, ease: EASE }}
      >
        {[0, 1, 2].map((n) => (
          <motion.div
            key={n}
            className="cloud absolute rounded-full"
            style={{
              width: `${26 + n * 14}vw`,
              height: `${14 + n * 6}vw`,
              top: `${18 + n * 22}%`,
            }}
            initial={{ x: "-45vw" }}
            animate={{ x: "115vw" }}
            transition={{
              duration: 2.2 + n * 0.35,
              ease: EASE,
              delay: n * 0.08,
            }}
          />
        ))}
      </motion.div>

      {/* Copy */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 pt-24 pb-40 sm:px-10">
        <motion.p
          key={`${scene.id}-kicker`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 text-xs uppercase tracking-[0.35em] text-white/70"
        >
          {scene.kicker}
        </motion.p>

        <h1 className="relative max-w-4xl text-[clamp(3.2rem,9vw,7.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.03em]">
          {/* Keyed remount: the new headline slides in immediately, so the
              largest element on the page never blanks between scenes. */}
          <motion.span key={scene.id} className="block">
            {scene.head.map((line, lineIndex) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="headline-fill block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: EASE,
                    delay: lineIndex * 0.08,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.span>
        </h1>

        <motion.p
          key={`${scene.id}-desc`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="mt-8 max-w-md text-sm leading-relaxed text-white/75 sm:text-base"
        >
          {scene.description}
        </motion.p>
      </div>

      {/* Scene thumbnails */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex">
        {scenes.map((item, sceneIndex) => {
          const active = sceneIndex === index;
          return (
            <button
              key={item.id}
              onClick={() => setIndex(sceneIndex)}
              className="group flex items-center gap-4"
              aria-label={`Show ${item.label}`}
            >
              <span className="relative hidden items-center gap-4 xl:flex">
                <span
                  className={`text-right transition-opacity ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                  }`}
                >
                  <span className="block text-sm font-medium text-white">
                    {item.label}
                  </span>
                  <span className="block max-w-[190px] text-xs leading-snug text-white/55">
                    {item.kicker}
                  </span>
                </span>
                <span className="h-10 w-px bg-white/50" />
              </span>

              <span className="relative flex items-center justify-center">
                {active && (
                  <>
                    <span className="absolute h-[150px] w-[150px] rounded-full border border-white/20" />
                    <span className="absolute h-[130px] w-[130px] rounded-full border border-white/30" />
                  </>
                )}
                <span
                  className={`overflow-hidden rounded-full ring-2 transition-all duration-500 ${
                    active
                      ? "h-[104px] w-[104px] ring-white"
                      : "h-14 w-14 ring-white/30"
                  }`}
                >
                  <img
                    src={imageUrl(item.photo, 320)}
                    alt={item.label}
                    className="h-full w-full object-cover"
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan bar */}
      <div className="absolute inset-x-0 bottom-6 z-20 px-4 sm:bottom-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-1 rounded-[26px] bg-white/90 p-2 text-ink shadow-[0_30px_60px_-25px_rgba(23,16,11,0.55)] backdrop-blur-md sm:flex sm:items-center sm:gap-0 sm:rounded-full">
          <label className="rounded-2xl px-4 py-2.5 sm:flex-1 sm:rounded-full sm:px-5 sm:py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted">
              {planBar.where}
            </span>
            <select
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="plan-select mt-1 w-full bg-transparent text-sm font-medium outline-none"
            >
              {AREA_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <span className="hidden h-8 w-px bg-ink/10 sm:block" />

          <label className="rounded-2xl px-4 py-2.5 sm:flex-1 sm:rounded-full sm:px-5 sm:py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted">
              {planBar.what}
            </span>
            <select
              value={vibe}
              onChange={(event) => setVibe(event.target.value)}
              className="plan-select mt-1 w-full bg-transparent text-sm font-medium outline-none"
            >
              {CATEGORY_TABS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <span className="hidden h-8 w-px bg-ink/10 sm:block" />

          <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 sm:col-span-1 sm:block sm:rounded-full sm:px-5 sm:py-3">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-muted">
                {planBar.when}
              </span>
              <span className="mt-1 block whitespace-nowrap text-sm font-medium">
                {seasonLabel}
              </span>
            </div>
            <div className="sm:hidden">
              <ArrowButton onClick={explore} />
            </div>
          </div>

          <div className="ml-auto hidden sm:block">
            <ArrowButton onClick={explore} />
          </div>
        </div>
      </div>
    </section>
  );
}

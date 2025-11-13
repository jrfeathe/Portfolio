'use client';

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AppDictionary } from "../utils/dictionaries";

type TechStackItems = AppDictionary["home"]["sections"]["techStack"]["items"];
type TechStackItem = TechStackItems[number];

const ITEMS_PER_ROW = 4;
const ROWS_PER_SLIDE = 2;
const ITEMS_PER_SLIDE = ITEMS_PER_ROW * ROWS_PER_SLIDE;
const SLIDE_LOCK_DURATION = 420;

export function TechStackCarousel({ items }: { items: TechStackItems }) {
  if (!items.length) {
    return null;
  }

  const slides = useMemo(() => {
    const chunked: TechStackItem[][] = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_SLIDE) {
      chunked.push(items.slice(i, i + ITEMS_PER_SLIDE));
    }
    return chunked;
  }, [items]);

  const [activeSlide, setActiveSlide] = useState(0);
  const interactionLockRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSlide((prev) => Math.min(prev, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  const lockInteraction = useCallback(() => {
    if (interactionLockRef.current !== null) {
      window.clearTimeout(interactionLockRef.current);
    }
    interactionLockRef.current = window.setTimeout(() => {
      interactionLockRef.current = null;
    }, SLIDE_LOCK_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      if (interactionLockRef.current !== null) {
        window.clearTimeout(interactionLockRef.current);
      }
    };
  }, []);

  const changeSlide = useCallback(
    (delta: number, lockAfter = true) => {
      if (!delta || !slides.length) {
        return;
      }

      setActiveSlide((prev) => {
        const maxIndex = Math.max(slides.length - 1, 0);
        const next = Math.max(0, Math.min(prev + delta, maxIndex));

        if (next !== prev && lockAfter) {
          lockInteraction();
        }

        return next;
      });
    },
    [slides.length, lockInteraction],
  );

  const maxIndex = slides.length - 1;
  const canScrollPrev = activeSlide > 0;
  const canScrollNext = activeSlide < maxIndex;

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (slides.length <= 1) {
        return;
      }

      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (dominantDelta === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const wantsNext = dominantDelta > 0;
      if ((wantsNext && !canScrollNext) || (!wantsNext && !canScrollPrev)) {
        return;
      }

      if (interactionLockRef.current !== null) {
        return;
      }

      changeSlide(wantsNext ? 1 : -1);
    },
    [changeSlide, slides.length, canScrollNext, canScrollPrev],
  );

  const handleArrowClick = useCallback(
    (direction: number) => {
      changeSlide(direction, false);
    },
    [changeSlide],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <div className="relative mt-3">
      <div
        ref={containerRef}
        className="-mx-4 overflow-hidden overscroll-contain px-4 pb-4 pt-2 sm:mx-0 sm:px-0 sm:pt-2"
        aria-label="Featured tech stack icons"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <ul
              key={`${slide[0]?.name ?? "slide"}-${slideIndex}`}
              className="grid min-w-full grid-cols-4 grid-rows-2 gap-x-5 gap-y-5 text-center text-xs font-medium text-text dark:text-dark-text"
            >
              {slide.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex h-full flex-col items-center gap-2 rounded-[1.75rem] border border-transparent bg-transparent px-0 py-0 transition hover:-translate-y-0.5"
                    target="_blank"
                    rel="noreferrer noopener"
                    data-tech-stack-item
                  >
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-border/40 bg-surfaceMuted text-accent shadow-sm transition group-hover:border-accent group-hover:text-accent dark:border-dark-border/40 dark:bg-dark-surfaceMuted"
                      data-tech-stack-icon={item.assetId}
                    >
                      <Image
                        src={`/tech-stack/${item.assetId}.svg`}
                        alt=""
                        width={48}
                        height={48}
                        className="h-11 w-11 object-contain"
                        aria-hidden
                      />
                    </span>
                    <span className="truncate text-center font-semibold">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => handleArrowClick(-1)}
            aria-label="Show previous tech stack icons"
            disabled={!canScrollPrev}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface text-text shadow-md transition hover:border-accent hover:text-accent disabled:opacity-30 dark:border-dark-border/60 dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => handleArrowClick(1)}
            aria-label="Show next tech stack icons"
            disabled={!canScrollNext}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface text-text shadow-md transition hover:border-accent hover:text-accent disabled:opacity-30 dark:border-dark-border/60 dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          >
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

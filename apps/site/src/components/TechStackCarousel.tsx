'use client';

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { AppDictionary } from "../utils/dictionaries";

type TechStackItems = AppDictionary["home"]["sections"]["techStack"]["items"];
type TechStackItem = TechStackItems[number];

const ITEMS_PER_ROW = 4;
const ROWS_PER_SLIDE = 2;
const SLIDE_LOCK_DURATION = 420;
const INITIAL_VISIBLE_SLIDES = 1;
const LAZY_SLIDE_DELAY = 600;
const SWIPE_INTENT_THRESHOLD = 8;
const SWIPE_TRIGGER_THRESHOLD = 32;

export function TechStackCarousel({
  items,
  iconsReady = true,
  labels
}: {
  items: TechStackItems;
  iconsReady?: boolean;
  labels: AppDictionary["home"]["sections"]["techStack"]["carousel"];
}) {
  const itemsPerSlide = ITEMS_PER_ROW * ROWS_PER_SLIDE;

  const slides = useMemo(() => {
    const chunked: TechStackItem[][] = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      chunked.push(items.slice(i, i + itemsPerSlide));
    }
    return chunked;
  }, [items, itemsPerSlide]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleSlideCount, setVisibleSlideCount] = useState(() =>
    slides.length ? INITIAL_VISIBLE_SLIDES : 0,
  );
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const interactionLockRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lazySlideTimeoutRef = useRef<number | null>(null);
  const swipeStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    isHorizontal: boolean;
  } | null>(null);

  useEffect(() => {
    setActiveSlide((prev) => Math.min(prev, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    setVisibleSlideCount((prev) => {
      if (!slides.length) {
        return 0;
      }
      if (prev === 0) {
        return INITIAL_VISIBLE_SLIDES;
      }
      return Math.min(prev, slides.length);
    });
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
      if (lazySlideTimeoutRef.current !== null) {
        window.clearTimeout(lazySlideTimeoutRef.current);
        lazySlideTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(pointer: coarse)");
    const handleChange = () => setIsCoarsePointer(media.matches);
    handleChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener?.(handleChange);
    return () => media.removeListener?.(handleChange);
  }, []);

  useEffect(() => {
    if (!slides.length) {
      return;
    }
    setVisibleSlideCount((prev) => Math.max(prev, Math.min(slides.length, activeSlide + 1)));
  }, [activeSlide, slides.length]);

  useEffect(() => {
    if (!slides.length || visibleSlideCount >= slides.length) {
      return;
    }

    lazySlideTimeoutRef.current = window.setTimeout(() => {
      setVisibleSlideCount((prev) => Math.min(prev + 1, slides.length));
    }, LAZY_SLIDE_DELAY);

    return () => {
      if (lazySlideTimeoutRef.current !== null) {
        window.clearTimeout(lazySlideTimeoutRef.current);
        lazySlideTimeoutRef.current = null;
      }
    };
  }, [visibleSlideCount, slides.length]);

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
      if (isCoarsePointer) {
        return;
      }
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
    [changeSlide, slides.length, canScrollNext, canScrollPrev, isCoarsePointer],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isCoarsePointer || slides.length <= 1) {
        return;
      }
      if (event.pointerType !== "touch") {
        return;
      }

      swipeStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        isHorizontal: false
      };
    },
    [isCoarsePointer, slides.length],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const swipeState = swipeStateRef.current;
      if (!swipeState || swipeState.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - swipeState.startX;
      const deltaY = event.clientY - swipeState.startY;

      if (!swipeState.isHorizontal) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (Math.max(absX, absY) < SWIPE_INTENT_THRESHOLD) {
          return;
        }
        if (absY >= absX) {
          swipeStateRef.current = null;
          return;
        }

        swipeState.isHorizontal = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    },
    [],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const swipeState = swipeStateRef.current;
      if (!swipeState || swipeState.pointerId !== event.pointerId) {
        return;
      }

      if (swipeState.isHorizontal) {
        const deltaX = event.clientX - swipeState.startX;
        if (Math.abs(deltaX) >= SWIPE_TRIGGER_THRESHOLD) {
          const wantsNext = deltaX < 0;
          if (
            interactionLockRef.current === null &&
            ((wantsNext && canScrollNext) || (!wantsNext && canScrollPrev))
          ) {
            changeSlide(wantsNext ? 1 : -1);
          }
        }
      }

      swipeStateRef.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [changeSlide, canScrollNext, canScrollPrev],
  );

  const handleArrowClick = useCallback(
    (direction: number) => {
      changeSlide(direction, false);
    },
    [changeSlide],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node || isCoarsePointer) {
      return;
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, isCoarsePointer]);

  if (!slides.length) {
    return null;
  }

  return (
    <div className="relative mt-3">
      <div
        ref={containerRef}
        className={`-mx-4 overflow-hidden pb-4 pt-2 sm:mx-0 sm:pt-2 ${
          isCoarsePointer ? "touch-pan-y overscroll-auto" : "overscroll-contain"
        }`}
        aria-label={labels.label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => {
            const slideIsLoaded = iconsReady && slideIndex < visibleSlideCount;
            return (
              <ul
                key={`${slide[0]?.name ?? "slide"}-${slideIndex}`}
                className="grid w-full flex-none box-border grid-cols-4 grid-rows-2 gap-x-3 gap-y-4 px-4 text-center text-xs font-medium text-text dark:text-dark-text sm:gap-x-5 sm:gap-y-5 sm:px-0"
              >
                {slide.map((item) => {
                  const isInternalHref =
                    item.href.startsWith("/") || item.href.startsWith("#");
                  const itemClassName =
                    "group flex h-full w-full min-w-0 flex-col items-center gap-2 rounded-[1.75rem] border border-transparent bg-transparent px-0 py-0 transition hover:-translate-y-0.5";
                  const wrapNameOnSmall =
                    item.name === "Oracle Cloud" ||
                    item.name === "Stellaris Mods" ||
                    item.name === "Minecraft Mods";
                  const nameParts = item.name.split(" ");
                  const primaryName = nameParts[0];
                  const secondaryName = nameParts.slice(1).join(" ");
                  const itemContent = (
                    <>
                      <span
                        className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-border/40 bg-surfaceMuted text-accent shadow-sm transition group-hover:border-accent group-hover:text-accent dark:border-dark-border/40 dark:bg-dark-surfaceMuted"
                        data-tech-stack-icon={item.assetId}
                      >
                        {slideIsLoaded ? (
                          <Image
                            src={`/api/tech-stack-icons/${item.assetId}`}
                            alt=""
                            width={48}
                            height={48}
                            className="h-11 w-11 object-contain"
                            aria-hidden
                            unoptimized
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="block h-11 w-11 rounded-[1rem] bg-border/30 dark:bg-dark-border/30"
                          />
                        )}
                      </span>
                      <span
                        className={
                          wrapNameOnSmall
                            ? "block w-full text-center font-semibold whitespace-nowrap max-[400px]:whitespace-normal max-[400px]:leading-tight"
                            : "block w-full text-center font-semibold"
                        }
                      >
                        {wrapNameOnSmall ? (
                          <>
                            <span>{primaryName}</span>
                            {secondaryName ? (
                              <span className="max-[400px]:block"> {secondaryName}</span>
                            ) : null}
                          </>
                        ) : (
                          item.name
                        )}
                      </span>
                    </>
                  );

                  return (
                    <li key={item.name}>
                      {isInternalHref ? (
                        <Link
                          href={item.href as Route}
                          className={itemClassName}
                          data-tech-stack-item
                        >
                          {itemContent}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className={itemClassName}
                          data-tech-stack-item
                        >
                          {itemContent}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => handleArrowClick(-1)}
            aria-label={labels.previousLabel}
            disabled={!canScrollPrev}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface text-text shadow-md transition hover:border-accent hover:text-accent disabled:opacity-30 dark:border-dark-border/60 dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => handleArrowClick(1)}
            aria-label={labels.nextLabel}
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

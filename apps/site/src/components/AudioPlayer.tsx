"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@portfolio/ui";

import { DEFAULT_MOBILE_BREAKPOINT } from "./Shell/constants";

type AudioSource = {
  src: string;
  type?: string;
};

const AUDIO_ELEMENT_ID = "portfolio-audio-player";
let sharedAudioElement: HTMLAudioElement | null = null;

function resolvePreferredSource(
  audioEl: HTMLAudioElement,
  sources: AudioSource[]
): string | null {
  if (!sources.length) {
    return null;
  }
  for (const source of sources) {
    if (!source.type) {
      return source.src;
    }
    const canPlay = audioEl.canPlayType(source.type);
    if (canPlay === "probably" || canPlay === "maybe") {
      return source.src;
    }
  }
  return sources[0]?.src ?? null;
}

function ensureSharedAudioElement(): HTMLAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }
  const existing = document.getElementById(AUDIO_ELEMENT_ID);
  if (existing instanceof HTMLAudioElement) {
    sharedAudioElement = existing;
    return existing;
  }
  if (sharedAudioElement && document.body.contains(sharedAudioElement)) {
    return sharedAudioElement;
  }
  const audioEl = document.createElement("audio");
  audioEl.id = AUDIO_ELEMENT_ID;
  audioEl.preload = "metadata";
  audioEl.controls = true;
  audioEl.className = "sr-only";
  audioEl.tabIndex = -1;
  audioEl.setAttribute("data-audio-player-media", "true");
  document.body.appendChild(audioEl);
  sharedAudioElement = audioEl;
  return audioEl;
}

function shouldPersistAcrossRoute(pathname: string): boolean {
  return Boolean(pathname);
}

export type AudioPlayerOverlayProps = {
  src?: string;
  sources?: AudioSource[];
  downloadSrc?: string;
  title: string;
  description?: string;
  playLabel: string;
  pauseLabel: string;
  downloadLabel: string;
  closeLabel: string;
  reopenLabel: string;
  volumeLabel: string;
  volumeShowLabel: string;
  volumeHideLabel: string;
  isSkimMode?: boolean;
  locale: string;
  trackId?: string;
  loop?: boolean;
  className?: string;
  variant?: "vertical" | "horizontal";
};

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "--:--";
  }
  const totalSeconds = Math.round(value);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function emitTelemetry(eventName: string, detail: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch {
    // No-op: telemetry should never break playback
  }
}

export function AudioPlayerOverlay({
  src,
  sources,
  downloadSrc,
  title,
  playLabel,
  pauseLabel,
  downloadLabel,
  closeLabel,
  reopenLabel,
  volumeLabel,
  volumeShowLabel,
  volumeHideLabel,
  isSkimMode,
  locale,
  trackId = "jack-portfolio-suno",
  loop = true,
  className,
  variant = "vertical"
}: AudioPlayerOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const resolvedSources = useMemo(
    () => (sources?.length ? sources : src ? [{ src }] : []),
    [sources, src]
  );
  const primarySrc = resolvedSources[0]?.src;
  const hasSource = resolvedSources.length > 0;
  const downloadHref = downloadSrc ?? primarySrc ?? "";
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHidden, setIsHidden] = useState(() => Boolean(isSkimMode));
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [playerOffset, setPlayerOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isVolumeTrayDown, setIsVolumeTrayDown] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const prevSkimModeRef = useRef(Boolean(isSkimMode));
  const hiddenBeforeSkimRef = useRef<boolean | null>(null);
  const isHorizontalMode = variant === "horizontal";

  const telemetryPayload = useMemo(
    () => ({ locale, trackId, src: primarySrc }),
    [locale, primarySrc, trackId]
  );

  useEffect(() => {
    const audioEl = ensureSharedAudioElement();
    if (!audioEl) {
      return;
    }
    audioRef.current = audioEl;
    audioEl.loop = loop;
    const preferredSrc = resolvePreferredSource(audioEl, resolvedSources);
    if (preferredSrc) {
      const nextUrl = new URL(preferredSrc, window.location.href).href;
      const currentUrl = audioEl.currentSrc || audioEl.src;
      if (currentUrl !== nextUrl) {
        const wasPlaying = !audioEl.paused;
        audioEl.src = preferredSrc;
        audioEl.load();
        if (wasPlaying) {
          audioEl.play().catch(() => {
            // Ignore resume errors.
          });
        }
      }
    }
    setAudioReady(true);
    return () => {
      if (typeof window === "undefined") {
        return;
      }
      if (!shouldPersistAcrossRoute(window.location.pathname)) {
        audioEl.pause();
        audioEl.remove();
        if (sharedAudioElement === audioEl) {
          sharedAudioElement = null;
        }
      }
    };
  }, [loop, resolvedSources]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !audioReady) {
      return;
    }

    const syncFromAudio = () => {
      const nextDuration = Number.isFinite(audioEl.duration)
        ? audioEl.duration
        : 0;
      const nextTime = Number.isFinite(audioEl.currentTime)
        ? audioEl.currentTime
        : 0;
      setDuration(nextDuration);
      setCurrentTime(nextTime);
      setIsPlaying(!audioEl.paused);
      setVolume(Number.isFinite(audioEl.volume) ? audioEl.volume : 1);
    };

    audioEl.loop = loop;

    const handleLoadedMetadata = () => {
      setDuration(audioEl.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      emitTelemetry("media_player_play", telemetryPayload);
    };

    const handlePause = () => {
      setIsPlaying(false);
      emitTelemetry("media_player_pause", telemetryPayload);
    };

    const handleEnded = () => {
      if (!audioEl.loop) {
        setIsPlaying(false);
      }
      emitTelemetry("media_player_ended", telemetryPayload);
    };

    const handleError = () => {
      setIsPlaying(false);
    };

    audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);
    audioEl.addEventListener("ended", handleEnded);
    audioEl.addEventListener("error", handleError);
    syncFromAudio();

    return () => {
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.removeEventListener("error", handleError);
    };
  }, [audioReady, loop, telemetryPayload, variant]);

  const handleToggle = useCallback(async () => {
    const audioEl = audioRef.current;
    if (!audioEl || !hasSource) {
      return;
    }

    audioEl.loop = loop;

    if (isPlaying) {
      audioEl.pause();
      return;
    }

    try {
      await audioEl.play();
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  }, [hasSource, isPlaying, loop]);

  const handleHide = useCallback(() => {
    setIsHidden(true);
  }, []);

  const handleShow = useCallback(() => {
    setPlayerOffset({ x: 0, y: 0 });
    setIsHidden(false);
  }, []);

  useEffect(() => {
    if (isHidden && showVolume) {
      setShowVolume(false);
    }
  }, [isHidden, showVolume]);

  useEffect(() => {
    const nextSkimMode = Boolean(isSkimMode);
    const prevSkimMode = prevSkimModeRef.current;
    if (!prevSkimMode && nextSkimMode) {
      hiddenBeforeSkimRef.current = isHidden;
      setIsHidden(true);
    } else if (prevSkimMode && !nextSkimMode) {
      const restoreHidden = hiddenBeforeSkimRef.current;
      if (restoreHidden !== null) {
        setIsHidden(restoreHidden);
      }
      hiddenBeforeSkimRef.current = null;
    }
    prevSkimModeRef.current = nextSkimMode;
  }, [isHidden, isSkimMode]);

  useEffect(() => {
    setPlayerOffset({ x: 0, y: 0 });
  }, [variant]);

  const handleVolumeToggle = useCallback(() => {
    setShowVolume((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      const clamped = Number.isFinite(next) ? Math.min(Math.max(next, 0), 1) : 0;
      const audioEl = audioRef.current;
      setVolume(clamped);
      if (audioEl) {
        audioEl.volume = clamped;
        audioEl.muted = clamped === 0;
      }
    },
    []
  );

  const handleSeekChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      if (!Number.isFinite(next)) {
        return;
      }
      const clamped = Math.min(Math.max(next, 0), duration || 0);
      setCurrentTime(clamped);
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.currentTime = clamped;
      }
    },
    [duration]
  );

  const handleDragStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isHidden) {
        return;
      }
      const targetNode = event.target;
      const targetElement =
        targetNode instanceof Element
          ? targetNode
          : targetNode instanceof Node
            ? targetNode.parentElement
            : null;
      if (
        targetElement?.closest(
          "button, a, input, textarea, select, [role='button']"
        )
      ) {
        return;
      }
      dragStartRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: playerOffset.x,
        originY: playerOffset.y
      };
      setIsDragging(true);
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isHidden, playerOffset]
  );

  const handleDragMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragStartRef.current;
      if (!drag) {
        return;
      }
      const container = playerContainerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const marginX = isHorizontalMode ? 16 : 6;
      const marginY = 16;
      const baseX = rect.left - playerOffset.x;
      const baseY = rect.top - playerOffset.y;
      const minX = marginX - baseX;
      const maxX = Math.max(
        minX,
        window.innerWidth - rect.width - marginX - baseX
      );
      const minY = marginY - baseY;
      const maxY = Math.max(
        minY,
        window.innerHeight - rect.height - marginY - baseY
      );
      const nextX = Math.min(
        Math.max(drag.originX + (event.clientX - drag.startX), minX),
        maxX
      );
      const nextY = Math.min(
        Math.max(drag.originY + (event.clientY - drag.startY), minY),
        maxY
      );
      setPlayerOffset({ x: nextX, y: nextY });
    },
    [isHorizontalMode, playerOffset]
  );

  const handleDragEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) {
        return;
      }
      dragStartRef.current = null;
      setIsDragging(false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore pointer capture errors.
      }
    },
    []
  );

  const updateVolumeTrayDirection = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const container = playerContainerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const threshold = window.innerHeight * 0.3;
    setIsVolumeTrayDown(rect.top <= threshold);
  }, []);

  const formattedCurrent = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const playerVisibilityClass = isHidden
    ? isHorizontalMode
      ? "opacity-0 pointer-events-none"
      : "pointer-events-none opacity-0"
    : "";
  const scrubMax = duration > 0 ? duration : 1;
  const scrubValue =
    duration > 0 ? Math.min(currentTime, duration) : 0;
  const horizontalTransform = `translate3d(${playerOffset.x}px, ${playerOffset.y + (isHidden ? 24 : 0)}px, 0)`;
  const verticalTransform = `translate3d(${playerOffset.x}px, ${playerOffset.y}px, 0) translateY(-50%)`;
  const hiddenTabIndex = isHidden ? -1 : undefined;

  useEffect(() => {
    if (!isHorizontalMode || !showVolume) {
      return;
    }
    updateVolumeTrayDirection();
    const handleResize = () => updateVolumeTrayDirection();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isHorizontalMode, showVolume, playerOffset, updateVolumeTrayDirection]);

  if (!hasSource) {
    return null;
  }

  if (isHorizontalMode) {
    return (
      <>
        <div
          className={clsx(
            "fixed bottom-4 left-4 z-40 w-[calc(100%_-_6.5rem)] max-w-[420px] touch-none rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surfaceMuted/90 p-3 shadow-2xl backdrop-blur-md dark:border-dark-border/70 dark:from-dark-surface/95 dark:via-dark-surface/90 dark:to-dark-surfaceMuted/90",
            isDragging
              ? "transition-none"
              : "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
            playerVisibilityClass,
            className
          )}
          style={{ transform: horizontalTransform }}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          ref={playerContainerRef}
          data-audio-player="true"
          data-variant="horizontal"
          role="complementary"
          aria-label={title}
          aria-hidden={isHidden}
        >
          <button
            type="button"
            onClick={handleHide}
            aria-label={closeLabel}
            className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-surface p-0 text-[10px] font-semibold text-text shadow-md transition hover:bg-surfaceMuted dark:border-dark-border/70 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
            tabIndex={hiddenTabIndex}
          >
            {"✕"}
          </button>
          <div className="flex flex-col gap-1">
            <div
              className="relative z-10 mx-auto -mb-2 h-1.5 w-10 cursor-grab touch-none rounded-full bg-border/70 shadow-sm active:cursor-grabbing dark:bg-dark-border/70"
              aria-hidden="true"
              data-drag-handle="true"
            />
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggle}
                variant="primary"
                className="h-10 w-10 shrink-0 rounded-full border-2 border-border text-base font-black leading-none shadow-lg dark:border-dark-border"
                aria-label={isPlaying ? pauseLabel : playLabel}
                tabIndex={hiddenTabIndex}
              >
                {isPlaying ? "❚❚" : "▶"}
              </Button>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-semibold tabular-nums text-textMuted dark:text-dark-textMuted">
                  <span>{formattedCurrent}</span>
                  <span>{formattedDuration}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={scrubMax}
                  step="0.1"
                  value={scrubValue}
                  onChange={handleSeekChange}
                  className="h-1.5 w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-60 dark:accent-dark-accent contrast-more:accent-[var(--light-hc-accent)] dark:contrast-more:accent-[var(--dark-hc-accent)]"
                  aria-label={title}
                  aria-valuetext={`${formattedCurrent} / ${formattedDuration}`}
                  tabIndex={hiddenTabIndex}
                  disabled={duration <= 0}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleVolumeToggle}
                    className="h-9 w-9 rounded-full border border-border/70 text-sm font-semibold text-text shadow-sm transition hover:bg-surfaceMuted dark:border-dark-border/70 dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
                    aria-label={showVolume ? volumeHideLabel : volumeShowLabel}
                    tabIndex={hiddenTabIndex}
                  >
                    {volume === 0 ? "🔇" : "🔊"}
                  </button>
                  {showVolume ? (
                    <div
                      className={clsx(
                        "absolute right-0 flex h-32 w-10 items-center justify-center rounded-2xl border border-border/70 bg-surface/95 p-2 shadow-xl backdrop-blur-md dark:border-dark-border/70 dark:bg-dark-surface/95",
                        isVolumeTrayDown ? "top-full mt-3" : "bottom-full mb-3"
                      )}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="h-24 w-24 -rotate-90 cursor-pointer accent-accent dark:accent-dark-accent contrast-more:accent-[var(--light-hc-accent)] dark:contrast-more:accent-[var(--dark-hc-accent)]"
                        aria-label={volumeLabel}
                        aria-orientation="vertical"
                        tabIndex={hiddenTabIndex}
                      />
                    </div>
                  ) : null}
                </div>
                {downloadHref ? (
                  <Button
                    href={downloadHref}
                    download
                    variant="ghost"
                    className="h-9 w-9 border border-border/70 text-sm font-semibold text-text shadow-sm hover:bg-surfaceMuted dark:border-dark-border/70 dark:text-dark-text dark:hover:bg-dark-surfaceMuted !p-0 !min-w-0 !min-h-0"
                    tabIndex={hiddenTabIndex}
                    aria-label={downloadLabel}
                  >
                    {"💾"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {isHidden ? (
          <div className="fixed bottom-4 left-4 z-50">
            <button
              type="button"
              onClick={handleShow}
              aria-label={reopenLabel}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg font-semibold text-text shadow-lg transition hover:border-accent hover:text-accent dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-accent dark:hover:text-dark-accent"
            >
              {"🔊"}
            </button>
          </div>
        ) : null}

      </>
    );
  }

  return (
    <>
      <div
        className={clsx(
          "fixed right-1.5 top-1/2 z-40 w-[min(100px,calc(100%-1.5rem))] max-w-[100px] touch-none rounded-3xl border border-border/70 bg-gradient-to-br from-surface/95 via-surface/90 to-surfaceMuted/90 p-2 shadow-2xl backdrop-blur-md dark:border-dark-border/70 dark:from-dark-surface/95 dark:via-dark-surface/90 dark:to-dark-surfaceMuted/90",
          isDragging
            ? "transition-none"
            : "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
          playerVisibilityClass,
          className
        )}
        style={{ transform: verticalTransform }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        ref={playerContainerRef}
        data-audio-player="true"
        data-variant="vertical"
        role="complementary"
        aria-label={title}
        aria-hidden={isHidden}
      >
        <div className="relative flex flex-col items-center gap-1 text-center">
          <div className="absolute left-[-24px] top-1/16 -translate-y-1/2">
            <Button
              variant="secondary"
              onClick={handleHide}
              aria-label={closeLabel}
              className="h-8 w-8 rounded-full border-2 border-border !p-0 !min-w-0 !min-h-0 text-xs font-semibold shadow-none dark:border-dark-border"
              tabIndex={hiddenTabIndex}
            >
              {"✕"}
            </Button>
          </div>
          <div
            className="mx-auto mb-1 h-1.5 w-10 cursor-grab touch-none rounded-full bg-border/70 shadow-sm active:cursor-grabbing dark:bg-dark-border/70"
            aria-hidden="true"
            data-drag-handle="true"
          />

          <Button
            onClick={handleToggle}
            variant="primary"
            className="h-10 w-10 rounded-full border-2 border-border text-base font-black leading-none shadow-lg dark:border-dark-border"
            aria-label={isPlaying ? pauseLabel : playLabel}
            tabIndex={hiddenTabIndex}
          >
            {isPlaying ? "❚❚" : "▶"}
          </Button>

          <div className="flex w-full flex-col items-center gap-1 text-sm font-medium text-text dark:text-dark-text">
            <span
              className="rounded-xl border-2 border-border px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-textMuted shadow-sm dark:border-dark-border dark:text-dark-textMuted"
              data-time-chip="true"
            >
              {formattedCurrent} / {formattedDuration}
            </span>
            <div className="w-full px-1">
              <input
                type="range"
                min="0"
                max={scrubMax}
                step="0.1"
                value={scrubValue}
                onChange={handleSeekChange}
                className="h-1.5 w-full cursor-pointer accent-accent disabled:cursor-not-allowed disabled:opacity-60 dark:accent-dark-accent contrast-more:accent-[var(--light-hc-accent)] dark:contrast-more:accent-[var(--dark-hc-accent)]"
                aria-label={title}
                aria-valuetext={`${formattedCurrent} / ${formattedDuration}`}
                tabIndex={hiddenTabIndex}
                disabled={duration <= 0}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-text dark:text-dark-text">
            <button
              type="button"
              onClick={handleVolumeToggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-border text-xs font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              aria-label={showVolume ? volumeHideLabel : volumeShowLabel}
              tabIndex={hiddenTabIndex}
            >
              {volume === 0 ? "🔇" : "🔊"}
            </button>
            {downloadHref ? (
              <Button
                href={downloadHref}
                download
                variant="ghost"
                className="h-8 w-8 rounded-full border-2 border-border text-xs font-semibold hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted !p-0 !min-w-0 !min-h-0"
                tabIndex={hiddenTabIndex}
              >
                {"💾"}
              </Button>
            ) : null}
          </div>
          {showVolume ? (
            <div className="w-full px-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-accent dark:accent-dark-accent contrast-more:accent-[var(--light-hc-accent)] dark:contrast-more:accent-[var(--dark-hc-accent)]"
                aria-label={volumeLabel}
                tabIndex={hiddenTabIndex}
              />
            </div>
          ) : null}
        </div>

      </div>

        {isHidden ? (
          <div className="fixed right-1.5 top-1/2 z-50 -translate-y-1/2">
            <Button
              variant="secondary"
              onClick={handleShow}
              aria-label={reopenLabel}
              className="h-10 w-10 rounded-full border-2 border-border shadow-lg hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
            >
              {"🔊"}
            </Button>
          </div>
        ) : null}
    </>
  );
}

type ResponsiveAudioPlayerProps = Omit<AudioPlayerOverlayProps, "variant"> & {
  mobileBreakpoint?: number;
  forceVariant?: "vertical" | "horizontal";
};

export function ResponsiveAudioPlayer({
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  forceVariant,
  ...props
}: ResponsiveAudioPlayerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, [mobileBreakpoint]);

  const resolvedVariant = forceVariant ?? (isMobile ? "horizontal" : "vertical");

  return (
    <AudioPlayerOverlay
      {...props}
      variant={resolvedVariant}
    />
  );
}

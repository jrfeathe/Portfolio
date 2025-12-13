"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@portfolio/ui";

import { DEFAULT_MOBILE_BREAKPOINT } from "./Shell/constants";

export type AudioPlayerOverlayProps = {
  src?: string;
  title: string;
  description?: string;
  playLabel: string;
  pauseLabel: string;
  downloadLabel: string;
  closeLabel: string;
  reopenLabel: string;
  locale: string;
  trackId?: string;
  loop?: boolean;
  className?: string;
  variant?: "floating" | "bottom";
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
  title,
  playLabel,
  pauseLabel,
  downloadLabel,
  closeLabel,
  reopenLabel,
  locale,
  trackId = "portfolio-loop",
  loop = true,
  className,
  variant = "floating"
}: AudioPlayerOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [playerHeight, setPlayerHeight] = useState(0);

  const telemetryPayload = useMemo(
    () => ({ locale, trackId, src }),
    [locale, src, trackId]
  );

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) {
      return;
    }

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

    return () => {
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
      audioEl.removeEventListener("ended", handleEnded);
      audioEl.removeEventListener("error", handleError);
    };
  }, [loop, telemetryPayload]);

  const handleToggle = useCallback(async () => {
    const audioEl = audioRef.current;
    if (!audioEl || !src) {
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
  }, [isPlaying, loop, src]);

  const handleHide = useCallback(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.pause();
    }
    setIsHidden(true);
  }, []);

  const handleShow = useCallback(() => {
    setIsHidden(false);
  }, []);

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

  if (!src) {
    return null;
  }

  const formattedCurrent = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const isBottomVariant = variant === "bottom";
  const playerVisibilityClass = isHidden
    ? isBottomVariant
      ? "translate-y-full opacity-0 pointer-events-none"
      : "pointer-events-none opacity-0"
    : "";
  const spacerHeight = isHidden ? 0 : playerHeight;

  useEffect(() => {
    if (!isBottomVariant) {
      return;
    }

    const container = playerContainerRef.current;
    if (!container) {
      return;
    }

    const updateHeight = () => {
      setPlayerHeight(container.getBoundingClientRect().height);
    };

    updateHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [isBottomVariant]);

  if (isBottomVariant) {
    return (
      <>
        <div
          className={clsx(
            "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 shadow-2xl backdrop-blur-md transition-all duration-200 dark:border-dark-border dark:bg-dark-surface/95",
            playerVisibilityClass,
            className
          )}
          ref={playerContainerRef}
          data-audio-player="true"
          data-variant="bottom"
          role="complementary"
          aria-label={title}
          aria-hidden={isHidden}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggle}
                variant="primary"
                className="h-10 w-10 rounded-full border-2 border-border text-base font-black leading-none shadow-lg dark:border-dark-border"
                aria-label={isPlaying ? pauseLabel : playLabel}
              >
                {isPlaying ? "❚❚" : "▶"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleHide}
                aria-label={closeLabel}
                className="h-9 w-9 rounded-full border-2 border-border text-base shadow-md hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              >
                {"▾"}
              </Button>
              <span
                className="rounded-xl border-2 border-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-textMuted shadow-sm dark:border-dark-border dark:text-dark-textMuted"
                data-time-chip="true"
              >
                {formattedCurrent} / {formattedDuration}
              </span>
              <button
                type="button"
                onClick={handleVolumeToggle}
                className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
                aria-label={showVolume ? "Hide volume slider" : "Show volume slider"}
              >
                {volume === 0 ? "🔇" : "🔊"}
              </button>
              {showVolume ? (
                <div className="flex min-w-[160px] flex-1 items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-accent dark:accent-dark-accent contrast-more:accent-[var(--light-contrastAccent)] dark:contrast-more:accent-[var(--dark-contrastAccent)]"
                    aria-label="Volume"
                  />
                </div>
              ) : null}
              <Button
                href={src}
                download
                variant="secondary"
                className="h-9 rounded-full border border-border px-3 font-semibold shadow-md hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              >
                ↓
              </Button>
            </div>
          </div>

          {/* Instrumental loop without spoken content; captions track is not applicable. */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            controls
            className="sr-only"
          >
            {downloadLabel}
          </audio>
        </div>

        {isHidden ? (
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              variant="secondary"
              onClick={handleShow}
              aria-label={reopenLabel}
              className="h-11 rounded-full border border-border px-4 text-sm font-semibold shadow-lg hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
            >
              {"▴"}
            </Button>
          </div>
        ) : null}

        {spacerHeight > 0 ? (
          <div
            aria-hidden
            className="block md:hidden"
            style={{ height: spacerHeight }}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div
        className={clsx(
          "fixed right-0 top-1/2 z-40 w-[min(100px,calc(100%-1.5rem))] max-w-[100px] -translate-y-1/2 rounded-2xl border border-border/60 bg-surface/95 p-2 shadow-2xl backdrop-blur-md dark:border-dark-border/60 dark:bg-dark-surface/95",
          playerVisibilityClass,
          className
        )}
        data-audio-player="true"
        data-variant="floating"
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
              className="h-8 w-8 rounded-xl border-2 border-border dark:border-dark-border shadow-md"
            >
              {">"}
            </Button>
          </div>

              <Button
                onClick={handleToggle}
                variant="primary"
                className="h-10 w-10 rounded-full border-2 border-border text-base font-black leading-none shadow-lg dark:border-dark-border"
                aria-label={isPlaying ? pauseLabel : playLabel}
              >
                {isPlaying ? "❚❚" : "▶"}
              </Button>

          <div className="flex items-center text-sm font-medium text-text dark:text-dark-text">
            <span
              className="rounded-xl border-2 border-border px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-textMuted shadow-sm dark:border-dark-border dark:text-dark-textMuted"
              data-time-chip="true"
            >
              {formattedCurrent} / {formattedDuration}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-text dark:text-dark-text">
            <button
              type="button"
              onClick={handleVolumeToggle}
              className="rounded-full border-2 border-border px-2 py-1 text-xs font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
              aria-label={showVolume ? "Hide volume slider" : "Show volume slider"}
            >
              {volume === 0 ? "🔇" : "🔊"}
            </button>
            <Button
              href={src}
              download
              variant="secondary"
              className="w-8 h-7 rounded-full border-2 border-border font-semibold shadow-md hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
            >
              ↓
            </Button>
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
                className="w-full accent-accent dark:accent-dark-accent contrast-more:accent-[var(--light-contrastAccent)] dark:contrast-more:accent-[var(--dark-contrastAccent)]"
                aria-label="Volume"
              />
            </div>
          ) : null}
        </div>

        {/* Instrumental loop without spoken content; captions track is not applicable. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          controls
          className="sr-only"
        >
          {downloadLabel}
        </audio>
      </div>

      {isHidden ? (
        <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
          <Button
            variant="secondary"
            onClick={handleShow}
            aria-label={reopenLabel}
            className="h-10 w-10 rounded-xl border-2 border-border shadow-lg hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
          >
            {"<"}
          </Button>
        </div>
      ) : null}
    </>
  );
}

type ResponsiveAudioPlayerProps = Omit<AudioPlayerOverlayProps, "variant"> & {
  mobileBreakpoint?: number;
};

export function ResponsiveAudioPlayer({
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
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

  return (
    <AudioPlayerOverlay
      {...props}
      variant={isMobile ? "bottom" : "floating"}
    />
  );
}

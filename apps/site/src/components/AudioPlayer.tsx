"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@portfolio/ui";

type AudioPlayerOverlayProps = {
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
  className
}: AudioPlayerOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

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

  if (isHidden) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="secondary"
          onClick={handleShow}
          className="shadow-lg"
        >
          {reopenLabel}
        </Button>
      </div>
    );
  }

  const formattedCurrent = formatTime(currentTime);
  const formattedDuration = formatTime(duration);

  return (
    <div
      className={clsx(
        "fixed right-0 top-1/2 z-40 w-[min(100px,calc(100%-1.5rem))] max-w-[100px] -translate-y-1/2 rounded-2xl border border-border/60 bg-surface/95 p-2 shadow-2xl backdrop-blur-md dark:border-dark-border/60 dark:bg-dark-surface/95",
        className
      )}
      role="complementary"
      aria-label={title}
    >
      <div className="relative flex flex-col items-center gap-1 text-center">
        <div className="absolute left-[-24px] top-1/16 -translate-y-1/2">
          <Button
            variant="secondary"
            onClick={handleHide}
            aria-label={closeLabel}
            className="h-8 w-8 rounded-xl border border-border dark:border-dark-border shadow-md"
          >
            {"X"}
          </Button>
        </div>

        <Button
          onClick={handleToggle}
          variant="primary"
          className="h-10 w-10 rounded-full text-base font-bold shadow-lg"
          aria-label={isPlaying ? pauseLabel : playLabel}
        >
          {isPlaying ? "❚❚" : "▶"}
        </Button>

        <div className="flex items-center text-sm font-medium text-text dark:text-dark-text">
          <span className="rounded-xl border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-textMuted dark:border-dark-border dark:text-dark-textMuted">
            {formattedCurrent} / {formattedDuration}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-text dark:text-dark-text">
          <button
            type="button"
            onClick={handleVolumeToggle}
            className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-text transition hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
            aria-label={showVolume ? "Hide volume slider" : "Show volume slider"}
          >
            {volume === 0 ? "🔇" : "🔊"}
          </button>
          <Button
            href={src}
            download
            variant="secondary"
            className="w-8 h-7 rounded-full border border-border font-semibold shadow-md hover:bg-surfaceMuted dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surfaceMuted"
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
              className="w-full accent-accent"
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
  );
}

"use client";

import dynamic from "next/dynamic";

import type { AudioPlayerOverlayProps } from "./AudioPlayer";
import { useSkimMode } from "../utils/skim-mode";

const ResponsiveAudioPlayer = dynamic(
  () => import("./AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

type SkimAwareAudioPlayerProps = Omit<AudioPlayerOverlayProps, "variant" | "isSkimMode"> & {
  forceVariant?: "vertical" | "horizontal";
};

export function SkimAwareAudioPlayer({ forceVariant, ...props }: SkimAwareAudioPlayerProps) {
  const skimActive = useSkimMode();
  const resolvedVariant = skimActive ? "horizontal" : forceVariant;

  return (
    <ResponsiveAudioPlayer
      {...props}
      isSkimMode={skimActive}
      forceVariant={resolvedVariant}
    />
  );
}

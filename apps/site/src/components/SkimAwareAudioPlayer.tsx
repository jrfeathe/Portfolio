"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import type { AudioPlayerOverlayProps } from "./AudioPlayer";
import { isTruthySkimValue } from "../utils/skim";

const ResponsiveAudioPlayer = dynamic(
  () => import("./AudioPlayer").then((mod) => mod.ResponsiveAudioPlayer),
  { ssr: false, loading: () => null }
);

type SkimAwareAudioPlayerProps = Omit<AudioPlayerOverlayProps, "variant" | "isSkimMode"> & {
  forceVariant?: "vertical" | "horizontal";
};

function resolveSkimFromSearchParams(searchParams: ReadonlyURLSearchParams | null) {
  const values: string[] = searchParams?.getAll("skim") ?? [];
  if (!values.length) {
    return false;
  }
  return values.some((value) => isTruthySkimValue(value));
}

export function SkimAwareAudioPlayer({ forceVariant, ...props }: SkimAwareAudioPlayerProps) {
  const searchParams = useSearchParams();
  const skimActive = useMemo(
    () => resolveSkimFromSearchParams(searchParams),
    [searchParams]
  );
  const resolvedVariant = skimActive ? "horizontal" : forceVariant;

  return (
    <ResponsiveAudioPlayer
      {...props}
      isSkimMode={skimActive}
      forceVariant={resolvedVariant}
    />
  );
}

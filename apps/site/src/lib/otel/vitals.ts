import { diag, type Attributes } from "@opentelemetry/api";
import type { NextWebVitalsMetric } from "next/app";

import { getTracer } from "./common";

const TRACER_SCOPE = "browser";
const TRACER_NAME = "web-vitals";
const SHOULD_DEBUG = process.env.NODE_ENV !== "production";

export function recordWebVital(metric: NextWebVitalsMetric) {
  if (typeof window === "undefined") {
    return;
  }

  if (SHOULD_DEBUG) {
    // eslint-disable-next-line no-console -- Useful during local perf tuning.
    console.debug("[web-vitals]", metric.name, metric.value, metric);
  }

  try {
    const tracer = getTracer(TRACER_SCOPE, TRACER_NAME);

    tracer.startActiveSpan(`web-vital ${metric.name}`, (span) => {
      span.setAttribute("web_vital.name", metric.name);
      span.setAttribute("web_vital.value", metric.value);

      if ("rating" in metric && typeof metric.rating === "string") {
        span.setAttribute("web_vital.rating", metric.rating);
      }

      if (metric.id) {
        span.setAttribute("web_vital.id", metric.id);
      }

      if ("delta" in metric && typeof metric.delta === "number") {
        span.setAttribute("web_vital.delta", metric.delta);
      }

      if (
        "navigationType" in metric &&
        typeof metric.navigationType === "string" &&
        metric.navigationType.length > 0
      ) {
        span.setAttribute("web_vital.navigation_type", metric.navigationType);
      }

      const eventPayload: Attributes = {
        name: metric.name,
        value: metric.value,
        delta:
          "delta" in metric && typeof metric.delta === "number"
            ? metric.delta
            : metric.value
      };

      if ("entries" in metric && Array.isArray(metric.entries)) {
        eventPayload.samples = metric.entries.length;
      }

      if ("rating" in metric && typeof metric.rating === "string") {
        eventPayload.rating = metric.rating;
      }

      span.addEvent("measurement", eventPayload);

      span.end();
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error recording web vitals";
    diag.debug(`[otel] Failed to record web vital: ${message}`);
  }
}

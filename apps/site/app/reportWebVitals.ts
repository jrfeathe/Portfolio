import type { NextWebVitalsMetric } from "next/app";

import { recordWebVital } from "../src/lib/otel/vitals";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  recordWebVital(metric);
}

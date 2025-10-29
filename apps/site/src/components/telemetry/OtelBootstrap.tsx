"use client";

import { useEffect } from "react";

import { registerBrowserInstrumentation } from "../../lib/otel/browser";

export function OtelBootstrap() {
  useEffect(() => {
    registerBrowserInstrumentation();
  }, []);

  return null;
}

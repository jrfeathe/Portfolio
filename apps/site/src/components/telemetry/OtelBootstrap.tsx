"use client";

import { useEffect } from "react";

export function OtelBootstrap() {
  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        const { registerBrowserInstrumentation } = await import(
          "../../lib/otel/browser"
        );

        if (!isCancelled) {
          await registerBrowserInstrumentation();
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[otel] Failed to register browser instrumentation:",
            error
          );
        }
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
}

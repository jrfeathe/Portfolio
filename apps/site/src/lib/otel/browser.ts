import { diag } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ZoneContextManager } from "@opentelemetry/context-zone-peer-dep";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  buildResource,
  attachSpanProcessor,
  parseExporter,
  withFetchedTrace
} from "./common";
import { getOtelConfig } from "./config";

const BROWSER_SYMBOL = Symbol.for("portfolio.otel.browser");
const BROWSER_FETCH_SYMBOL = Symbol.for("portfolio.otel.browser.fetch");

type BrowserGlobal = typeof globalThis & {
  [BROWSER_SYMBOL]?: boolean;
  [BROWSER_FETCH_SYMBOL]?: boolean;
};

function getBrowserGlobal(): BrowserGlobal {
  return globalThis as BrowserGlobal;
}

export function registerBrowserInstrumentation() {
  if (typeof window === "undefined") {
    return;
  }

  const browserGlobal = getBrowserGlobal();

  if (browserGlobal[BROWSER_SYMBOL]) {
    return;
  }

  const exporter = parseExporter();

  if (!exporter) {
    diag.debug(
      "[otel] No exporter configured; skipping browser instrumentation."
    );
    browserGlobal[BROWSER_SYMBOL] = true;
    return;
  }

  const provider = new WebTracerProvider({
    resource: buildResource(`${getOtelConfig().serviceName}-browser`)
  });

  attachSpanProcessor(
    provider,
    new BatchSpanProcessor(new OTLPTraceExporter(exporter))
  );

  provider.register({
    contextManager: new ZoneContextManager()
  });

  patchBrowserFetch();

  browserGlobal[BROWSER_SYMBOL] = true;
}

function patchBrowserFetch() {
  const browserGlobal = getBrowserGlobal();

  if (browserGlobal[BROWSER_FETCH_SYMBOL]) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);

  async function tracedFetch(...args: Parameters<typeof fetch>) {
    return withFetchedTrace("browser", args, nativeFetch);
  }

  window.fetch = tracedFetch;
  browserGlobal[BROWSER_FETCH_SYMBOL] = true;
}

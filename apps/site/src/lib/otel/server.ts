import { diag, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { buildResource, parseExporter, withFetchedTrace } from "./common";
import { getOtelConfig } from "./config";

const GLOBAL_KEY = Symbol.for("portfolio.otel.node");
const FETCH_PATCH_KEY = Symbol.for("portfolio.otel.node.fetch");

type ExtendedGlobal = typeof globalThis & {
  [GLOBAL_KEY]?: boolean;
  [FETCH_PATCH_KEY]?: boolean;
};

function getExtendedGlobal(): ExtendedGlobal {
  return globalThis as ExtendedGlobal;
}

export function registerNodeInstrumentation() {
  const extendedGlobal = getExtendedGlobal();
  if (extendedGlobal[GLOBAL_KEY]) {
    return;
  }

  const exporter = parseExporter();

  if (!exporter) {
    diag.debug("[otel] No exporter configured; skipping node instrumentation.");
    extendedGlobal[GLOBAL_KEY] = true;
    return;
  }

  const provider = new NodeTracerProvider({
    resource: buildResource(`${getOtelConfig().serviceName}-node`),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter(exporter))
    ]
  });

  provider.register();
  patchGlobalFetch();

  extendedGlobal[GLOBAL_KEY] = true;
}

function patchGlobalFetch() {
  if (typeof fetch !== "function") {
    return;
  }

  const extendedGlobal = getExtendedGlobal();
  if (extendedGlobal[FETCH_PATCH_KEY]) {
    return;
  }

  const originalFetch = fetch.bind(globalThis);

  async function tracedFetch(...args: Parameters<typeof fetch>) {
    if (!trace.getTracerProvider()) {
      return originalFetch(...args);
    }

    return withFetchedTrace("node", args, originalFetch);
  }

  (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
    tracedFetch;

  extendedGlobal[FETCH_PATCH_KEY] = true;
}

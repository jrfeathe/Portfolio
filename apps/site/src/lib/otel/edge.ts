import {
  context,
  diag,
  SpanStatusCode,
  trace,
  type Span
} from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  BatchSpanProcessor,
  BasicTracerProvider
} from "@opentelemetry/sdk-trace-base";
import type { NextRequest } from "next/server";
import {
  buildResource,
  extractContextFromHeaders,
  getTracer,
  parseExporter,
  withFetchedTrace
} from "./common";
import { getOtelConfig } from "./config";

const EDGE_SYMBOL = Symbol.for("portfolio.otel.edge");
const EDGE_FETCH_SYMBOL = Symbol.for("portfolio.otel.edge.fetch");

type EdgeGlobal = typeof globalThis & {
  [EDGE_SYMBOL]?: boolean;
  [EDGE_FETCH_SYMBOL]?: boolean;
};

function getEdgeGlobal(): EdgeGlobal {
  return globalThis as EdgeGlobal;
}

export function registerEdgeInstrumentation() {
  const globalEdge = getEdgeGlobal();

  if (globalEdge[EDGE_SYMBOL]) {
    return;
  }

  const exporter = parseExporter();

  if (!exporter) {
    diag.debug("[otel] No exporter configured; skipping edge instrumentation.");
    globalEdge[EDGE_SYMBOL] = true;
    return;
  }

  const provider = new BasicTracerProvider({
    resource: buildResource(`${getOtelConfig().serviceName}-edge`),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter(exporter))
    ]
  });
  trace.setGlobalTracerProvider(provider);

  patchEdgeFetch();

  globalEdge[EDGE_SYMBOL] = true;
}

function patchEdgeFetch() {
  if (typeof fetch !== "function") {
    return;
  }

  const globalEdge = getEdgeGlobal();

  if (globalEdge[EDGE_FETCH_SYMBOL]) {
    return;
  }

  const nativeFetch = fetch.bind(globalThis);

  async function tracedFetch(...args: Parameters<typeof fetch>) {
    if (!trace.getTracerProvider()) {
      return nativeFetch(...args);
    }

    return withFetchedTrace("edge", args, nativeFetch);
  }

  (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
    tracedFetch;

  globalEdge[EDGE_FETCH_SYMBOL] = true;
}

export function withEdgeSpan<T>(
  request: NextRequest,
  name: string,
  handler: (span: Span) => T | Promise<T>
): T | Promise<T> {
  const tracer = getTracer("edge-request");
  const ctx = extractContextFromHeaders(request.headers);

  return context.with(ctx, () =>
    tracer.startActiveSpan(name, async (span) => {
      span.setAttribute("http.method", request.method);
      span.setAttribute("http.target", request.nextUrl.pathname);
      span.setAttribute("http.url", request.nextUrl.toString());

      try {
        const result = await handler(span);
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error) {
        if (error instanceof Error) {
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        }
        span.end();
        throw error;
      }
    })
  );
}

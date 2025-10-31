import {
  context,
  diag,
  SpanStatusCode,
  trace,
  type Span
} from "@opentelemetry/api";
import type { NextRequest } from "next/server";
import {
  extractContextFromHeaders,
  getTracer,
  withFetchedTrace
} from "./common";

const EDGE_SYMBOL = Symbol.for("portfolio.otel.edge");
const EDGE_FETCH_SYMBOL = Symbol.for("portfolio.otel.edge.fetch");

type EdgeGlobal = typeof globalThis & {
  [EDGE_SYMBOL]?: boolean;
  [EDGE_FETCH_SYMBOL]?: boolean;
};

function getEdgeGlobal(): EdgeGlobal {
  return globalThis as EdgeGlobal;
}

function patchEdgeFetch() {
  if (typeof fetch !== "function") {
    return;
  }

  const edgeGlobal = getEdgeGlobal();

  if (edgeGlobal[EDGE_FETCH_SYMBOL]) {
    return;
  }

  const nativeFetch = fetch.bind(globalThis);

  async function tracedFetch(...args: Parameters<typeof fetch>) {
    const provider = trace.getTracerProvider();
    if (!provider) {
      return nativeFetch(...args);
    }

    return withFetchedTrace("browser", "edge", args, nativeFetch);
  }

  (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
    tracedFetch;

  edgeGlobal[EDGE_FETCH_SYMBOL] = true;
}

export function registerEdgeInstrumentation(): Promise<void> {
  const edgeGlobal = getEdgeGlobal();

  if (edgeGlobal[EDGE_SYMBOL]) {
    return Promise.resolve();
  }

  edgeGlobal[EDGE_SYMBOL] = true;

  diag.debug(
    "[otel] Edge telemetry exporter disabled: the OTLP HTTP client is unsupported in the Edge runtime. Spans will record locally but are not exported."
  );

  patchEdgeFetch();

  return Promise.resolve();
}

export function withEdgeSpan<T>(
  request: NextRequest,
  name: string,
  handler: (span: Span) => T | Promise<T>
): T | Promise<T> {
  const tracer = getTracer("browser", "edge-request");
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

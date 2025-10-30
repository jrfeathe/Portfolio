import type { Context } from "@opentelemetry/api";
import {
  context,
  propagation,
  SpanStatusCode,
  trace,
  type Span
} from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import type { ExporterOptions } from "./config";
import { getEnvironment, getOtelConfig } from "./config";

type FetchArgs = Parameters<typeof fetch>;

const FETCH_SPAN_NAME = "fetch";

const textMapSetter = {
  set(carrier: Headers, key: string, value: string) {
    carrier.set(key, value);
  }
};

const textMapGetter = {
  get(carrier: Headers, key: string) {
    return carrier.get(key) ?? undefined;
  },
  keys(carrier: Headers) {
    const keys: string[] = [];
    carrier.forEach((_, headerKey) => {
      keys.push(headerKey);
    });
    return keys;
  }
};

export function buildResource(serviceName: string) {
  return resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: getEnvironment()
  });
}

export function parseExporter(): ExporterOptions | null {
  const { exporter } = getOtelConfig();
  return exporter;
}

export function getTracer(name: string) {
  const { serviceName } = getOtelConfig();
  return trace.getTracer(`${serviceName}:${name}`);
}

export function withFetchedTrace(
  tracerName: string,
  args: FetchArgs,
  fetchImpl: typeof fetch
) {
  const tracer = getTracer(tracerName);
  const [input] = args;
  const spanName = resolveFetchSpanName(input);

  return tracer.startActiveSpan(
    `${FETCH_SPAN_NAME} ${spanName}`,
    async (span) => {
      try {
        const {
          input: tracedInput,
          init: tracedInit,
          contextCarrier
        } = createTracedRequest(
          args,
          span
        );

        const response = await context.with(contextCarrier, () =>
          fetchImpl(
            tracedInput as Parameters<typeof fetch>[0],
            tracedInit as Parameters<typeof fetch>[1]
          )
        );

        span.setAttribute("http.status_code", response.status);
        span.setAttribute("http.status_text", response.statusText);
        span.end();
        return response;
      } catch (error) {
        if (error instanceof Error) {
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
          });
        }
        span.end();
        throw error;
      }
    }
  );
}

function resolveFetchSpanName(input: FetchArgs[0]): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (input instanceof Request) {
    return input.url;
  }

  return "unknown";
}

function createTracedRequest(
  args: FetchArgs,
  span: Span
): {
  input: FetchArgs[0];
  init: FetchArgs[1];
  contextCarrier: Context;
} {
  const [input, init] = args;
  const headers = new Headers();

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  } else if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const activeContext = trace.setSpan(context.active(), span);
  propagation.inject(activeContext, headers, textMapSetter);

  const nextInit: RequestInit = {
    ...init,
    headers
  };

  return {
    input,
    init: nextInit as FetchArgs[1],
    contextCarrier: activeContext
  };
}

export function extractContextFromHeaders(headers: Headers): Context {
  return propagation.extract(context.active(), headers, textMapGetter);
}

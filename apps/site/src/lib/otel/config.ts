import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

const env = process.env.NODE_ENV ?? "development";

if (env !== "production") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
}

type ExporterHeaders = Record<string, string>;

function parseHeaders(raw: string | undefined): ExporterHeaders | undefined {
  if (!raw) {
    return undefined;
  }

  return raw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce<ExporterHeaders>((acc, pair) => {
      const [key, value] = pair.split("=");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
}

export type ExporterScope = "server" | "browser";

export type ExporterOptions = {
  url: string;
  headers?: ExporterHeaders;
};

export type OtelConfig = {
  serviceName: string;
  exporter: ExporterOptions | null;
};

const SERVER_SERVICE_NAME =
  process.env.OTEL_SERVICE_NAME ??
  process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ??
  "portfolio-site";

const BROWSER_SERVICE_NAME =
  process.env.NEXT_PUBLIC_SERVICE_NAME ??
  process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ??
  process.env.OTEL_SERVICE_NAME ??
  "portfolio-site";

const SERVER_HEADERS = process.env.OTEL_EXPORTER_OTLP_HEADERS;
const SERVER_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const BROWSER_HEADERS =
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS ??
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HTTP_HEADERS;

const BROWSER_ENDPOINT =
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ??
  process.env.NEXT_PUBLIC_OTEL_TRACES_ENDPOINT ??
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_TRACES_ENDPOINT;

export function getOtelConfig(scope: ExporterScope = "server"): OtelConfig {
  if (scope === "browser") {
    return {
      serviceName: BROWSER_SERVICE_NAME,
      exporter: BROWSER_ENDPOINT
        ? {
            url: BROWSER_ENDPOINT,
            headers: parseHeaders(BROWSER_HEADERS)
          }
        : null
    };
  }

  return {
    serviceName: SERVER_SERVICE_NAME,
    exporter: SERVER_ENDPOINT
      ? {
          url: SERVER_ENDPOINT,
          headers: parseHeaders(SERVER_HEADERS)
        }
      : null
  };
}

export function getEnvironment(): string {
  return env;
}

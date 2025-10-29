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

export type ExporterOptions = {
  url: string;
  headers?: ExporterHeaders;
};

export type OtelConfig = {
  serviceName: string;
  exporter: ExporterOptions | null;
};

const OTEL_SERVICE_NAME =
  process.env.OTEL_SERVICE_NAME ??
  process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ??
  "portfolio-site";

const EXPORTED_HEADERS =
  process.env.OTEL_EXPORTER_OTLP_HEADERS ??
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS;

const EXPORTED_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;

export function getOtelConfig(): OtelConfig {
  return {
    serviceName: OTEL_SERVICE_NAME,
    exporter: EXPORTED_ENDPOINT
      ? {
          url: EXPORTED_ENDPOINT,
          headers: parseHeaders(EXPORTED_HEADERS)
        }
      : null
  };
}

export function getEnvironment(): string {
  return env;
}

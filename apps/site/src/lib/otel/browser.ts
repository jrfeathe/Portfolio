const BROWSER_SYMBOL = Symbol.for("portfolio.otel.browser");
const BROWSER_FETCH_SYMBOL = Symbol.for("portfolio.otel.browser.fetch");

type BrowserGlobal = typeof globalThis & {
  [BROWSER_SYMBOL]?: boolean;
  [BROWSER_FETCH_SYMBOL]?: boolean;
};

type BrowserDependencies = {
  diag: typeof import("@opentelemetry/api").diag;
  OTLPTraceExporter: typeof import("@opentelemetry/exporter-trace-otlp-http").OTLPTraceExporter;
  ZoneContextManager: typeof import("@opentelemetry/context-zone-peer-dep").ZoneContextManager;
  BatchSpanProcessor: typeof import("@opentelemetry/sdk-trace-base").BatchSpanProcessor;
  WebTracerProvider: typeof import("@opentelemetry/sdk-trace-web").WebTracerProvider;
  buildResource: typeof import("./common").buildResource;
  parseExporter: typeof import("./common").parseExporter;
  withFetchedTrace: typeof import("./common").withFetchedTrace;
  getOtelConfig: typeof import("./config").getOtelConfig;
};

let dependencyPromise: Promise<BrowserDependencies> | null = null;

function loadBrowserDependencies(): Promise<BrowserDependencies> {
  if (!dependencyPromise) {
    dependencyPromise = Promise.all([
      import("@opentelemetry/api"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/context-zone-peer-dep"),
      import("@opentelemetry/sdk-trace-base"),
      import("@opentelemetry/sdk-trace-web"),
      import("./common"),
      import("./config")
    ]).then(
      ([
        api,
        exporter,
        zone,
        traceBase,
        traceWeb,
        common,
        config
      ]) => ({
        diag: api.diag,
        OTLPTraceExporter: exporter.OTLPTraceExporter,
        ZoneContextManager: zone.ZoneContextManager,
        BatchSpanProcessor: traceBase.BatchSpanProcessor,
        WebTracerProvider: traceWeb.WebTracerProvider,
        buildResource: common.buildResource,
        parseExporter: common.parseExporter,
        withFetchedTrace: common.withFetchedTrace,
        getOtelConfig: config.getOtelConfig
      })
    );
  }

  return dependencyPromise;
}

function getBrowserGlobal(): BrowserGlobal {
  return globalThis as BrowserGlobal;
}

export async function registerBrowserInstrumentation(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const browserGlobal = getBrowserGlobal();

  if (browserGlobal[BROWSER_SYMBOL]) {
    return;
  }

  let deps: BrowserDependencies;

  try {
    deps = await loadBrowserDependencies();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[otel] Failed to load browser instrumentation:", error);
    }
    browserGlobal[BROWSER_SYMBOL] = true;
    return;
  }

  const { parseExporter, diag } = deps;
  const exporter = parseExporter("browser");

  if (!exporter) {
    diag.debug(
      "[otel] No exporter configured; skipping browser instrumentation."
    );
    browserGlobal[BROWSER_SYMBOL] = true;
    return;
  }

  if (typeof (window as { Zone?: unknown }).Zone === "undefined") {
    diag.warn("[otel] Zone.js not detected; skipping browser instrumentation.");
    browserGlobal[BROWSER_SYMBOL] = true;
    return;
  }

  const {
    WebTracerProvider,
    BatchSpanProcessor,
    OTLPTraceExporter,
    ZoneContextManager,
    buildResource,
    withFetchedTrace,
    getOtelConfig
  } = deps;

  const provider = new WebTracerProvider({
    resource: buildResource(`${getOtelConfig("browser").serviceName}-browser`),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter(exporter))
    ]
  });

  provider.register({
    contextManager: new ZoneContextManager()
  });

  patchBrowserFetch(withFetchedTrace);

  browserGlobal[BROWSER_SYMBOL] = true;
}

function patchBrowserFetch(
  withFetchedTrace: BrowserDependencies["withFetchedTrace"]
) {
  const browserGlobal = getBrowserGlobal();

  if (browserGlobal[BROWSER_FETCH_SYMBOL]) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);

  async function tracedFetch(...args: Parameters<typeof fetch>) {
    return withFetchedTrace("browser", "browser", args, nativeFetch);
  }

  window.fetch = tracedFetch;
  browserGlobal[BROWSER_FETCH_SYMBOL] = true;
}

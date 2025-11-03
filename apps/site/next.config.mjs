import { gzipSync } from "node:zlib";

import getAppRouteFromEntrypointModule from "next/dist/server/get-app-route-from-entrypoint.js";
import { normalizeAppPath } from "next/dist/shared/lib/router/utils/app-paths.js";

const getAppRouteFromEntrypoint =
  typeof getAppRouteFromEntrypointModule === "function"
    ? getAppRouteFromEntrypointModule
    : getAppRouteFromEntrypointModule.default;

const PERFORMANCE_MANIFEST_NAME = "performance-bundle-manifest.json";
const PERFORMANCE_ENV_FLAG = "PERF_BUDGETS";

class PerformanceBundleManifestPlugin {
  constructor(webpack) {
    this.webpack = webpack;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      "PerformanceBundleManifestPlugin",
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: "PerformanceBundleManifestPlugin",
            stage: this.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
          },
          () => {
            const routes = [];

            for (const [name, entrypoint] of compilation.entrypoints) {
              if (!name || !name.startsWith("app/") || !name.endsWith("/page")) {
                continue;
              }

              const routeResult = getAppRouteFromEntrypoint(name);
              const normalizedRoute = normalizeAppPath(routeResult) || "/";

              if (normalizedRoute === "/_not-found") {
                continue;
              }

              if (!routeResult) {
                continue;
              }

              const candidateFiles =
                typeof entrypoint.getFiles === "function"
                  ? entrypoint.getFiles()
                  : [];

              const jsFiles = candidateFiles.filter((file) =>
                file.endsWith(".js")
              );
              const uniqueFiles = new Set();
              let totalBytes = 0;

              for (const file of jsFiles) {
                if (uniqueFiles.has(file)) {
                  continue;
                }

                const asset = compilation.getAsset(file);

                if (!asset) {
                  continue;
                }

                const assetSource = asset.source;
                let buffer;

                if (
                  assetSource &&
                  typeof assetSource.buffer === "function"
                ) {
                  buffer = assetSource.buffer();
                } else {
                  const source =
                    typeof assetSource?.source === "function"
                      ? assetSource.source()
                      : assetSource;

                  buffer =
                    typeof source === "string"
                      ? Buffer.from(source, "utf8")
                      : Buffer.isBuffer(source)
                      ? source
                      : Buffer.from(source);
                }

                const bytes = gzipSync(buffer).length;
                totalBytes += bytes;
                uniqueFiles.add(file);
              }

              routes.push({
                route: normalizedRoute,
                files: Array.from(uniqueFiles),
                totalBytes,
                totalKilobytes: Number((totalBytes / 1024).toFixed(2))
              });
            }

            const payload = {
              generatedAt: new Date().toISOString(),
              routes
            };

            const manifestBuffer = Buffer.from(JSON.stringify(payload));

            compilation.emitAsset(
              PERFORMANCE_MANIFEST_NAME,
              new this.webpack.sources.RawSource(manifestBuffer)
            );
          }
        );
      }
    );
  }
}

/** @type {import('next').NextConfig} */
const config = {
  eslint: {
    dirs: ["app", "src"]
  },
  experimental: {
    typedRoutes: true,
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "@opentelemetry/api",
      "@opentelemetry/context-zone-peer-dep",
      "@opentelemetry/exporter-trace-otlp-http",
      "@opentelemetry/instrumentation-fetch",
      "@opentelemetry/resources",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/sdk-trace-node",
      "@opentelemetry/semantic-conventions"
    ]
  },
  webpack: (webpackConfig, options) => {
    const shouldEmitPerformanceManifest =
      !options.isServer &&
      process.env[PERFORMANCE_ENV_FLAG] === "1";

    if (process.env.PERF_BUDGETS === "1") {
      webpackConfig.cache = false;
    }

    if (shouldEmitPerformanceManifest) {
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new PerformanceBundleManifestPlugin(options.webpack)
      );
    }

    return webpackConfig;
  }
};

export default config;

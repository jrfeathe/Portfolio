/**
 * Next.js runtime instrumentation entry point.
 * This file is executed on both Node.js and edge runtimes.
 */
export async function register() {
  const runtime = process.env.NEXT_RUNTIME;

  if (runtime === "edge") {
    const { registerEdgeInstrumentation } = await import(
      "./src/lib/otel/edge"
    );
    registerEdgeInstrumentation();
    return;
  }

  const { registerNodeInstrumentation } = await import(
    "./src/lib/otel/server"
  );
  registerNodeInstrumentation();
}

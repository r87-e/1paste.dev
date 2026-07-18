import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

// Runs tests inside the real workerd runtime with the Durable Object,
// KV, and bindings wired up from wrangler.toml.
export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});

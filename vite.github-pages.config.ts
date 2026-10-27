import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
// Root sites and custom domains use /; project sites use /repository/.
const base = process.env.PAGES_BASE_PATH ??
  (repository && !repository.endsWith(".github.io") ? `/${repository}/` : "/");

export default defineConfig({
  vite: { base },
  nitro: { preset: "node-server" },
  tanstackStart: {
    server: { entry: "server" },
    router: { basepath: base },
    prerender: { autoStaticPathsDiscovery: false },
    spa: {
      enabled: true,
      maskPath: base,
      prerender: { outputPath: "/index.html", crawlLinks: false },
    },
  },
});
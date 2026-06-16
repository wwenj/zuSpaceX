import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    plugins: [react()],
    base: "/",

    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },

    server: {
      port: 3000,
      host: true,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: isDev,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "";
            if (name.endsWith(".css")) return "css/[name]-[hash].[ext]";
            return "assets/[name]-[hash].[ext]";
          },
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": [
              "@radix-ui/react-slot",
              "class-variance-authority",
              "clsx",
              "tailwind-merge",
            ],
            markdown: [
              "react-markdown",
              "remark-gfm",
              "rehype-raw",
              "react-syntax-highlighter",
            ],
          },
        },
      },
    },

    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },
  };
});

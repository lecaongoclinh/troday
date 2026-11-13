import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
    esbuild: { jsx: "automatic" },
    optimizeDeps: {
        include: [
            "react",
            "react-dom/client",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
        ],
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target:
                    loadEnv(mode, process.cwd(), "").API_PROXY_TARGET ||
                    "http://127.0.0.1:8081",
                changeOrigin: true,
            },
        },
        fs: { allow: [".."] },
    },
    preview: { port: 4173 },
}));

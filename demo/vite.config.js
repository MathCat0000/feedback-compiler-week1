import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const ollamaProxy = {
  target: "http://127.0.0.1:11434",
  changeOrigin: true,
  rewrite: (requestPath) => requestPath.replace(/^\/ollama/, "")
};

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || "/",
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/ollama": ollamaProxy }
  },
  preview: {
    proxy: { "/ollama": ollamaProxy }
  }
});

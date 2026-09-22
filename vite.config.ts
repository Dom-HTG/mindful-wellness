/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { adminApiPlugin } from "./backend/admin/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), adminApiPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});

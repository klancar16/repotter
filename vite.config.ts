/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error: Could not find a declaration file for module 'vite-plugin-eslint'
import eslintPlugin from "vite-plugin-eslint";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        eslintPlugin({
            cache: false,
            include: ["./src/**/*.ts"],
            exclude: [],
        }),
        tailwindcss(),
    ],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/setupTests.ts"],
        include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        typecheck: {
            tsconfig: "./tsconfig.test.json",
        },
    },
});

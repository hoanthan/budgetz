import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    manifest: true,
  },
  server: {
    allowedHosts: [
      "https://db88-2001-ee0-54c1-1da0-783c-fb76-79b0-ed49.ngrok-free.app",
    ],
  },
});

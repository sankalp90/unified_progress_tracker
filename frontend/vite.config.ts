import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/users": "http://127.0.0.1:8000",
      "/profiles": "http://127.0.0.1:8000",
      "/stats": "http://127.0.0.1:8000",
      "/sync": "http://127.0.0.1:8000",
      "/dashboard": "http://127.0.0.1:8000",
      "/leaderboard": "http://127.0.0.1:8000",
      "/achievements": "http://127.0.0.1:8000",
      "/public": "http://127.0.0.1:8000",
    },
  },
});

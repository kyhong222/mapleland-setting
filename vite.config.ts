import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/item/",
  server: {
    proxy: {
      "/api/maplestory": {
        target: "https://maplestory.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/maplestory/, "/api"),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
        },
      },
    },
  },
});

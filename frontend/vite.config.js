import { defineConfig, } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: "./",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://cab-backend-mern.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "https://cab-backend-mern.onrender.com",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    fs: {
      allow: ["..", "./", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "backend/**"],
    },
  },
  build: {
    outDir: "dist", // Local dist for standalone build
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

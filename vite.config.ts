import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    // https: {
    //   cert: fs.readFileSync(path.join(__dirname, "certs/localhost-cert.pem")),
    //   key: fs.readFileSync(path.join(__dirname, "certs/localhost-key.pem")),
    // },   // <-- simple way to enable HTTPS
    port: 5173
  }
});
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import autoprefixer from "autoprefixer"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss() , autoprefixer()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@/components': path.resolve(__dirname, './components'),
    },
  },
})

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5173,      // Ensure it matches the exposed port in Docker
    strictPort: true,
    watch: {
      usePolling: true // Needed for hot reload in Docker
    }
  }
})
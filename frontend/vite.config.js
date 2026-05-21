import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// forward API + auth routes to the express backend on :3000
const backendRoutes = ['/api', '/login', '/logout', '/callback'];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: Object.fromEntries(
      backendRoutes.map((path) => [path, 'http://localhost:3000']),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
  },
});

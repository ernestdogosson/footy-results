import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// forward API + auth routes to the express backend on :3000
const backendRoutes = ['/matches', '/profile', '/login', '/logout', '/callback'];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(
      backendRoutes.map((path) => [path, 'http://localhost:3000']),
    ),
  },
});

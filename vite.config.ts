import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      API_URL: process.env.API_URL,
      CHAIN: process.env.CHAIN,
    },
  },
});

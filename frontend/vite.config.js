import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hilfsfunktion, um das Backend-API-URL korrekt zu setzen
const apiUrl = process.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
        // Entfernt Debug-Logging, sorgt für saubere Proxy-Konfiguration
        // Hinweis: Im Docker-Compose ist VITE_API_URL auf http://backend:5000 gesetzt
        // Damit funktioniert der Proxy im Container, lokal bleibt 127.0.0.1:5000
        // Keine configure-Funktion nötig, außer für gezieltes Debugging
      },
    },
  },
});
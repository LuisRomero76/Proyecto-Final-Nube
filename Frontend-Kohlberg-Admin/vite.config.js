import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4000,
    host: '172.26.12.51',
    allowedHosts: ['com610-g11-frontend.rootcode.com.bo']
}
})


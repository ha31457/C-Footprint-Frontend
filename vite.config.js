import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'poll-disposition-amended-albert.trycloudflare.com',
      'locahost:5173'
    ]
  }
})
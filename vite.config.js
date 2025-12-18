import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  server: {
    host: true,     // ✅ Cho phép truy cập từ mạng LAN
    port: 5173      // ✅ Hoặc port bạn muốn
  }
})

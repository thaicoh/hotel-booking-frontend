import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  base: '/hotel-booking-frontend/',
  plugins: [tailwindcss(),react()],
  
  // ĐOẠN NÀY ĐỂ CHẠY WEBSOCKET
  define: {
    global: 'window', // Định nghĩa biến global trỏ tới window
  },

  server: {
    host: true,     // ✅ Cho phép truy cập từ mạng LAN
    port: 5173      // ✅ Hoặc port bạn muốn
  }
})

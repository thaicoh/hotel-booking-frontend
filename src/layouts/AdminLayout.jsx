import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout() {
  return (
    // SỬA: Dùng h-screen và overflow-hidden để khóa chiều cao trang web lại
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans antialiased text-slate-900">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Vùng bên phải (Header + Nội dung) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader />

        {/* Nội dung chính: Chỉ vùng này có thanh cuộn (overflow-y-auto) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth">
          
          {/* Background mờ trang trí */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 to-transparent pointer-events-none h-40"></div>
          
          <div className="p-4 md:p-8 relative">
            <div className="max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
import StaffHeader from "../components/staff/StaffHeader";

export default function StaffLayout() {
  return (
    /** * h-screen: Khóa chiều cao bằng màn hình
     * overflow-hidden: Ngăn toàn bộ trang bị cuộn, chỉ cuộn vùng chỉ định
     */
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* Sidebar: Giữ nguyên logic responsive bên trong component */}
      <StaffSidebar />

      {/* Vùng bên phải (Header + Nội dung) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header: Cố định phía trên */}
        <StaffHeader />

        {/* Nội dung chính: Vùng duy nhất được phép cuộn (overflow-y-auto) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative bg-gray-50/50 scroll-smooth">
          
          {/* Lớp nền Gradient trang trí nhẹ nhàng phía trên nội dung */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-transparent pointer-events-none h-48"></div>
          
          <div className="p-4 md:p-8 relative">
            {/* max-w: Giới hạn độ rộng nội dung trên màn hình siêu lớn (Ultrawide) */}
            <div className="max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
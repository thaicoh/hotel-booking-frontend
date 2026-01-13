import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  FaChartPie, FaUsers, FaHotel, FaBed, 
  FaCalendarCheck, FaFileAlt, FaSignOutAlt,
  FaBars, FaTimes, FaLeaf
} from "react-icons/fa";

export default function AdminSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { label: "Dashboard", path: "/admin", icon: <FaChartPie /> },
    { label: "Quản lý người dùng", path: "/admin/users", icon: <FaUsers /> },
    { label: "Quản lý chi nhánh", path: "/admin/branches", icon: <FaHotel /> },
    { label: "Quản lý loại phòng", path: "/admin/roomtypes", icon: <FaBed /> },
    { label: "Quản lý booking", path: "/admin/bookings", icon: <FaCalendarCheck /> },
    { label: "Quản lý đánh giá", path: "/admin/reports", icon: <FaFileAlt /> },
  ];

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
  };

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-lg hover:bg-orange-600 transition focus:outline-none"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* --- OVERLAY (MOBILE ONLY) --- */}
      {/* Khi mở menu trên mobile, hiện lớp mờ đen đè lên nội dung chính */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside
        className={`
          /* 1. Cấu hình chung */
          bg-slate-900 text-slate-300 flex flex-col w-64 shadow-xl
          transition-transform duration-300 ease-in-out
          
          /* 2. Cấu hình cho MOBILE (< 768px) */
          /* Quan trọng: fixed để nó nổi lên trên, không chiếm diện tích layout flex */
          fixed inset-y-0 left-0 z-40 h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          /* 3. Cấu hình cho DESKTOP (>= 768px) */
          /* static: quay lại dòng chảy layout bình thường để chia cột với nội dung chính */
          md:static md:translate-x-0 md:h-full
        `}
      >
        {/* HEADER: LOGO */}
        <div className="h-16 flex-none flex items-center justify-center border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-2 text-white font-bold text-xl uppercase tracking-wider hover:text-orange-500 transition">
                <FaLeaf className="text-orange-600 text-2xl" />
                <span>Hotel Admin</span>
            </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-orange-600 text-white shadow-md shadow-orange-900/20 translate-x-1"
                      : "hover:bg-slate-800 hover:text-white hover:translate-x-1"
                  }
                `}
              >
                <span className={`text-lg ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                    {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex-none">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                AD
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Admin User</span>
                <span className="text-xs text-slate-500">admin@hotel.com</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-slate-800/50 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}
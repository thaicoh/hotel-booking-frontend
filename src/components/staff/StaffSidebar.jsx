import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  FaChartPie, FaHotel, FaBed, FaDoorOpen, 
  FaCalendarCheck, FaStar, FaSignOutAlt,
  FaBars, FaTimes, FaUserCircle
} from "react-icons/fa";

export default function StaffSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Danh sách menu theo yêu cầu của bạn
  const menu = [
    { label: "Dashboard", path: "/staff", icon: <FaChartPie /> },
    { label: "Quản lý khách sạn", path: "/staff/hotel", icon: <FaHotel /> },
    // { label: "Quản lý loại phòng", path: "/staff/room-types", icon: <FaBed /> },
    { label: "Quản lý phòng trống", path: "/staff/rooms", icon: <FaDoorOpen /> },
    { label: "Quản lý booking", path: "/staff/bookings", icon: <FaCalendarCheck /> },
    { label: "Quản lý khóa phòng", path: "/staff/room-type-lock", icon: <FaCalendarCheck /> },
    { label: "Quản lý đánh giá", path: "/staff/reviews", icon: <FaStar /> },
  ];

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }
  };

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-slate-900 text-white rounded-md shadow-lg hover:bg-blue-600 transition focus:outline-none"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* --- OVERLAY (MOBILE ONLY) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside
        className={`
          bg-slate-900 text-slate-300 flex flex-col w-64 shadow-xl
          transition-transform duration-300 ease-in-out
          
          fixed inset-y-0 left-0 z-40 h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}

          md:static md:translate-x-0 md:h-full
        `}
      >
        {/* HEADER: LOGO */}
        <div className="h-16 flex-none flex items-center justify-center border-b border-slate-800">
            <Link to="/staff" className="flex items-center gap-2 text-white font-bold text-xl uppercase tracking-wider hover:text-blue-500 transition">
                <FaHotel className="text-blue-500 text-2xl" />
                <span>Staff Panel</span>
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1"
                      : "hover:bg-slate-800 hover:text-white hover:translate-x-1"
                  }
                `}
              >
                <span className={`text-lg ${isActive ? "text-white" : "text-slate-400"}`}>
                    {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER: USER INFO & LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex-none">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white border border-blue-700">
                <FaUserCircle size={24} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate w-32">Staff Member</span>
                <span className="text-xs text-slate-500 italic">Nhân viên</span>
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
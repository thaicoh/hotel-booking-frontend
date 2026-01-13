import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon, 
  BellIcon,
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

export default function AdminHeader() {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center sticky top-0 z-20">
      {/* Left side: Breadcrumbs hoặc Title */}
      <div className="hidden md:block">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Hệ thống quản trị khách sạn
        </h2>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors relative">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>

        {/* User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
            onClick={() => setShowMenu(!showMenu)}
          >
            <img
              src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.fullName}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-orange-200"
            />
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-bold text-gray-700">{user?.fullName || "Quản trị viên"}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase">Admin</span>
            </div>
            <ChevronDownIcon 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} 
            />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl w-52 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-xs text-gray-400">Tài khoản</p>
                <p className="text-sm font-semibold text-gray-700 truncate">{user?.email}</p>
              </div>
              
              <button className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors">
                <UserCircleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">Hồ sơ cá nhân</span>
              </button>

              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors"
                  onClick={logout}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="text-sm font-bold">Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
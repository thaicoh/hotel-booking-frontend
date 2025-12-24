import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";


export default function AdminHeader() {
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
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
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <button
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="font-medium">{user?.fullName}</span>
          <img
            src={user?.avatar || "https://i.pravatar.cc/40"}
            alt="avatar"
            className="w-10 h-10 rounded-full border"
          />
          {/* Mũi tên đỏ */}
          <svg
            className={`w-4 h-4 transition-transform ${
              showMenu ? "rotate-180 text-red-500" : "text-red-500"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-14 bg-white border rounded shadow-md w-44">
            <button
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
            onClick={logout}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
            <span>Đăng xuất</span>
          </button>

          </div>
        )}
      </div>
    </header>
  );
}
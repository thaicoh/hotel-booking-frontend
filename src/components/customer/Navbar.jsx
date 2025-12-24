import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUser, FaHeart, FaSignOutAlt, FaClipboardList } from "react-icons/fa";

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 border-b border-solid border-gray-100">
      {/* Container căn giữa giống trang Home */}
      <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLpPHAjlF8ipYNb7DdvLU90sNFJZZbDWPWew&s"
            className="h-8"
            alt="Logo"
          />
        </Link>

        {/* Menu */}
        <nav className="flex items-center space-x-6" ref={menuRef}>
          <button className="text-gray-700 hover:text-orange-600 transition duration-300 ease-in-out transform hover:scale-105">
            Tiếng Việt
          </button>

          {!token && (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-orange-600 transition duration-300"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
              >
                Đăng ký
              </Link>
            </>
          )}

          {token && user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
              >
                <div className="h-10 w-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-700">{user.fullName}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showMenu ? "rotate-180 text-orange-500" : "text-orange-500"
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
                <div className="absolute right-0 top-14 bg-white border rounded-lg shadow-lg w-56 z-50 transition duration-300">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                  <Link
                    to="/account"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 transition duration-300"
                  >
                    <FaUser className="text-orange-500" />
                    Tài khoản
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 transition duration-300"
                  >
                    <FaClipboardList className="text-orange-500" />
                    Đặt phòng của tôi
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 transition duration-300"
                  >
                    <FaHeart className="text-orange-500" />
                    Danh sách yêu thích
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-500 w-full text-left transition duration-300"
                  >
                    <FaSignOutAlt />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
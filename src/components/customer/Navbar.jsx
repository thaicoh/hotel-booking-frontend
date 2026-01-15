import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaHeart, FaSignOutAlt, FaClipboardList, FaBars, FaTimes, FaGlobe } from "react-icons/fa";

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Đóng menu khi đổi trang
  useEffect(() => {
    setShowMenu(false);
    setIsMobileOpen(false);
  }, [location]);

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
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-[100] border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center group">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLpPHAjlF8ipYNb7DdvLU90sNFJZZbDWPWew&s"
              className="h-10 w-auto transition-transform group-hover:scale-105"
              alt="Logo"
            />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent hidden sm:block">
              XANH HOTEL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" ref={menuRef}>
            {/* <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition">
              <FaGlobe className="text-sm" />
              <span>VN</span>
            </button> */}

            {!token ? (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-orange-600 font-semibold transition">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-orange-700 shadow-md hover:shadow-orange-200 transition transform hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition shadow-sm"
                >
                  <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold shadow-inner">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-700">{user?.fullName?.split(' ').pop()}</span>
                  <svg className={`w-4 h-4 transition-transform ${showMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-3 border-b border-gray-50 mb-1">
                      <p className="font-bold text-gray-800 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || user?.phone}</p>
                    </div>
                    
                    <MenuLink to="/profile" icon={<FaUser />} label="Hồ sơ cá nhân" />
                    <MenuLink to="/my-bookings" icon={<FaClipboardList />} label="Đặt phòng của tôi" />
                    <MenuLink to="/favorites" icon={<FaHeart />} label="Phòng yêu thích" />
                    
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 w-full text-left font-medium transition"
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-600 p-2 focus:outline-none"
            >
              {isMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 shadow-xl animate-in slide-in-from-top duration-300">
          {token && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl mb-4">
                <div className="h-12 w-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500 italic">Khách hàng Xanh</p>
                </div>
              </div>
              <MobileLink to="/profile" icon={<FaUser />} label="Tài khoản" />
              <MobileLink to="/my-bookings" icon={<FaClipboardList />} label="Lịch trình" />
              <MobileLink to="/favorites" icon={<FaHeart />} label="Yêu thích" />
              <button onClick={logout} className="flex items-center gap-3 w-full p-4 text-red-500 font-bold border-t border-gray-100 mt-2">
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              <Link to="/login" className="w-full text-center py-3 font-bold text-gray-700 border border-gray-200 rounded-xl">Đăng nhập</Link>
              <Link to="/register" className="w-full text-center py-3 font-bold text-white bg-orange-600 rounded-xl shadow-lg">Đăng ký</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// Sub-components giúp code sạch hơn
const MenuLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50 text-gray-600 hover:text-orange-600 font-medium transition duration-200"
  >
    <span className="text-orange-500/80">{icon}</span>
    {label}
  </Link>
);

const MobileLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 text-gray-700 font-semibold hover:bg-gray-50 rounded-xl transition"
  >
    <span className="text-orange-500">{icon}</span>
    {label}
  </Link>
);
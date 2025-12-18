import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, token, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLpPHAjlF8ipYNb7DdvLU90sNFJZZbDWPWew&s" className="h-8" />
        <span className="text-lg font-semibold text-orange-600">Dành cho đối tác</span>
      </Link>

      <nav className="flex items-center space-x-6">
        <button className="text-gray-700 hover:text-orange-600">Tiếng Việt</button>

        {!token && (
          <>
            <Link to="/login" className="text-gray-700 hover:text-orange-600">Đăng nhập</Link>
            <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              Đăng ký
            </Link>
          </>
        )}

        {token && user && (
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-orange-400 text-white rounded-full flex items-center justify-center font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            <span className="font-semibold text-gray-700">{user.fullName}</span>

            <button onClick={logout} className="text-red-500 hover:text-red-700">
              Đăng xuất
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
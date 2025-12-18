import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const { user, loadingAuth } = useContext(AuthContext);

  // ⏳ Chờ AuthContext load xong
  if (loadingAuth) return <div>Loading...</div>;

  // Nếu đã đăng nhập → điều hướng theo role
  if (user) {
    if (user.roles.includes("ADMIN")) return <Navigate to="/admin" replace />;
    if (user.roles.includes("STAFF")) return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  // Nếu chưa login → cho vào trang login/register
  return children;
}
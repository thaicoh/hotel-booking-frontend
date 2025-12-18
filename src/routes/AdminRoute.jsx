import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, loadingAuth } = useContext(AuthContext);

  // ⏳ Chờ AuthContext load xong
  if (loadingAuth) return <div>Loading...</div>;

  // ❌ Không có user → về login
  if (!user) return <Navigate to="/login" replace />;

  // ❌ Không phải admin → về login
  if (!user.roles.includes("ADMIN")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
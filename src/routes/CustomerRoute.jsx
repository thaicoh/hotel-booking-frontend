import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CustomerRoute({ children }) {
  const { user, loadingAuth } = useContext(AuthContext);

  // ⏳ Chờ AuthContext load xong
  if (loadingAuth) return <div>Loading...</div>;

  // ❌ Không có user → về login
  if (!user) return <Navigate to="/login" replace />;

  // ❌ Không phải customer → về login
  if (!user.roles.includes("CUSTOMER")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

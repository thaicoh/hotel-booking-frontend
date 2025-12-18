import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CustomerRoute({ children }) {
  const { user, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
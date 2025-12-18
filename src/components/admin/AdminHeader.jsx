import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">{user?.fullName}</span>

        <img
          src={user?.avatar || "https://i.pravatar.cc/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />

      </div>
    </header>
  );
}
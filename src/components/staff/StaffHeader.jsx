import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function StaffHeader() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Staff Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">{user?.fullName}</span>

        <img
          src={user?.avatar || "https://i.pravatar.cc/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
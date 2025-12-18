import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/admin" },
    { label: "Quản lý người dùng", path: "/admin/users" },
    { label: "Quản lý chi nhánh", path: "/admin/branches" },
    { label: "Quản lý loại phòng", path: "/admin/roomtypes" },

    { label: "Quản lý booking", path: "/admin/bookings" },
    { label: "Báo cáo", path: "/admin/reports" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
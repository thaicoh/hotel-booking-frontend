import { Link, useLocation } from "react-router-dom";

export default function StaffSidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/staff" },
    { label: "Quản lý đặt phòng", path: "/staff/bookings" },
    { label: "Quản lý phòng", path: "/staff/rooms" },
    { label: "Check-in / Check-out", path: "/staff/checkin-out" },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Staff Panel</h2>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-blue-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
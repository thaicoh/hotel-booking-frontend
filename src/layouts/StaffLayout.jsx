import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/staff/StaffSidebar";
import StaffHeader from "../components/staff/StaffHeader";

export default function StaffLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <StaffSidebar />

      {/* Content */}
      <div className="flex-1">
        <StaffHeader />

        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
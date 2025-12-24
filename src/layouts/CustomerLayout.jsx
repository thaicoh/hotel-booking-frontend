import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/customer/Navbar";
import Footer from "../components/customer/Footer"; // Footer riêng

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar cố định */}
      <CustomerNavbar />

      {/* Nội dung chính */}
      <main className="pt-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
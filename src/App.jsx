import { Routes, Route, useLocation } from "react-router-dom";

// ✅ Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import StaffLayout from "./layouts/StaffLayout";
import AdminLayout from "./layouts/AdminLayout";

// ✅ Customer pages
import Home from "./pages/customer/Home";
import RoomList from "./pages/customer/RoomList";
import RoomDetail from "./pages/customer/RoomDetail";
import Booking from "./pages/customer/Booking";
import SearchPage from "./pages/customer/SearchPage";
import Profile from "./pages/customer/Profile";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import HotelDetail from "./pages/customer/HotelDetail";
import CheckoutPage from "./pages/customer/CheckoutPage";

// ✅ Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import ManageBookings from "./pages/staff/ManageBookings";
import ManageRooms from "./pages/staff/ManageRooms";
import CheckInOut from "./pages/staff/CheckInOut";

// ✅ Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBranches from "./pages/admin/ManageBranches";
import ManageBookingsAdmin from "./pages/admin/ManageBookings";
import ManageRoomTypes from "./pages/admin/ManageRoomTypes"
import RoomTypeDetail from "./pages/admin/RoomTypeDetail";


import Reports from "./pages/admin/Reports";

// ✅ Route guards
import AdminRoute from "./routes/AdminRoute";
import StaffRoute from "./routes/StaffRoute";
import CustomerRoute from "./routes/CustomerRoute";
import GuestRoute from "./routes/GuestRoute";

// ✅ Common
import Navbar from "./components/customer/Navbar";
import NotFound from "./pages/NotFound";

export default function App() {
  const location = useLocation();

  // ✅ Ẩn Navbar trong dashboard (admin + staff)
  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* ✅ CUSTOMER ROUTES */}
        <Route element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="rooms" element={<RoomList />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="booking" element={<Booking />} />
          <Route
            path="profile"
            element={
              <CustomerRoute>
                <Profile />
              </CustomerRoute>
            }
          />

          {/* 🔍 Search Page */}
          <Route path="search" element={<SearchPage />} />

          <Route path="detail" element={<HotelDetail />} />

          <Route path="checkout" 
            element={
                <CustomerRoute>
                  <CheckoutPage />
                </CustomerRoute>
            }
          />



          {/* Auth */}
          <Route
            path="login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
        </Route>


        {/* ✅ STAFF ROUTES */}
        <Route
          path="/staff"
          element={
            <StaffRoute>
              <StaffLayout />
            </StaffRoute>
          }
        >
          <Route index element={<StaffDashboard />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="checkin-out" element={<CheckInOut />} />
        </Route>

        {/* ✅ ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="branches" element={<ManageBranches />} />
          <Route path="bookings" element={<ManageBookingsAdmin />} />
          <Route path="roomtypes" element={<ManageRoomTypes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="/admin/room-types/:id" element={<RoomTypeDetail />} />
        </Route>

        {/* ✅ 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
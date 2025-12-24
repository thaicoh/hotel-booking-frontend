// src/api/bookings.js
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";
import { getRoomTypesByBranch } from "./roomtypes";

// Re-use API có sẵn của dự án (đỡ đoán endpoint)
export { getBranches } from "./branches";

/**
 * Lấy RoomTypes
 * - Có branchId: dùng endpoint có sẵn GET /branch/{branchId}/room-types
 * - Không có branchId: gọi GET /room_type (nếu backend bạn khác đường dẫn thì đổi lại)
 */
export const getRoomTypes = (branchId) => {
  if (branchId) return getRoomTypesByBranch(branchId);
  return axiosInstance.get(`${API_BASE_URL}/room_type`);
};

/**
 * Lấy danh sách bookings (admin)
 * Hiện tại chỉ dựng khung để gọi sau:
 * - params sẽ thành query string (?branchId=...&status=... ...)
 * - endpoint /booking là placeholder (nếu backend bạn khác thì đổi)
 */
// Example API function to fetch bookings with filters
export const getBookings = (filters) => {
  return axiosInstance.get(`${API_BASE_URL}/bookings`, {
    params: {
      branchId: filters.branchId,
      roomTypeId: filters.roomTypeId,
      bookingType: filters.bookingType,
      bookingStatus: filters.bookingStatus,
      paymentStatus: filters.paymentStatus,
      checkInDate: filters.checkInDate,
      searchQuery: filters.searchQuery,  // Pass the search query
    },
  });
};


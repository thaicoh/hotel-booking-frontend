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


// ===============================
// 📌 Tạo booking mới
// ===============================
export const createBooking = (payload) => {
  // payload gồm: roomTypeId, bookingTypeCode, checkInDate, checkOutDate, hours,
  // numberOfGuests, specialRequests, bookingSource, paymentMethod
  return axiosInstance.post(`${API_BASE_URL}/bookings`, payload);
};


/**
 * Lấy danh sách booking của khách hàng đang đăng nhập
 */
export const getMyBookings = () => {
  return axiosInstance.get(`${API_BASE_URL}/bookings/my`);
};


// ✅ UPDATE: Gọi đúng endpoint /admin/bookings và map tham số
export const getBookings = (filters, page = 0, size = 10) => {
  // Logic map paymentStatus sang boolean isPaid của backend
  let isPaidParam = null;
  if (filters.paymentStatus === 'PAID') isPaidParam = true;
  if (filters.paymentStatus === 'PENDING') isPaidParam = false;

  const params = {
    page: page,
    size: size,
    search: filters.searchQuery || null,
    branchId: filters.branchId || null,
    roomTypeId: filters.roomTypeId || null,
    bookingTypeCode: filters.bookingType || null, // Backend dùng 'bookingTypeCode'
    status: filters.bookingStatus || null,
    isPaid: isPaidParam,
    checkInDate: filters.checkInDate || null,
  };

  // Xóa các key có giá trị null/undefined/rỗng để URL gọn gàng
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === "" || params[key] === undefined) {
      delete params[key];
    }
  });

  return axiosInstance.get(`${API_BASE_URL}/bookings/admin/bookings`, { params });
};


// ===============================
// 📌 Gán phòng (Assign Room)
// ===============================

/**
 * Lấy danh sách phòng khả dụng cho 1 booking cụ thể
 * GET /bookings/{bookingId}/available-rooms
 */
export const getAvailableRoomsForBooking = (bookingId) => {
  return axiosInstance.get(`${API_BASE_URL}/bookings/${bookingId}/available-rooms`);
};

/**
 * Gán phòng cho booking
 * POST /bookings/assign-room
 * Body: { "bookingId": 19, "roomId": "..." }
 */
export const assignRoomToBooking = (bookingId, roomId) => {
  return axiosInstance.post(`${API_BASE_URL}/bookings/assign-room`, {
    bookingId,
    roomId
  });
};

/**
 * Hủy xếp phòng (Remove Room)
 * DELETE /bookings/{bookingId}/room
 */
export const removeRoomFromBooking = (bookingId) => {
  return axiosInstance.delete(`${API_BASE_URL}/bookings/${bookingId}/room`);
};


/**
 * 🆕 Lấy chi tiết một booking
 * GET /bookings/{bookingId}
 */
export const getBookingDetails = (bookingId) => {
  return axiosInstance.get(`${API_BASE_URL}/bookings/${bookingId}`);
};


/**
 * 🆕 Cập nhật trạng thái Booking
 * PUT /bookings/status
 * Body: { bookingId: 1, status: "PAID" }
 */
export const updateBookingStatus = (bookingId, status) => {
    return axiosInstance.put(`${API_BASE_URL}/bookings/status`, {
        bookingId,
        status
    });
};

export const getBookingsByBranch = (branchId, dateStr) => {
  // dateStr format: YYYY-MM-DD
  return axiosInstance.get(`${API_BASE_URL}/bookings/branch/${branchId}/bookings`, {
    params: { date: dateStr }
  });
};
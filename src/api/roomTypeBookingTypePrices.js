// src/api/roomTypeBookingTypePrices.js
import axiosInstance from "./axiosInstance";  // sử dụng axios instance mà bạn đã cấu hình trong dự án
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy giá cho các loại đặt phòng theo roomTypeId
// GET /room-type-booking-type-prices/room-type/{roomTypeId}
// ===============================
export const getPricesByRoomTypeId = (roomTypeId) => {
  return axiosInstance.get(
    `${API_BASE_URL}/room-type-booking-type-prices/room-type/${roomTypeId}`
  );
};

// ===============================
// 📌 Tạo mới giá cho RoomType + BookingType
// POST /room-type-booking-type-prices
// ===============================
export const createRoomTypeBookingTypePrice = (data) => {
  return axiosInstance.post(
    `${API_BASE_URL}/room-type-booking-type-prices`,
    data
  );
};

// ===============================
// 📌 Cập nhật giá theo id
// PUT /room-type-booking-type-prices/{id}
// ===============================
export const updateRoomTypeBookingTypePrice = (id, data) => {
  return axiosInstance.put(
    `${API_BASE_URL}/room-type-booking-type-prices/${id}`,
    data
  );
};

// ===============================
// 📌 Xóa giá theo id
// DELETE /room-type-booking-type-prices/{id}
// ===============================
export const deleteRoomTypeBookingTypePrice = (id) => {
  return axiosInstance.delete(
    `${API_BASE_URL}/room-type-booking-type-prices/${id}`
  );
};


// src/api/rooms.js
import axiosInstance from "./axiosInstance"; // Sử dụng axiosInstance cho việc gọi API
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy tất cả phòng theo room type id
// GET /room/type/{roomTypeId}
// ===============================
export const getRoomsByRoomTypeId = (roomTypeId) => {
  return axiosInstance.get(`${API_BASE_URL}/room/type/${roomTypeId}`);
};

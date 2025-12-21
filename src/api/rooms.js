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


// ===============================
// 📌 Tạo phòng mới
// POST /room
// ===============================
export const createRoom = (roomData) => {
  // Nếu không truyền status thì mặc định là "Available"
  const payload = {
    ...roomData,
    status: roomData.status || "Available",
  };

  return axiosInstance.post(`${API_BASE_URL}/room`, payload);
};


// ===============================
// 📌 Cập nhật phòng
// PUT /room/{id}
// ===============================
export const updateRoom = (roomId, roomData) => {
  return axiosInstance.put(`${API_BASE_URL}/room/${roomId}`, roomData);
};
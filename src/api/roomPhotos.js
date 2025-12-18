// src/api/roomPhotos.js
import axiosInstance from "./axiosInstance"; // Sử dụng axiosInstance cho việc gọi API
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy tất cả ảnh phòng theo room type id
// GET /room_photo/{roomTypeId}
// ===============================
export const getRoomPhotosByRoomTypeId = (roomTypeId) => {
  return axiosInstance.get(`${API_BASE_URL}/room_photo/${roomTypeId}`);
};

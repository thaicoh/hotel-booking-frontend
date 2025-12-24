// src/api/roomtypes.js
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy room types theo branch
// GET /room_type/branch/{branchId}
// ===============================
export const getRoomTypesByBranch = (branchId) => {
  return axiosInstance.get(
    `${API_BASE_URL}/branch/${branchId}/room-types`
  );
};

// ===============================
// 📌 Lấy room type chi tiết theo ID
// GET /room_type/{id}
// ===============================
export const getRoomTypeDetails = (id) => {
  return axiosInstance.get(
    `${API_BASE_URL}/room_type/${id}`
  );
};

// ===============================
// 📌 Cập nhật thông tin cơ bản của Room Type (không bao gồm Branch)
// PUT /room_type/{id}
// ===============================
export const updateBasicInfo = (roomTypeId, data) => {
  return axiosInstance.put(`${API_BASE_URL}/room_type/${roomTypeId}`, data);
};


// ===============================
// 📌 Tạo Room Type mới (chỉ thông tin cơ bản)
// POST /room_type
// ===============================
export const createRoomType = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/room_type`, data, {
    headers: { "Content-Type": "application/json" },
  });
};
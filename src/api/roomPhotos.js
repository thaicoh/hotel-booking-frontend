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

// ✅ Xóa 1 ảnh room photo theo id
export const deleteRoomPhoto = (photoId) => {
  return axiosInstance.delete(`${API_BASE_URL}/room_photo/${photoId}`);
};

// ✅ Upload ảnh chính cho roomType
export const uploadMainRoomPhoto = (roomTypeId, file) => {
  const formData = new FormData();
  formData.append("roomTypeId", roomTypeId);
  formData.append("photo", file);

  return axiosInstance.post(`${API_BASE_URL}/room_photo/main`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Update ảnh chính
export const updateMainRoomPhoto = (roomTypeId, file) => {
  const formData = new FormData();
  formData.append("roomTypeId", roomTypeId);
  formData.append("photo", file);

  return axiosInstance.put(`${API_BASE_URL}/room_photo/main`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Update 1 room photo by photoId (multipart/form-data)
// ASSUME endpoint: PUT /room_photo/{photoId}
export const updateRoomPhoto = (photoId, file) => {
  const formData = new FormData();
  formData.append("photo", file);

  return axiosInstance.put(`${API_BASE_URL}/room_photo/${photoId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


// Upload ảnh phụ cho roomType
export const uploadSubRoomPhoto = async (roomTypeId, file) => {
  const formData = new FormData();
  formData.append("roomTypeId", roomTypeId); // Thêm roomTypeId vào FormData
  formData.append("photo", file); // Thêm ảnh vào FormData

  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/room_photo/sub`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Đảm bảo gửi đúng content-type
      },
    });
    return response.data;  // Gửi kết quả trả về từ server
  } catch (error) {
    console.error("Upload photo failed:", error);
    throw error;  // Nếu có lỗi sẽ được bắt ở nơi gọi
  }
};


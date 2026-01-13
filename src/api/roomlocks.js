import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// 📌 Lấy danh sách khóa phòng theo Branch
export const getLocksByBranch = (branchId) => {
  return axiosInstance.get(`${API_BASE_URL}/room_type_lock/branch/${branchId}`);
};

// 📌 Tạo khóa phòng mới
export const createRoomLock = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/room_type_lock`, data);
};

// 📌 Xóa khóa phòng
export const deleteRoomLock = (lockId) => {
  return axiosInstance.delete(`${API_BASE_URL}/room_type_lock/${lockId}`);
};

// 📌 Lấy danh sách Booking Types (Cần API này để đổ dữ liệu vào dropdown khi tạo mới)
// Giả định endpoint này tồn tại dựa trên logic hệ thống, nếu khác bạn hãy sửa lại
export const getAllBookingTypes = () => {
  return axiosInstance.get(`${API_BASE_URL}/booking_type`); 
};
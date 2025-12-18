import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// Lấy danh sách tất cả roles
export const getRoles = () => {
  return axiosInstance.get(`${API_BASE_URL}/role`);
};

// Lấy chi tiết 1 role theo ID
export const getRoleById = (roleId) => {
  return axiosInstance.get(`${API_BASE_URL}/role/${roleId}`);
};

// Tạo role mới
export const createRole = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/role`, data);
};

// Cập nhật role
export const updateRole = (roleId, data) => {
  return axiosInstance.put(`${API_BASE_URL}/role/${roleId}`, data);
};

// Xóa role
export const deleteRole = (roleId) => {
  return axiosInstance.delete(`${API_BASE_URL}/role/${roleId}`);
};
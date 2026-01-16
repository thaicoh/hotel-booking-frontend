import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// ✅ Lấy danh sách user (có phân trang)
export const getUsers = (page = 0, size = 10, search = "", role = "", status = "") => {
  let url = `${API_BASE_URL}/users?page=${page}&size=${size}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (role) {
    url += `&role=${encodeURIComponent(role)}`;
  }
  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }

  return axiosInstance.get(url);
};

export const loginApi = (phoneOrEmail, password) => {
  return axiosInstance.post("/auth", {
    phoneOrEmail,
    password,
  });
};


// ✅ Lấy chi tiết 1 user
export const getUserById = (id) => {
  return axiosInstance.get(`${API_BASE_URL}/users/${id}`);
};

// ✅ Tạo user mới
export const createUser = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/users`, data);
};

// ✅ Cập nhật user
export const updateUser = (id, data) => {
  return axiosInstance.put(`${API_BASE_URL}/users/${id}`, data);
};

// ✅ Xóa user
export const deleteUser = (id) => {
  return axiosInstance.delete(`${API_BASE_URL}/users/${id}`);
};


// ✅ Tạo user mới (dành cho admin)
export const createUserAdmin = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/users/admin`, data);
};

// ✅ Cập nhật trạng thái user
export const updateUserStatus = (email, status) => {
  return axiosInstance.patch(`${API_BASE_URL}/users/${email}/status`, {
    status: status,
  });
};

export const getMyInfo = () => {
  return axiosInstance.get(`${API_BASE_URL}/users/me`);
};

// ✅ Đổi mật khẩu
export const changePassword = (data) => {
  // data: { oldPassword, newPassword }
  return axiosInstance.post(`${API_BASE_URL}/users/change-password`, data);
};
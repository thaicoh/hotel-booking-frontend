import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy danh sách tất cả branches
// ===============================
export const getBranches = () => {
  return axiosInstance.get(`${API_BASE_URL}/branch`);
};

// ===============================
// 📌 Lấy chi tiết 1 branch theo ID
// ===============================
export const getBranchById = (branchId) => {
  return axiosInstance.get(`${API_BASE_URL}/branch/${branchId}`);
};

// ===============================
// 📌 Tạo branch mới (multipart/form-data)
// ===============================
export const createBranch = (formData) => {
  console.log("goi ham createBranch")
  return axiosInstance.post(`${API_BASE_URL}/branch`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===============================
// 📌 Cập nhật branch (multipart/form-data)
// ===============================
export const updateBranch = (branchId, formData) => {

  console.log("goi ham updateBranch")

  return axiosInstance.put(`${API_BASE_URL}/branch/${branchId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===============================
// 📌 Xóa branch
// ===============================
export const deleteBranch = (branchId) => {
  return axiosInstance.delete(`${API_BASE_URL}/branch/${branchId}`);
};

// ===============================
// 📌 API phân trang branch
//     GET /branch/paging?page=0&size=10&search=abc
// ===============================
export const getBranchesPaging = (page = 0, size = 10, search = "") => {
  return axiosInstance.get(`${API_BASE_URL}/branch/paging`, {
    params: { page, size, search },
  });
};

// ===============================
// 📌 Cập nhật trạng thái branch (ACTIVE / MAINTENANCE)
// ===============================
export const updateBranchStatus = (branchId, status) => {
  return axiosInstance.put(`${API_BASE_URL}/branch/${branchId}/status`, null, {
    params: { status }, // truyền status qua query param
  });
};
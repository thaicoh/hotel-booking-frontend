// src/api/staff.js
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

/**
 * Lấy thông tin chi nhánh của nhân viên
 */
export const getBranchInfo = () => {
  return axiosInstance.get(`${API_BASE_URL}/staff/my-branch`);
};

export const getMyBranch = () => {
  return axiosInstance.get(`${API_BASE_URL}/staff/my-branch`);
};

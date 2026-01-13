// src/api/statistics.js
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

/**
 * Lấy thống kê doanh thu
 * @param {string} type - "YEARLY", "MONTHLY", "DAILY"
 * @param {number} year - Năm (bắt buộc nếu type là MONTHLY/DAILY)
 * @param {number} month - Tháng (bắt buộc nếu type là DAILY)
 * @param {string} branchId - ID chi nhánh (tùy chọn)
 */
export const getRevenueStatistics = (type, year, month, branchId) => {
  const params = {
    type,
    year,
    month,
    branchId: branchId || null
  };

  // Clean params
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined || params[key] === "") {
      delete params[key];
    }
  });

  return axiosInstance.get(`${API_BASE_URL}/admin/statistics/revenue`, { params });
};
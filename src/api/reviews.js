// src/api/reviews.js
import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Lấy danh sách đánh giá
// GET /reviews/roomtype (Lấy tất cả của branch)
// GET /reviews/roomtype?roomTypeId=X (Lọc theo loại phòng)
// ===============================
export const getReviewsByRoomType = (roomTypeId = null) => {
  let url = `${API_BASE_URL}/reviews/roomtype`;
  
  // Nếu có roomTypeId thì append query param, ngược lại để trống để lấy all
  if (roomTypeId) {
    url += `?roomTypeId=${roomTypeId}`;
  }

  return axiosInstance.get(url);
};


// Gửi đánh giá mới
export const createReview = (data) => {
  // data: { bookingId, rating, comment }
  return axiosInstance.post(`${API_BASE_URL}/reviews`, data);
};

// api/reviews.js
export const getReviewsForAdmin = (branchId = null, roomTypeId = null) => {
  return axiosInstance.get(`${API_BASE_URL}/reviews/admin`, {
    params: { branchId, roomTypeId }
  });
};
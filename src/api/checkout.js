import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

// ===============================
// 📌 Check room availability & price
// ===============================
export const checkRoomAvailability = (payload) => {
  // payload gồm: roomTypeId, bookingTypeCode, checkIn, checkOut, hours
  return axiosInstance.post(`${API_BASE_URL}/checkout/check-room`, payload);
};
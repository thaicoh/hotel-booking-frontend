import axiosInstance from "./axiosInstance";
import { API_BASE_URL } from "../config/api";

export const loginApi = (phoneOrEmail, password) => {
  return axiosInstance.post(`${API_BASE_URL}/auth`, {
    phoneOrEmail,
    password,
  });
};

export const sendOtp = (gmail, phone, password, fullName) => {
  return axiosInstance.post(`${API_BASE_URL}/auth/send-otp`, {
    gmail,
    phone,
    password,
    fullName,
  });
};

export const verifyOtp = (gmail, otp) => {
  return axiosInstance.post(`${API_BASE_URL}/auth/verify-otp`, {
    gmail,
    otp,
  });
};

export const createUser = (fullName, gmail, password, phone) => {
  return axiosInstance.post(`${API_BASE_URL}/users`, {
    fullName,
    email: gmail,
    password,
    phone,
  });
};

import axiosInstance from "./axiosInstance";

export const verifyVnPayPayment = (params) => {
  return axiosInstance.post('/payment/vnpay-callback', params);
};
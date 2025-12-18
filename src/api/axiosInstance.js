import axios from "axios";
import { API_BASE_URL } from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});


// =======================
//  REFRESH TOKEN STATE
// =======================
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}


// =======================
//  REQUEST INTERCEPTOR
// =======================
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    console.log(
      `%c[REQUEST] → ${config.method?.toUpperCase()} ${config.url}`,
      "color: #0ea5e9; font-weight: bold"
    );

     // 🔥 Log toàn bộ request
    console.log("REQUEST DATA:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data
    });


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("[REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// =======================
//  RESPONSE INTERCEPTOR
// =======================
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `%c[SUCCESS] ← ${response.config.method?.toUpperCase()} ${response.config.url}`,
      "color: #22c55e; font-weight: bold"
    );
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    console.error(
      `%c[ERROR] ← ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      "color: #ef4444; font-weight: bold"
    );

        // ============================
    // 1️⃣ LỖI NGHIỆP VỤ (400–499, trừ 401)
    // ============================
    if (error.response && error.response.status !== 401) {

      // 👇 logout nếu tài khoàng bị block
      if (error.response?.data?.code === 1020) {
        console.warn("[USER_LOGIN_LOCKED] → Logout bắt buộc");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error.response);
      }



      return Promise.reject(error.response); // 🔥 Không throw lỗi
    }
    

    // ❗ Nếu lỗi 401 và chưa retry lần nào → thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("%c[TOKEN EXPIRED] → Đang thử refresh token...", "color: orange");

      originalRequest._retry = true;

      if (isRefreshing) {
        console.log("da goi request refresh rồi không gọi lại")

        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;


      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("[NO ACCESS TOKEN] → Không thể refresh");
        return Promise.reject(error);
      }

      try {
        // Backend yêu cầu gửi lại accessToken để refresh
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: accessToken,
        });

        console.log("%c[REFRESH SUCCESS] → Token mới đã được cấp", "color: #22c55e");
        console.log("REFRESH RESPONSE:", res.data);

        const newAccessToken = res.data.result.token;

        // Lưu access token mới
        localStorage.setItem("accessToken", newAccessToken);

         // 🔥 Đánh thức các request đang chờ
        onRefreshed(newAccessToken);

        // Gắn token mới vào request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log(
          `%c[RETRY REQUEST] → ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`,
          "color: #0ea5e9"
        );

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("%c[REFRESH FAILED]", "color: red");
        console.log("REFRESH ERROR:", refreshError.response);

        console.error("[REFRESH FAILED → UNAUTHENTICATED] → Logout");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
      finally {
        isRefreshing = false;
      }

    }

    // ❗ Nếu đã retry rồi mà vẫn 401 → lúc này mới logout
    if (error.response?.status === 401 && originalRequest._retry) {
      console.error("[UNAUTHORIZED AFTER RETRY] → Logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
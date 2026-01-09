import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// ✅ Fix URL khi deploy GitHub Pages (spa-github-pages + case bị đổi & -> ?)
(function normalizeGithubPagesUrl() {
  const l = window.location;

  // A) Nếu query bị dính nhiều dấu "?" (vd: ?a=1?b=2?c=3) -> đổi ? sau thành &
  if ((l.search.match(/\?/g) || []).length > 1) {
    const fixedSearch = "?" + l.search.slice(1).replace(/\?/g, "&");
    window.history.replaceState(null, "", l.pathname + fixedSearch + l.hash);
    return;
  }

  // B) Nếu đang ở dạng spa-github-pages: /?/<route>&<query>
  // ví dụ: /hotel-booking-frontend/?/detail&bookingTypeCode=HOUR&hotelId=...
  if (l.search.startsWith("?/")) {
    const raw = l.search.slice(2);              // bỏ "?/"
    const cleaned = raw.replace(/~and~/g, "&"); // nếu bạn có dùng ~and~ để encode &
    const parts = cleaned.split("&");

    const route = parts.shift() || "";          // "detail"
    const qs = parts.join("&");                 // "bookingTypeCode=HOUR&hotelId=..."
    const base = l.pathname.replace(/\/$/, ""); // "/hotel-booking-frontend"
    const newUrl = base + "/" + route + (qs ? "?" + qs : "") + l.hash;

    window.history.replaceState(null, "", newUrl);
  }
})();


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

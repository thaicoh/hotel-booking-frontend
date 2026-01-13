import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DailyBookingPicker from "./DailyBookingPicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SearchBar = () => {
  const navigate = useNavigate();

  // --- GIỮ NGUYÊN TOÀN BỘ LOGIC ---
  const mapBookingTypeCode = (type) => {
    if (type === "hourly") return "HOUR";
    if (type === "overnight") return "NIGHT";
    return "DAY";
  };

  const [bookingType, setBookingType] = useState("hourly");
  const [location, setLocation] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [duration, setDuration] = useState("");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const maxDate = oneMonthLater.toISOString().split("T")[0];

  const getNextDay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const formatDDMMYYYY = (ymd) => {
    if (!ymd) return "Bất kỳ";
    const [y, m, d] = ymd.split("-");
    if (!y || !m || !d) return "Bất kỳ";
    return `${d}/${m}/${y}`;
  };

  const toYMD = (d) => d.toISOString().split("T")[0];
  const fromYMD = (s) => (s ? new Date(s) : null);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const formatLocalDateTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingTypeCode = mapBookingTypeCode(bookingType);
    const params = new URLSearchParams();
    if (bookingTypeCode) params.set("bookingTypeCode", bookingTypeCode);
    if (location?.trim()) params.set("location", location.trim());

    if (bookingType === "hourly") {
      if (checkInDate && checkInTime) {
        const checkInStr = `${checkInDate}T${checkInTime}:00`;
        params.set("checkInDate", checkInStr);
        params.set("checkInTime", checkInTime);
      }
      if (duration) params.set("hours", String(Number(duration)));
    }

    if (bookingType === "overnight") {
      if (checkInDate) {
        const onlyDate = checkInDate.split("T")[0];
        const checkInObj = new Date(`${onlyDate}T21:00:00`);
        params.set("checkInDate", formatLocalDateTime(checkInObj));
        const nextDay = getNextDay(onlyDate);
        const checkOutObj = new Date(`${nextDay}T12:00:00`);
        params.set("checkOutDate", formatLocalDateTime(checkOutObj));
      }
    }

    if (bookingType === "daily") {
      if (checkInDate) {
        const onlyDateIn = checkInDate.split("T")[0];
        const checkInObj = new Date(`${onlyDateIn}T14:00:00`);
        params.set("checkInDate", formatLocalDateTime(checkInObj));
      }
      if (checkOutDate) {
        const onlyDateOut = checkOutDate.split("T")[0];
        const checkOutObj = new Date(`${onlyDateOut}T12:00:00`);
        params.set("checkOutDate", formatLocalDateTime(checkOutObj));
      }
    }
    navigate(`/search?${params.toString()}`);
  };

  // --- GIAO DIỆN MỚI ---
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
        
        {/* Tab Selection */}
        <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100 rounded-t-[2.5rem]">
          {[
            { id: "hourly", label: "Theo giờ", icon: "https://go2joy.vn/_nuxt/hourly-icon.03d69c6d.svg" },
            { id: "overnight", label: "Qua đêm", icon: "https://go2joy.vn/_nuxt/overnight-icon.102a4f3c.svg" },
            { id: "daily", label: "Theo ngày", icon: "https://go2joy.vn/_nuxt/daily-icon.0b47246e.svg" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBookingType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all duration-300 ${
                bookingType === tab.id
                  ? "bg-white shadow-md scale-[1.02] text-orange-600"
                  : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-700"
              }`}
            >
              <img src={tab.icon} alt={tab.id} className={`w-6 h-6 ${bookingType === tab.id ? "" : "grayscale"}`} />
              <span className="font-bold text-sm md:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Location Input */}
            <div className="md:col-span-4 group">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Địa điểm</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-300"
                  placeholder="Bạn muốn nghỉ ở đâu?"
                />
              </div>
            </div>

            {/* Dynamic Inputs based on Booking Type */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bookingType === "hourly" && (
                <>
                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày nhận</label>
                    <DatePicker
                      selected={fromYMD(checkInDate)}
                      onChange={(date) => setCheckInDate(date ? toYMD(date) : "")}
                      minDate={today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Chọn ngày"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Giờ nhận</label>
                    <select
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Chọn giờ</option>
                      {["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Thời lượng</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Số giờ</option>
                      {[1,2,3,4,5,6].map((h) => (
                        <option key={h} value={h}>{h} giờ</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {bookingType === "overnight" && (
                <>
                  <div className="sm:col-span-2 relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày nhận phòng</label>
                    <DatePicker
                      selected={fromYMD(checkInDate)}
                      onChange={(date) => {
                        const ymd = date ? toYMD(date) : "";
                        setCheckInDate(ymd);
                        setCheckOutDate(getNextDay(ymd));
                      }}
                      minDate={today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Nhận phòng đêm nay"
                    />
                  </div>
                  <div className="relative group opacity-60">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Trả phòng (Tự động)</label>
                    <div className="w-full bg-gray-100 border-none rounded-2xl px-4 py-4 font-bold text-gray-500 flex items-center h-[56px]">
                      {checkOutDate ? formatDDMMYYYY(checkOutDate) : "--/--/----"}
                    </div>
                  </div>
                </>
              )}

              {bookingType === "daily" && (
                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Thời gian lưu trú</label>
                  <div className="bg-gray-50 rounded-2xl">
                    <DailyBookingPicker
                      checkInDate={checkInDate}
                      setCheckInDate={setCheckInDate}
                      checkOutDate={checkOutDate}
                      setCheckOutDate={setCheckOutDate}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Ngày giờ bất kỳ
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Tìm kiếm ngay
            </button>
          </div>
        </form>

        {/* Summary Info - Now more subtle */}
        <div className="bg-orange-50/50 px-8 py-4 flex flex-wrap gap-x-8 gap-y-2 text-xs rounded-b-[2.5rem]">
           <div className="flex items-center gap-2">
             <span className="text-gray-400 font-medium">Lựa chọn:</span>
             <span className="text-orange-700 font-bold">{bookingType === 'hourly' ? 'Theo giờ' : bookingType === 'overnight' ? 'Qua đêm' : 'Theo ngày'}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-gray-400 font-medium">Tại:</span>
             <span className="text-orange-700 font-bold">{location || "Toàn quốc"}</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-gray-400 font-medium">Lịch:</span>
             <span className="text-orange-700 font-bold">{formatDDMMYYYY(checkInDate)} {checkInTime ? `- ${checkInTime}` : ''}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
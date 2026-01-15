import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SearchBar = () => {
  const navigate = useNavigate();

  // --- CONFIG ---
  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  // --- STATE ---
  const [bookingType, setBookingType] = useState("hourly"); // hourly | overnight | daily
  const [location, setLocation] = useState("");
  
  // State chung cho việc chọn ngày (Lưu chuỗi 'YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState(""); 
  const [selectedEndDate, setSelectedEndDate] = useState(""); // Dùng riêng cho Daily

  // State riêng cho Hourly
  const [checkInTime, setCheckInTime] = useState(""); // "14:00"
  const [duration, setDuration] = useState(""); // số giờ (int)

  // --- HELPERS ---

  // Chuyển Date object -> 'YYYY-MM-DD' (Local Time)
  const toLocalISOString = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Chuyển 'YYYY-MM-DD' -> Date object
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Tính ngày hôm sau
  const getNextDayString = (dateString) => {
    if (!dateString) return "";
    const date = parseDateString(dateString);
    date.setDate(date.getDate() + 1);
    return toLocalISOString(date);
  };

  // Tính thời gian checkout cho Hourly
  const calculateHourlyCheckout = (dateStr, timeStr, hours) => {
    if (!dateStr || !timeStr || !hours) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const date = parseDateString(dateStr);
    date.setHours(h + parseInt(hours), m, 0); 
    
    // Format thành YYYY-MM-DDTHH:mm:ss
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${mo}-${d}T${hh}:${mm}:00`;
  };

  const formatDDMMYYYY = (ymd) => {
    if (!ymd) return "----/--/--";
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
  };

  // --- HANDLE SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // 1. Loại đặt phòng
    let code = "DAY";
    if (bookingType === "hourly") code = "HOUR";
    if (bookingType === "overnight") code = "NIGHT";
    params.set("bookingTypeCode", code);

    // 2. Địa điểm
    if (location?.trim()) params.set("location", location.trim());

    // 3. Xử lý ngày giờ
    if (selectedDate) {
      if (bookingType === "hourly") {
        if (checkInTime && duration) {
          // Check-in Full: Ngày chọn + Giờ chọn
          const fullCheckIn = `${selectedDate}T${checkInTime}:00`;
          params.set("checkInDate", fullCheckIn);
          
          // Check-out Full: Tự tính
          const fullCheckOut = calculateHourlyCheckout(selectedDate, checkInTime, duration);
          params.set("checkOutDate", fullCheckOut);
          
          // Gửi thêm params riêng lẻ
          params.set("hours", duration);
          params.set("checkInTime", checkInTime); // <--- ĐÃ THÊM LẠI DÒNG NÀY
        }
      } 
      else if (bookingType === "overnight") {
        const fullCheckIn = `${selectedDate}T21:00:00`;
        params.set("checkInDate", fullCheckIn);

        const nextDay = getNextDayString(selectedDate);
        const fullCheckOut = `${nextDay}T12:00:00`;
        params.set("checkOutDate", fullCheckOut);
      } 
      else if (bookingType === "daily") {
        const fullCheckIn = `${selectedDate}T14:00:00`;
        params.set("checkInDate", fullCheckIn);

        if (selectedEndDate) {
          const fullCheckOut = `${selectedEndDate}T12:00:00`;
          params.set("checkOutDate", fullCheckOut);
        }
      }
    }

    // Navigate
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100">
        
        {/* --- TABS --- */}
        <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100 rounded-t-[2.5rem]">
          {[
            { id: "hourly", label: "Theo giờ", icon: "https://go2joy.vn/_nuxt/hourly-icon.03d69c6d.svg" },
            { id: "overnight", label: "Qua đêm", icon: "https://go2joy.vn/_nuxt/overnight-icon.102a4f3c.svg" },
            { id: "daily", label: "Theo ngày", icon: "https://go2joy.vn/_nuxt/daily-icon.0b47246e.svg" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setBookingType(tab.id);
                // Reset fields
                setSelectedDate("");
                setSelectedEndDate("");
                setCheckInTime("");
                setDuration("");
              }}
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

        {/* --- FORM --- */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* 1. LOCATION */}
            <div className="md:col-span-4 group">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Địa điểm</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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

            {/* 2. INPUTS */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* --- HOURLY --- */}
              {bookingType === "hourly" && (
                <>
                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày nhận phòng</label>
                    <DatePicker
                      selected={parseDateString(selectedDate)}
                      onChange={(date) => setSelectedDate(toLocalISOString(date))}
                      minDate={today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Chọn ngày"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">
                      Giờ nhận
                    </label>
                    <select
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Chọn giờ</option>
                      {Array.from({ length: 9 }).map((_, i) => {
                        const hour = i + 13; // bắt đầu từ 12h
                        const h = String(hour).padStart(2, "0");
                        return (
                          <option key={hour} value={`${h}:00`}>
                            {h}:00
                          </option>
                        );
                      })}
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
                      {[1, 2, 3, 4, 5].map((h) => (
                        <option key={h} value={h}>{h} giờ</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* --- OVERNIGHT --- */}
              {bookingType === "overnight" && (
                <>
                  <div className="sm:col-span-2 relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày nhận phòng (21:00)</label>
                    <DatePicker
                      selected={parseDateString(selectedDate)}
                      onChange={(date) => setSelectedDate(toLocalISOString(date))}
                      minDate={today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Chọn đêm nghỉ"
                    />
                  </div>
                  <div className="relative group opacity-70">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Trả phòng (12:00 hôm sau)</label>
                    <div className="w-full bg-gray-100 border-none rounded-2xl px-4 py-4 font-bold text-gray-500 flex items-center h-[56px]">
                      {selectedDate ? formatDDMMYYYY(getNextDayString(selectedDate)) : "--/--/----"}
                    </div>
                  </div>
                </>
              )}

              {/* --- DAILY --- */}
              {bookingType === "daily" && (
                <>
                   <div className="relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày nhận (14:00)</label>
                    <DatePicker
                      selected={parseDateString(selectedDate)}
                      onChange={(date) => {
                          const dateStr = toLocalISOString(date);
                          setSelectedDate(dateStr);
                          if(selectedEndDate && dateStr >= selectedEndDate) setSelectedEndDate("");
                      }}
                      minDate={today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Từ ngày"
                    />
                  </div>

                  <div className="sm:col-span-2 relative group">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-4 tracking-wider">Ngày trả (12:00)</label>
                    <DatePicker
                      selected={parseDateString(selectedEndDate)}
                      onChange={(date) => setSelectedEndDate(toLocalISOString(date))}
                      minDate={selectedDate ? parseDateString(getNextDayString(selectedDate)) : today}
                      maxDate={oneMonthLater}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                      wrapperClassName="w-full"
                      placeholderText="Đến ngày"
                      disabled={!selectedDate}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Hủy bỏ / Mặc định
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Tìm kiếm ngay
            </button>
          </div>
        </form>

        {/* --- SUMMARY --- */}
        <div className="bg-orange-50/50 px-8 py-4 flex flex-wrap gap-x-8 gap-y-2 text-xs rounded-b-[2.5rem]">
           <div className="flex items-center gap-2">
             <span className="text-gray-400 font-medium">Lựa chọn:</span>
             <span className="text-orange-700 font-bold">
                {bookingType === 'hourly' ? 'Theo giờ' : bookingType === 'overnight' ? 'Qua đêm' : 'Theo ngày'}
             </span>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-gray-400 font-medium">Lịch trình:</span>
             <span className="text-orange-700 font-bold">
                {selectedDate ? formatDDMMYYYY(selectedDate) : "Chưa chọn ngày"}
                {bookingType === 'hourly' && checkInTime ? ` lúc ${checkInTime}` : ''}
                {bookingType === 'daily' && selectedEndDate ? ` ➝ ${formatDDMMYYYY(selectedEndDate)}` : ''}
             </span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SearchBar;
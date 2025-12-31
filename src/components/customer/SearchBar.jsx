import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DailyBookingPicker from "./DailyBookingPicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const SearchBar = () => {

  const navigate = useNavigate();

  const mapBookingTypeCode = (type) => {
    if (type === "hourly") return "HOUR";
    if (type === "overnight") return "NIGHT";
    return "DAY";
  };

  const [bookingType, setBookingType] = useState("hourly"); // mặc định theo giờ
  const [location, setLocation] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [duration, setDuration] = useState("");

  // Tính ngày hôm nay và ngày sau 1 tháng
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const maxDate = oneMonthLater.toISOString().split("T")[0];

  // Tính ngày hôm sau cho overnight
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

  // Date -> "YYYY-MM-DD"
  const toYMD = (d) => d.toISOString().split("T")[0];

  // "YYYY-MM-DD" -> Date
  const fromYMD = (s) => (s ? new Date(s) : null);


  // SearchBar state
  const [checkInDate, setCheckInDate] = useState("");   // "YYYY-MM-DD"
  const [checkOutDate, setCheckOutDate] = useState(""); // "YYYY-MM-DD"

  // render thông tin
  const showDate = (s) => s || "Bất kỳ";



  const formatDate = (date) =>
    date instanceof Date ? date.toLocaleDateString("vi-VN") : "Bất kỳ";


  const handleSubmit = (e) => {
    e.preventDefault();

    const bookingTypeCode = mapBookingTypeCode(bookingType);

    const params = new URLSearchParams();

    // common
    if (bookingTypeCode) params.set("bookingTypeCode", bookingTypeCode);
    if (location?.trim()) params.set("location", location.trim());

    // booking-type specific
    if (bookingType === "hourly") {
      if (checkInDate) params.set("checkInDate", checkInDate); // YYYY-MM-DD
      if (checkInTime) params.set("checkInTime", checkInTime); // HH:mm
      if (duration) params.set("hours", String(Number(duration)));
    }

    if (bookingType === "overnight") {
      if (checkInDate) params.set("checkInDate", checkInDate);
      // checkOutDate bạn auto set hôm sau
      if (checkOutDate) params.set("checkOutDate", checkOutDate);
    }

    if (bookingType === "daily") {
      if (checkInDate) params.set("checkInDate", checkInDate);
      if (checkOutDate) params.set("checkOutDate", checkOutDate);
    }

    // (tuỳ chọn) minPrice/maxPrice nếu bạn có ở SearchBar
    // if (minPrice) params.set("minPrice", String(minPrice));
    // if (maxPrice) params.set("maxPrice", String(maxPrice));

    navigate(`/search?${params.toString()}`);
  };



  // gộp date + time => "YYYY-MM-DDTHH:mm:00"
  const combineDateTime = (ymd, hhmm) => {
    if (!ymd || !hhmm) return null;
    return `${ymd}T${hhmm}:00`;
  };


  return (
    <div className="relative z-10 -translate-y-16 md:-translate-y-24">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg px-6 md:px-12 py-8">
        {/* Tabs */}
        <ul className="flex items-center justify-center mb-8 space-x-8">
          <li
            className={`cursor-pointer text-center px-4 py-2 rounded-md ${
              bookingType === "hourly"
                ? "bg-orange-300 text-white"
                : "text-gray-700 hover:text-orange-600"
            }`}
            onClick={() => setBookingType("hourly")}
          >

            <img
              width="24"
              height="24"
              alt="hourly-icon"
              src="https://go2joy.vn/_nuxt/hourly-icon.03d69c6d.svg"
              className="mx-auto mb-2"
            />
            <p className="font-bold">Theo giờ</p>
          </li>
          <li
            className={`cursor-pointer text-center px-4 py-2 rounded-md ${
              bookingType === "overnight"
                ? "bg-orange-300 text-white"
                : "text-gray-700 hover:text-orange-600"
            }`}
            onClick={() => setBookingType("overnight")}
          >

            <img
              width="24"
              height="24"
              alt="overnight-icon"
              src="https://go2joy.vn/_nuxt/overnight-icon.102a4f3c.svg"
              className="mx-auto mb-2"
            />
            <p className="font-bold">Qua đêm</p>
          </li>
          <li
            className={`cursor-pointer text-center px-4 py-2 rounded-md ${
              bookingType === "daily"
                ? "bg-orange-300 text-white"
                : "text-gray-700 hover:text-orange-600"
            }`}
            onClick={() => setBookingType("daily")}
          >

            <img
              width="24"
              height="24"
              alt="daily-icon"
              src="https://go2joy.vn/_nuxt/daily-icon.0b47246e.svg"
              className="mx-auto mb-2"
            />
            <p className="font-bold">Theo ngày</p>
          </li>
        </ul>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            {/* Location */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 font-semibold placeholder-gray-400"
                placeholder="Bạn muốn đi đâu?"
              />
            </div>

            {bookingType === "hourly" && (
              <>
                {/* Ngày nhận phòng */}
                <div className="flex-1 relative">
                <DatePicker
                  selected={fromYMD(checkInDate)}
                  onChange={(date) => setCheckInDate(date ? toYMD(date) : "")}
                  minDate={today}
                  maxDate={oneMonthLater}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Nhận phòng"
                  className="w-full border rounded-lg px-4 py-3 font-semibold placeholder-gray-400"
                  wrapperClassName="w-full"
                />


                </div>

                {/* Giờ nhận phòng */}
                <div className="flex-1 relative">
                  <select
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 font-semibold"
                  >
                    <option value="">Chọn giờ nhận phòng</option>
                    {[
                      "08:00","09:00","10:00","11:00","12:00",
                      "13:00","14:00","15:00","16:00","17:00",
                      "18:00","19:00","20:00","21:00","22:00",
                    ].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Số giờ sử dụng */}
                <div className="flex-1 relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border rounded-lg px-4 py-3 font-semibold"
                  >
                    <option value="">Chọn số giờ</option>
                    {[1,2,3,4,5,6].map((hour) => (
                      <option key={hour} value={hour}>{hour} giờ</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {bookingType === "overnight" && (
              <>
                {/* Ngày nhận phòng */}
                <div className="flex-1 relative">
                <DatePicker
                  selected={fromYMD(checkInDate)}
                  onChange={(date) => {
                    const ymd = date ? toYMD(date) : "";
                    setCheckInDate(ymd);
                    setCheckOutDate(getNextDay(ymd)); // giữ logic cũ: tự set ngày hôm sau
                  }}
                  minDate={today}
                  maxDate={oneMonthLater}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Nhận phòng"
                  className="w-full border rounded-lg px-4 py-3 font-semibold"
                  wrapperClassName="w-full"
                />

                </div>

                {/* Ngày trả phòng (readonly, tự động) */}
                <div className="flex-1 relative">
                  <DatePicker
                    selected={fromYMD(checkOutDate)}
                    onChange={() => {}}
                    dateFormat="dd/MM/yyyy"
                    disabled
                    placeholderText="Trả phòng"
                    className="w-full border rounded-lg px-4 py-3 font-semibold bg-gray-100"
                    wrapperClassName="w-full"
                  />

                </div>
              </>
            )}

            {bookingType === "daily" && (
              <div className="flex-1 w-full relative">
                <DailyBookingPicker
                  checkInDate={checkInDate}
                  setCheckInDate={setCheckInDate}
                  checkOutDate={checkOutDate}
                  setCheckOutDate={setCheckOutDate}
                />
              </div>
            )}



          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center border-t pt-4">
            <button
              type="button"
              className="px-6 py-2 border rounded-lg text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Ngày giờ bất kỳ
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        </form>

        {/* Hiển thị thông tin đang chọn */}
        <div className="mt-6 bg-gray-50 border rounded-lg p-4 space-y-2">
          <p>
            <span className="font-semibold">Loại đặt phòng:</span>{" "}
            {bookingType === "hourly"
              ? "Theo giờ"
              : bookingType === "overnight"
              ? "Qua đêm"
              : "Theo ngày"}
          </p>

          <p>
            <span className="font-semibold">Địa điểm:</span>{" "}
            {location || "Bất kỳ"}
          </p>

          {bookingType === "hourly" && (
            <>
              <p>
                <span className="font-semibold">Ngày nhận phòng:</span>{" "}
                {formatDDMMYYYY(checkInDate)}

              </p>
              <p>
                <span className="font-semibold">Giờ nhận phòng:</span>{" "}
                {checkInTime || "Bất kỳ"}
              </p>
              <p>
                <span className="font-semibold">Số giờ sử dụng:</span>{" "}
                {duration || "Bất kỳ"}
              </p>
            </>
          )}

          {bookingType === "overnight" && (
            <>
              <p>
                <span className="font-semibold">Ngày nhận phòng:</span>{" "}
               {formatDDMMYYYY(checkInDate)}

              </p>
              <p>
                <span className="font-semibold">Giờ nhận phòng:</span> 21:00
              </p>
              <p>
                <span className="font-semibold">Giờ trả phòng:</span> 12:00 ngày hôm sau
              </p>
            </>
          )}

          {bookingType === "daily" && (
            <>
              <p><span className="font-semibold">Ngày nhận phòng:</span> {formatDDMMYYYY(checkInDate)}</p>
              <p><span className="font-semibold">Giờ nhận phòng:</span> 14:00</p>
              <p><span className="font-semibold">Ngày trả phòng:</span> {formatDDMMYYYY(checkOutDate)}</p>
              <p><span className="font-semibold">Giờ trả phòng:</span> 12:00</p>
            </>
          )}

        </div>

      </div>
    </div>
  );



};





export default SearchBar;
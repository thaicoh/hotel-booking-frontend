import React, { useState } from "react";

const SearchBar = () => {
  const [location, setLocation] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tìm kiếm với thông tin: ", {
      location,
      checkInDate,
      checkOutDate,
    });
  };

  return (
    <div className="relative z-10 -translate-y-16 md:-translate-y-24">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg px-6 md:px-12 py-8">
        {/* Tabs */}
        <ul className="flex items-center justify-center mb-8 space-x-8">
          <li className="cursor-pointer hover:text-blue-600 text-center">
            <img
              width="24"
              height="24"
              alt="hourly-icon"
              src="https://go2joy.vn/_nuxt/hourly-icon.03d69c6d.svg"
              className="mx-auto mb-2"
            />
            <p className="font-bold">Theo giờ</p>
          </li>
          <li className="cursor-pointer hover:text-blue-600 text-center">
            <img
              width="24"
              height="24"
              alt="overnight-icon"
              src="https://go2joy.vn/_nuxt/overnight-icon.102a4f3c.svg"
              className="mx-auto mb-2"
            />
            <p className="font-bold">Qua đêm</p>
          </li>
          <li className="cursor-pointer text-blue-600 text-center">
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

            {/* Check-in */}
            <div className="flex-1 relative">
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 font-semibold placeholder-gray-400"
                placeholder="Nhận phòng"
              />
            </div>

            {/* Check-out */}
            <div className="flex-1 relative">
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 font-semibold placeholder-gray-400"
                placeholder="Trả phòng"
              />
            </div>
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
      </div>
    </div>
  );
};

export default SearchBar;
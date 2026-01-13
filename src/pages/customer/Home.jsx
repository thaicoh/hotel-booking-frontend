import React, { useState } from "react";

import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/customer/SearchBar";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // mặc định là theo giờ
  const [bookingType, setBookingType] = useState("hourly");
  const [checkInTime, setCheckInTime] = useState("");
  const [duration, setDuration] = useState("");



  useEffect(() => {
    if (user && user.roles?.includes("ADMIN")) {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[246px] pt-6 overflow-hidden">
        <div
          className="w-full h-full max-w-7xl mx-auto bg-cover bg-center rounded-xl"
          style={{
            backgroundImage:
              "url('https://s3.go2joy.vn/350w/cover_photo/8707_1764657448_692e89284b64f.webp')",
          }}
        ></div>
      </section>

      {/* SearchBar đè lên phần dưới banner */}
      <div className="relative z-30 w-full flex justify-center">
        <div className="w-[90%] md:w-2/3">
          <SearchBar />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Khách sạn có gì?</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <img
              src="https://go2joy.vn/_nuxt/location-icon.26689bb5.svg"
              alt="location"
              className="w-6 h-6"
            />
            <span>Khu vực: Hồ Chí Minh</span>
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl shadow-lg p-6 bg-orange-50 hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Khách sạn theo giờ</h3>
            <p className="text-gray-600 mt-2">Xịn từng phút giây</p>
            <div className="flex justify-end mt-4">
              <img src="https://go2joy.vn/images/home_hourly.svg" alt="hourly" className="w-12 h-12" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl shadow-lg p-6 bg-purple-50 hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Khách sạn qua đêm</h3>
            <p className="text-gray-600 mt-2">Ngon giấc như ở nhà</p>
            <div className="flex justify-end mt-4">
              <img src="https://go2joy.vn/images/home_overnight.svg" alt="overnight" className="w-12 h-12" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl shadow-lg p-6 bg-blue-50 hover:scale-105 transition">
            <h3 className="text-lg font-semibold">Khách sạn theo ngày</h3>
            <p className="text-gray-600 mt-2">Mỗi ngày 1 niềm vui</p>
            <div className="flex justify-end mt-4">
              <img src="https://go2joy.vn/images/home_daily.svg" alt="daily" className="w-12 h-12" />
            </div>
          </div>
        </div>
      </section>


    </div>
  );

  
}

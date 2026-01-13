import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/customer/SearchBar";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Giữ nguyên logic state
  const [bookingType, setBookingType] = useState("hourly");
  const [checkInTime, setCheckInTime] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (user && user.roles?.includes("ADMIN")) {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      {/* --- HERO SECTION --- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative h-[300px] md:h-[400px] w-full max-w-7xl mx-auto overflow-hidden rounded-[2rem] shadow-2xl">
          {/* Overlay gradient để text và search bar nổi bật hơn */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
          
          <div
            className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-1000"
            style={{
              backgroundImage:
                "url('https://s3.go2joy.vn/350w/cover_photo/8707_1764657448_692e89284b64f.webp')",
            }}
          />
          
        </div>
      </section>

      {/* --- SEARCHBAR SECTION --- */}
      {/* Đẩy lên cao để đè lên banner một cách mượt mà */}
      <div className="relative z-30 -mt-12 md:-mt-20 px-4">
        <div className="max-w-5xl mx-auto">
            <SearchBar />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              Khách sạn có gì?
            </h2>
            <div className="h-1 w-20 bg-orange-500 mt-2 rounded-full"></div>
          </div>
          
          <button className="group flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <img
                src="https://go2joy.vn/_nuxt/location-icon.26689bb5.svg"
                alt="location"
                className="w-5 h-5"
                />
            </div>
            <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Khu vực</p>
                <span className="text-sm font-bold text-gray-700">Hồ Chí Minh</span>
            </div>
          </button>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Hourly */}
          <div className="group relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-500 cursor-pointer">
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase mb-4 shadow-sm">Hot</span>
                <h3 className="text-2xl font-bold text-orange-900">Theo giờ</h3>
                <p className="text-orange-700/70 mt-2 font-medium">Xịn từng phút giây, giá rẻ bất ngờ</p>
                <div className="mt-8 flex items-center gap-2 text-orange-600 font-bold group-hover:gap-4 transition-all">
                    <span>Đặt ngay</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <img 
              src="https://go2joy.vn/images/home_hourly.svg" 
              alt="hourly" 
              className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" 
            />
          </div>

          {/* Card 2: Overnight */}
          <div className="group relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-500 cursor-pointer">
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-500 text-white text-[10px] font-bold uppercase mb-4 shadow-sm">Popular</span>
                <h3 className="text-2xl font-bold text-purple-900">Qua đêm</h3>
                <p className="text-purple-700/70 mt-2 font-medium">Ngon giấc như ở nhà, tràn đầy năng lượng</p>
                <div className="mt-8 flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
                    <span>Khám phá</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <img 
              src="https://go2joy.vn/images/home_overnight.svg" 
              alt="overnight" 
              className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" 
            />
          </div>

          {/* Card 3: Daily */}
          <div className="group relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 cursor-pointer">
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase mb-4 shadow-sm">Best Value</span>
                <h3 className="text-2xl font-bold text-blue-900">Theo ngày</h3>
                <p className="text-blue-700/70 mt-2 font-medium">Mỗi ngày 1 niềm vui, hành trình trọn vẹn</p>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                    <span>Xem ngay</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <img 
              src="https://go2joy.vn/images/home_daily.svg" 
              alt="daily" 
              className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}
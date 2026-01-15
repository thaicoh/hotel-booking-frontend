import React from 'react';
import { 
  FaFacebook, FaInstagram, FaTiktok, FaYoutube, 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt 
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t text-gray-600 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        
        {/* Grid chia cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Cột 1: Hỗ trợ */}
          <div className="space-y-4">
            <h3 className="text-gray-900 font-bold text-lg uppercase tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <FaPhoneAlt size={12} />
                </div>
                <span className="group-hover:text-orange-600 font-medium">1900 638 838</span>
              </li>
              <li className="flex items-center gap-3 group cursor-pointer text-gray-500">
                <FaEnvelope className="text-gray-400 group-hover:text-orange-500" />
                <span className="group-hover:text-gray-800">cskh@go2joy.vn</span>
              </li>
              <li className="hover:text-orange-600 transition-colors cursor-pointer">Giải quyết tranh chấp</li>
              <li className="hover:text-orange-600 transition-colors cursor-pointer">Câu hỏi thường gặp</li>
            </ul>
          </div>

          {/* Cột 2: Giới thiệu */}
          <div className="space-y-4">
            <h3 className="text-gray-900 font-bold text-lg uppercase tracking-wider">Giới thiệu</h3>
            <ul className="space-y-3 text-sm">
              {['Về chúng tôi', 'Trang blog', 'Quy chế hoạt động', 'Cơ hội nghề nghiệp', 'Dành cho đối tác'].map((item) => (
                <li key={item} className="hover:text-orange-600 transition-colors cursor-pointer w-fit">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Đối tác & Tải app */}
          <div className="space-y-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg uppercase tracking-wider mb-4">Thanh toán</h3>
              <div className="flex flex-wrap gap-2 uppercase font-bold text-[10px]">
                <span className="px-2 py-1 border rounded bg-white shadow-sm">MoMo</span>
                <span className="px-2 py-1 border rounded bg-white shadow-sm text-blue-600">ZaloPay</span>
                <span className="px-2 py-1 border rounded bg-white shadow-sm text-blue-800">Visa</span>
              </div>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold text-lg uppercase tracking-wider mb-4">Tải ứng dụng</h3>
              <div className="flex gap-4 items-center">
                <div className="bg-white p-1 border rounded-lg shadow-sm">
                  <img src="/images/qr.png" alt="QR" className="w-16 h-16 object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <button className="hover:opacity-80 transition-opacity">
                    <img src="/images/appstore.png" alt="App Store" className="w-28 h-auto" />
                  </button>
                  <button className="hover:opacity-80 transition-opacity">
                    <img src="/images/googleplay.png" alt="Google Play" className="w-28 h-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 4: Thông tin công ty */}
          <div className="space-y-4">
            <h3 className="text-gray-900 font-bold text-lg uppercase tracking-wider">Công ty</h3>
            <div className="text-sm space-y-3 leading-relaxed">
              <p className="font-bold text-gray-800">CÔNG TY CỔ PHẦN GO2JOY VIỆT NAM</p>
              <p className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-orange-500 shrink-0" />
                <span>5A/2 Trần Phú, Quận 5, TP.Hồ Chí Minh</span>
              </p>
              <div className="pt-2 text-xs text-gray-500 space-y-1">
                <p>MST: 0311850218</p>
                <p>Đại diện: BYUN SUNG MIN</p>
                <p>Ngày đăng ký: 11/06/2012</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-xs text-gray-400 text-center md:text-left">
              <p>© 2026 GO2JOY Vietnam, Jsc. All rights reserved.</p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1">
                <a href="#" className="hover:text-orange-600 underline">Điều khoản</a>
                <a href="#" className="hover:text-orange-600 underline">Bảo mật</a>
                <a href="#" className="hover:text-orange-600 underline">Sơ đồ trang web</a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { icon: <FaFacebook />, link: "#", color: "hover:text-blue-600" },
                { icon: <FaInstagram />, link: "#", color: "hover:text-pink-600" },
                { icon: <FaTiktok />, link: "#", color: "hover:text-black" },
                { icon: <FaYoutube />, link: "#", color: "hover:text-red-600" },
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.link} 
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm transition-all duration-300 ${social.color} hover:-translate-y-1 hover:shadow-md text-gray-500`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default function Footer() {
  return (
    <footer className="bg-white border-t text-gray-700">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Grid chia cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Hỗ trợ */}
          <div>
            <h3 className="font-semibold mb-3">Hỗ trợ</h3>
            <ul className="space-y-1 text-sm">
              <li>📞 Hotline: 1900 638 838</li>
              <li>CSKH: cskh@go2joy.vn</li>
              <li>Hợp tác: support@go2joy.vn</li>
              <li className="underline cursor-pointer">Giải quyết tranh chấp</li>
            </ul>
          </div>

          {/* Giới thiệu */}
          <div>
            <h3 className="font-semibold mb-3">Giới thiệu</h3>
            <ul className="space-y-1 text-sm">
              <li>Về chúng tôi</li>
              <li>Trang blog</li>
              <li>Quy chế hoạt động</li>
              <li>Cơ hội nghề nghiệp</li>
              <li>Dành cho đối tác</li>
            </ul>
          </div>

          {/* Đối tác & Tải app */}
          <div>
            <h3 className="font-semibold mb-3">Đối tác thanh toán</h3>
            <p className="text-sm">MoMo, ZaloPay, VISA</p>

            <h3 className="font-semibold mt-4 mb-3">Tải ứng dụng</h3>
            <div className="flex gap-3 items-start">
              <img src="/images/qr.png" alt="QR" className="w-16 h-16" />
              <div className="flex flex-col gap-2">
                <img src="/images/appstore.png" alt="App Store" className="w-24" />
                <img src="/images/googleplay.png" alt="Google Play" className="w-24" />
              </div>
            </div>
          </div>

          {/* Thông tin công ty */}
          <div>
            <h3 className="font-semibold mb-3">Thông tin công ty</h3>
            <ul className="space-y-1 text-sm">
              <li>CÔNG TY CỔ PHẦN GO2JOY VIỆT NAM</li>
              <li>Địa chỉ: 5A/2 Trần Phú, Quận 5, TP.HCM</li>
              <li>Đại diện: BYUN SUNG MIN – Tổng Giám đốc</li>
              <li>MST: 0311850218</li>
              <li>Đăng ký: 11/06/2012</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-10 pt-4 text-center text-xs text-gray-500">
          © 2023 GO2JOY Vietnam, Jsc · Điều khoản · Bảo mật · Quy định đăng tin · Sơ đồ trang web
          <div className="mt-3 flex justify-center gap-6 text-lg">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-tiktok"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Nếu là ADMIN → chuyển sang dashboard
  useEffect(() => {
    if (user && user.roles?.includes("ADMIN")) {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section
        className="relative w-full h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://s3.go2joy.vn/1000w/hotel/34054/4479_1733805575_6757c6073ecdf.webp')",
        }}
      >
        <div className="absolute inset-0 bg-opacity-50"></div>

        <div className="relative z-10 text-center w-full max-w-screen-lg px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-500">
            Paradise Hotel
          </h1>
          <p className="text-lg md:text-xl mt-4">
            Trải nghiệm kỳ nghỉ tuyệt vời nhất
          </p>
          <button className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
            Đặt phòng ngay
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 md:px-20 ">
        <h2 className="text-3xl font-bold text-center mb-10">
          Vì sao chọn chúng tôi?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white shadow rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">🌟 Phòng sang trọng</h3>
            <p>Không gian hiện đại, tiện nghi cao cấp.</p>
          </div>

          <div className="p-6 bg-white shadow rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">📍 Vị trí trung tâm</h3>
            <p>Gần biển, gần trung tâm thành phố.</p>
          </div>

          <div className="p-16 bg-white shadow rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">🛎️ Dịch vụ 24/7</h3>
            <p>Luôn sẵn sàng phục vụ bạn mọi lúc.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
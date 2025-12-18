import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp, createUser } from "../../api/authService";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("register");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ============================
  // ⭐ VALIDATE FORM ĐĂNG KÝ
  // ============================
  const validateRegister = () => {
    let newErrors = {};

    if (!phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập tên";
    if (!gmail.trim()) newErrors.gmail = "Vui lòng nhập email";
    if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    if (!rePassword.trim()) newErrors.rePassword = "Vui lòng nhập lại mật khẩu";

    if (password !== rePassword)
      newErrors.rePassword = "Mật khẩu nhập lại không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================
  // ⭐ GỬI OTP
  // ============================
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateRegister()) return;

    try {
      setLoading(true);

      const res = await sendOtp(gmail, phone, password, fullName);

      if (res.data.code === 1000) {
        setStep("verify");
      } else {
        setErrors({ general: res.data.message || "Đăng ký thất bại" });
      }
   } catch (err) {
      console.log("ERR:", err);

      const code =
        err?.data?.code ||
        err?.response?.data?.code ||
        null;

      const message =
        err?.data?.message ||
        err?.response?.data?.message ||
        null;

      if (message) {
        alert(`Lỗi ${code}: ${message}`);
      } else {
        alert("Không thể kết nối server");
      }
    }finally {
      setLoading(false);
    }

    
  };

  // ============================
  // ⭐ XÁC THỰC OTP + TẠO USER
  // ============================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!otp.trim()) {
      setErrors({ otp: "Vui lòng nhập OTP" });
      return;
    }

    try {
      const verifyRes = await verifyOtp(gmail, otp);

      if (verifyRes.data.code !== 1000) {
        setErrors({ otp: verifyRes.data.message || "OTP không đúng" });
        return;
      }

      const createRes = await createUser(fullName, gmail, password, phone);

      if (createRes.data.code === 1000) {
        alert("Tạo tài khoản thành công! Bạn có thể đăng nhập.");
        navigate("/login", { replace: true });
      } else {
        setErrors({ general: createRes.data.message || "Không thể tạo tài khoản" });
      }
    }  catch (err) {
        console.log("ERR:", err);

        const code =
          err?.data?.code ||
          err?.response?.data?.code ||
          null;

        const message =
          err?.data?.message ||
          err?.response?.data?.message ||
          null;

        if (message) {
          alert(`Lỗi ${code}: ${message}`);
        } else {
          alert("Không thể kết nối server");
        }
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl w-full">

        {/* LEFT */}
        <div className="bg-orange-100 p-8 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-bold text-orange-600 mb-4">ĐĂNG KÝ NGAY</h2>
          <p className="text-lg text-orange-700 mb-6">Nhận ƯU ĐÃI 50%</p>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Go2Joy_logo.svg/512px-Go2Joy_logo.svg.png"
            alt="Go2Joy App"
            className="h-20 mb-4"
          />
        </div>

        {/* RIGHT */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {step === "register" ? "Đăng ký làm Joyer" : "Xác thực OTP"}
          </h3>

          {errors.general && (
            <div className="mb-4 text-red-600 font-medium">{errors.general}</div>
          )}

          {/* ============================
              FORM ĐĂNG KÝ
          ============================ */}
          {step === "register" && (
            <form className="space-y-4" onSubmit={handleRegister}>
              {/* PHONE */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên của bạn</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên"
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.gmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập email"
                />
                {errors.gmail && <p className="text-red-500 text-sm">{errors.gmail}</p>}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* RE-PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
                <input
                  type="password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.rePassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.rePassword && <p className="text-red-500 text-sm">{errors.rePassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded transition ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {loading ? "Đang gửi OTP..." : "Đăng ký"}
              </button>
            </form>
          )}

          {/* ============================
              FORM OTP
          ============================ */}
          {step === "verify" && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nhập mã OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`mt-1 block w-full border rounded px-4 py-2 ${
                    errors.otp ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập OTP"
                />
                {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
              >
                Xác thực OTP
              </button>
            </form>
          )}

          {step === "register" && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Bạn đã có tài khoản Go2Joy?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Đăng nhập ngay
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
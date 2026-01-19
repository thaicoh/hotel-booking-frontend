import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendOtp, verifyOtp, createUser } from "../../api/authService";
import { FaPhoneAlt, FaUser, FaEnvelope, FaLock, FaShieldAlt, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("register"); // 'register' hoặc 'verify'
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateRegister = () => {
    let newErrors = {};
    if (!phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập tên";
    if (!gmail.trim() || !gmail.includes("@")) newErrors.gmail = "Email không hợp lệ";
    if (password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (password !== rePassword) newErrors.rePassword = "Mật khẩu không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  setErrors({});

  if (!validateRegister()) return;

  try {
    setLoading(true);
    const res = await sendOtp(gmail, phone, password, fullName);
    if (res.data.code === 1000) {
      setStep("verify");
    }
  } catch (err) {
    console.log("ERR context:", err); // Để kiểm tra lại lần nữa

    // Dựa trên ảnh log của bạn, data nằm trực tiếp trong err hoặc err.response
    const errorData = err?.response?.data || err?.data; 
    const message = errorData?.message;
    const code = errorData?.code;

    if (message) {
      // Hiển thị alert hoặc set vào state errors để hiện lên giao diện
      alert(`Lỗi ${code}: ${message}`);
      
      // Nếu muốn hiển thị lỗi ngay dưới ô input Email:
      if (message === "USER_EMAIL_ALREADY_EXISTS") {
        setErrors({ gmail: "Email này đã tồn tại trên hệ thống" });
      }

      if (message === "PHONE_INVALID") {
        setErrors({ phone: "Số điện thoại không hợp lệ" });
      }


    } else {
      alert("Không thể kết nối server hoặc lỗi không xác định");
    }
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!otp.trim()) {
      setErrors({ otp: "Vui lòng nhập OTP" });
      return;
    }

    try {
      setLoading(true);
      const verifyRes = await verifyOtp(gmail, otp);

      if (verifyRes.data.code === 1000) {
        const createRes = await createUser(fullName, gmail, password, phone);
        if (createRes.data.code === 1000) {
          alert("Tạo tài khoản thành công!");
          navigate("/login", { replace: true });
        }
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      alert(serverMessage || "Xác thực không thành công");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-[2.5rem] overflow-hidden max-w-6xl w-full border border-white">
        
        {/* Cột Trái: Thông điệp Ưu đãi */}
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-orange-500 to-orange-600 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
          <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Gia Nhập Joyer</h2>
            <div className="inline-block bg-yellow-400 text-orange-700 font-black px-6 py-2 rounded-full text-2xl shadow-lg mb-8 animate-bounce">
              ƯU ĐÃI 50%
            </div>
            <div className="bg-white p-5 rounded-[2rem] shadow-2xl mb-8 inline-block transform rotate-3">
              <img
                src="https://gudlogo.com/wp-content/uploads/2019/04/logo-chiec-la-74.jpeg"
                alt="Logo"
                className="h-14"
              />
            </div>
            <p className="text-lg opacity-90 leading-relaxed font-medium">
              Đăng ký ngay để trở thành một Joyer,<br />
              nhận hàng ngàn voucher đặt phòng<br />mỗi ngày từ XANH Hotel.
            </p>
          </div>
        </div>

        {/* Cột Phải: Form nội dung */}
        <div className="w-full md:w-3/5 p-8 lg:p-14 bg-white overflow-y-auto max-h-[90vh]">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              {step === "register" ? "Tạo tài khoản" : "Xác thực OTP"}
            </h3>
            <p className="text-gray-500 mt-2">
              {step === "register" ? "Chỉ mất 30 giây để trở thành thành viên" : `Chúng tôi đã gửi mã đến ${gmail}`}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">
              {errors.general}
            </div>
          )}

          {step === "register" ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleRegister}>
              {/* Họ tên */}
              <InputField 
                label="Họ và tên" icon={<FaUser />} placeholder="Nguyễn Văn A"
                value={fullName} onChange={(val) => setFullName(val)} error={errors.fullName} 
              />
              {/* SĐT */}
              <InputField 
                label="Số điện thoại" icon={<FaPhoneAlt />} placeholder="090..." 
                type="tel" value={phone} onChange={(val) => setPhone(val)} error={errors.phone} 
              />
              {/* Email */}
              <div className="md:col-span-2">
                <InputField 
                  label="Địa chỉ Email" icon={<FaEnvelope />} placeholder="example@gmail.com" 
                  type="email" value={gmail} onChange={(val) => setGmail(val)} error={errors.gmail} 
                />
              </div>
              {/* Mật khẩu */}
              <InputField 
                label="Mật khẩu" icon={<FaLock />} placeholder="••••••••" 
                type="password" value={password} onChange={(val) => setPassword(val)} error={errors.password} 
              />
              {/* Nhập lại */}
              <InputField 
                label="Nhập lại mật khẩu" icon={<FaShieldAlt />} placeholder="••••••••" 
                type="password" value={rePassword} onChange={(val) => setRePassword(val)} error={errors.rePassword} 
              />

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Tiếp theo <FaArrowRight /></>}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6 max-w-sm mx-auto md:mx-0" onSubmit={handleVerifyOtp}>
              <InputField 
                label="Mã xác thực OTP" icon={<FaShieldAlt />} placeholder="123456" 
                value={otp} onChange={(val) => setOtp(val)} error={errors.otp} 
              />
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Đang xác thực..." : "Xác nhận & Hoàn tất"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep("register")}
                  className="flex items-center justify-center gap-2 text-gray-500 font-bold py-2 hover:text-orange-600 transition"
                >
                  <FaArrowLeft size={12} /> Quay lại sửa thông tin
                </button>
              </div>
            </form>
          )}

          {step === "register" && (
            <div className="mt-8 text-center md:text-left border-t pt-6 border-gray-100">
              <p className="text-gray-600 font-medium">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-orange-600 font-bold hover:underline">Đăng nhập</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component cho Input để code gọn hơn
function InputField({ label, icon, type = "text", placeholder, value, onChange, error }) {
  return (
    <div className="group">
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none font-medium`}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{error}</p>}
    </div>
  );
}
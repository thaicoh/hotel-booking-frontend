import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginApi } from "../../api/users";
import { useNavigate, Link } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaArrowRight } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ phoneOrEmail: "", password: "" });
  const [errors, setErrors] = useState({ phoneOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  
  // 👉 Cuộn lên đầu trang khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.phoneOrEmail.trim()) newErrors.phoneOrEmail = "Vui lòng nhập số điện thoại hoặc email";
    if (!form.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await loginApi(form.phoneOrEmail, form.password);
      const data = res.data.result;

      login({
        userId: data.user.userId,
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        roles: data.user.roles.map((r) => r.name),
      }, data.token);

      const roles = data.user.roles.map((r) => r.name);
      if (roles.includes("ADMIN")) navigate("/admin", { replace: true });
      else if (roles.includes("STAFF")) navigate("/staff", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      const message = err?.data?.message || "Sai thông tin đăng nhập";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center px-4 py-4">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-[2rem] overflow-hidden max-w-5xl w-full border border-white">
        
        {/* Cột Trái: Welcome (Ẩn trên mobile nhỏ) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-12 flex-col justify-center items-center text-white relative overflow-hidden">
          {/* Trang trí hình tròn mờ */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-5xl font-black mb-6 tracking-tight">XANH HOTEL</h2>
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                    src="https://gudlogo.com/wp-content/uploads/2019/04/logo-chiec-la-74.jpeg"
                    alt="Logo"
                    className="h-16"
                />
            </div>
            <p className="text-xl font-medium opacity-90 leading-relaxed">
              Chào mừng bạn trở lại!<br />
              Đăng nhập để tận hưởng không gian<br />nghỉ dưỡng đẳng cấp nhất.
            </p>
          </div>
        </div>

        {/* Cột Phải: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h3>
            <p className="text-gray-500">Vui lòng điền thông tin tài khoản của bạn</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Phone/Email */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhoneAlt className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="phoneOrEmail"
                  value={form.phoneOrEmail}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.phoneOrEmail ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none text-gray-700 font-medium`}
                  placeholder="Số điện thoại hoặc Email"
                />
              </div>
              {errors.phoneOrEmail && (
                <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{errors.phoneOrEmail}</p>
              )}
            </div>

            {/* Input Password */}
            <div className="group">
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                <a href="#" className="text-xs font-bold text-orange-600 hover:text-orange-700">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none text-gray-700 font-medium`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 ml-2 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Bắt đầu ngay <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Footer Form */}
          <div className="mt-10 text-center">
            <p className="text-gray-600 font-medium">
              Bạn chưa có tài khoản?{" "}
              <Link to="/register" className="text-orange-600 font-bold hover:underline ml-1">
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
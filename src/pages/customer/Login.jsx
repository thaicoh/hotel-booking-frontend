import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginApi } from "../../api/users";
import { useNavigate } from "react-router-dom";

export default function Login() {
  
  const [form, setForm] = useState({
    phoneOrEmail: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    phoneOrEmail: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.phoneOrEmail.trim()) {
      newErrors.phoneOrEmail = "Vui lòng nhập số điện thoại hoặc email";
    }

    if (!form.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // true nếu không có lỗi
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // ❌ Không gửi request nếu form lỗi
    }

    setLoading(true);

    try {
      const res = await loginApi(form.phoneOrEmail, form.password);
      const data = res.data.result;

      login(
        {
          userId: data.user.userId,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          roles: data.user.roles.map((r) => r.name),
        },
        data.token
      );

      const roles = data.user.roles.map((r) => r.name);

      if (roles.includes("ADMIN")) navigate("/admin", { replace: true });
      else if (roles.includes("STAFF")) navigate("/staff", { replace: true });
      else navigate("/", { replace: true });

    } catch (err) {
      console.log("ERR:", err);

      const code = err?.data?.code;
      const message = err?.data?.message;

      alert(message ? `Lỗi ${code}: ${message}` : "Sai thông tin đăng nhập");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-lg rounded-lg overflow-hidden max-w-5xl w-full">

        {/* Left */}
        <div className="bg-orange-100 p-8 flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold text-orange-600 mb-4">WELCOME</h2>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Go2Joy_logo.svg/512px-Go2Joy_logo.svg.png"
            alt="Go2Joy App"
            className="h-20 mb-4"
          />
          <p className="text-lg text-orange-700">
            Go2Joy xin chào!<br />
            Đăng nhập để đặt phòng với ưu đãi độc quyền.
          </p>
        </div>

        {/* Right */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h3>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại hoặc Email
              </label>
              <input
                type="text"
                name="phoneOrEmail"
                value={form.phoneOrEmail}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Nhập số điện thoại hoặc email"
              />
              {errors.phoneOrEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneOrEmail}</p>
              )}

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded px-4 py-2"
                placeholder="Nhập mật khẩu"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Đăng ký ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
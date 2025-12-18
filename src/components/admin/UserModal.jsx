import { useState, useEffect } from "react";

export default function UserModal({ user, roles, branches = [], onClose, onSave }) {
  // Nếu user không có email → đang thêm user mới → bật edit mode
  const isNewUser = !user?.email && !user?.phone;

  const [isEditing, setIsEditing] = useState(isNewUser);
  const [errorMessage, setErrorMessage] = useState("");

  const canEditStatusOnly = isEditing; // chỉ cho phép sửa status

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    branchId: "",
    password: "",
    status: "ACTIVE",   // ⭐ thêm mặc định
  });

  // Load dữ liệu user vào form
  useEffect(() => {
    if (user) {
      const newUser = !user.email && !user.phone;

      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.roles?.[0]?.name || "",
        branch: user.branchId || "",
        password: "",
        status: user.status || "ACTIVE",
      });

      // ⭐ Nếu là user mới → cho nhập tất cả
      if (newUser) {
        setIsEditing(true);
      } 
      // ⭐ Nếu là user cũ → chỉ bật edit khi bấm nút Edit
      else {
        setIsEditing(user.__forceEditStatus === true);
      }

      setErrorMessage("");
    }
  }, [user]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Kiểm tra hợp lệ
  const isValid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.role.trim() !== "" &&
    (formData.role !== "STAFF" || formData.branch.trim() !== "") &&
    (!isNewUser || formData.password.trim() !== "");

  const handleSaveClick = async () => {
    if (!isValid) return;

    const result = await onSave(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage("");
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {isNewUser ? "Thêm người dùng mới" : "Thông tin người dùng"}
        </h2>

        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 font-semibold">{errorMessage}</div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isNewUser && "fullName" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isNewUser && "email" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isNewUser && "phone" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Password chỉ khi thêm user */}
          {isNewUser && (
            <div>
              <label className="block font-semibold mb-1">Password</label>
              <input
                autoComplete="off"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={!isNewUser && "password" !== "status"}   // ⭐
                className="border p-2 rounded w-full"
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block font-semibold mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!isNewUser && "role" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            >
              <option value="">Chọn role</option>
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isEditing}   // ⭐ chỉ mở khi bấm Chỉnh sửa

              className="border p-2 rounded w-full"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOGIN_LOCKED">LOGIN LOCKED</option>
              <option value="BOOKING_LOCKED">BOOKING LOCKED</option>
            </select>
          </div>

          {/* Branch nếu role = STAFF */}
          {formData.role === "STAFF" && (
            <div>
              <label className="block font-semibold mb-1">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                disabled={!isNewUser && "branch" !== "status"}   // ⭐
                className="border p-2 rounded w-full"
              >
                <option value="">Chọn chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {!isEditing ? (
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded text-white ${
                  isValid ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleSaveClick}
                disabled={!isValid}
              >
                Lưu
              </button>
            )}

            <button
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserShield, FaCheckCircle, FaExclamationCircle, FaMapMarkerAlt } from "react-icons/fa";

export default function UserModal({ user, roles, branches = [], onClose, onSave }) {
  const isNewUser = !user?.email && !user?.phone;
  const [isEditing, setIsEditing] = useState(isNewUser);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    branch: "", // Lưu ID chi nhánh
    password: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.roles?.[0]?.name || "",
        branch: user.branchId || "", // Map từ branchId của user
        password: "",
        status: user.status || "ACTIVE",
      });
      setIsEditing(isNewUser || user.__forceEditStatus === true);
      setErrorMessage("");
    }
  }, [user, isNewUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid =
    formData.fullName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.role.trim() !== "" &&
    // Kiểm tra nếu là STAFF thì bắt buộc phải chọn branch
    (formData.role !== "STAFF" || (formData.branch !== "" && formData.branch !== null)) &&
    (!isNewUser || formData.password.trim() !== "");

  const handleSaveClick = async () => {
    if (!isValid) return;
    
    // Đảm bảo gửi branchId đúng format cho backend
    const dataToSave = {
      ...formData,
      branchId: formData.role === "STAFF" ? formData.branch : null
    };

    const result = await onSave(dataToSave);
    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }
    setErrorMessage("");
    setIsEditing(false);
  };

  if (!user) return null;

  const FieldLabel = ({ label, icon: Icon }) => (
    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
      <Icon className="text-blue-500" size={14} />
      {label}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {isNewUser ? <FaUserShield /> : <FaUser />}
            {isNewUser ? "Tạo tài khoản mới" : "Chi tiết người dùng"}
          </h2>
        </div>

        <div className="p-6 md:p-8">
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-700 italic">
              <FaExclamationCircle />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FieldLabel label="Họ và tên" icon={FaUser} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isNewUser}
                className={`w-full p-3 rounded-xl border outline-none transition-all ${!isNewUser ? "bg-gray-50 text-gray-500" : "focus:ring-2 focus:ring-blue-500/20"}`}
              />
            </div>

            <div><FieldLabel label="Email" icon={FaEnvelope} /><input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isNewUser} className="w-full p-3 rounded-xl border disabled:bg-gray-50" /></div>
            <div><FieldLabel label="Số điện thoại" icon={FaPhone} /><input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isNewUser} className="w-full p-3 rounded-xl border disabled:bg-gray-50" /></div>

            {/* Role Selection */}
            <div>
              <FieldLabel label="Quyền hạn" icon={FaUserShield} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isNewUser}
                className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-50"
              >
                <option value="">Chọn phân quyền</option>
                {roles.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <FieldLabel label="Trạng thái" icon={FaCheckCircle} />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 rounded-xl border outline-none ${isEditing ? "border-green-500 ring-2 ring-green-100" : "bg-gray-50 text-gray-500"}`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOGIN_LOCKED">LOGIN LOCKED</option>
                <option value="BOOKING_LOCKED">BOOKING LOCKED</option>
              </select>
            </div>

            {/* 🛡️ HIỂN THỊ CHI NHÁNH KHI CHỌN STAFF */}
            {formData.role === "STAFF" && (
              <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <FieldLabel label="Chi nhánh làm việc" icon={FaMapMarkerAlt} />
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={!isNewUser} // Chỉ cho chọn khi tạo mới, user cũ thường cố định chi nhánh
                  className={`w-full p-3 rounded-xl border outline-none ${!isNewUser ? "bg-gray-50 text-gray-500" : "border-blue-400 ring-2 ring-blue-50"}`}
                >
                  <option value="">-- Chọn chi nhánh gán cho nhân viên --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      🏠 {b.branchName}
                    </option>
                  ))}
                </select>
                {isNewUser && <p className="text-xs text-blue-600 mt-1 italic">* Nhân viên bắt buộc phải thuộc một chi nhánh cụ thể.</p>}
              </div>
            )}

            {isNewUser && (
              <div className="md:col-span-2">
                <FieldLabel label="Mật khẩu" icon={FaLock} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu cho tài khoản mới"
                  className="w-full p-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-10 border-t pt-6">
            <button type="button" className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200" onClick={onClose}>Đóng</button>
            {!isEditing ? (
              <button type="button" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg" onClick={() => setIsEditing(true)}>Chỉnh sửa trạng thái</button>
            ) : (
              <button
                type="button"
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                onClick={handleSaveClick}
                disabled={!isValid}
              >
                {isNewUser ? "Tạo người dùng" : "Lưu thay đổi"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
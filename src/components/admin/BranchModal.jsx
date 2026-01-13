import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCloudUploadAlt, FaTimes, FaExpand } from "react-icons/fa";

// ✅ 1. ĐƯA INPUTFIELD RA NGOÀI ĐỂ TRÁNH RENDER LẠI TOÀN BỘ TRONG KHI GÕ
const InputField = ({ label, name, icon: Icon, placeholder, type = "text", value, onChange, disabled }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <Icon className="text-blue-500" size={14} /> {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
    />
  </div>
);

export default function BranchModal({ branch, onClose, onSave }) {
  const isNewBranch = !branch?.id;
  const [isEditing, setIsEditing] = useState(isNewBranch);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    branchName: "", address: "", phone: "", email: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(branch?.photoUrl || null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData({
        branchName: branch.branchName || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
      });
      setPhotoPreview(branch?.photoUrl || null);
      setIsEditing(isNewBranch);
    }
  }, [branch, isNewBranch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // ✅ Cập nhật state trực tiếp từ event giúp input mượt mà
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const isValid = formData.branchName.trim() && formData.address.trim() && formData.phone.trim() && formData.email.trim();

  const handleSaveClick = async () => {
    if (!isValid) return setErrorMessage("Vui lòng điền đầy đủ thông tin.");
    const result = await onSave({ ...formData, photoFile });
    if (result?.error) setErrorMessage(result.error);
    else setIsEditing(false);
  };

  if (!branch && !isNewBranch) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              {isNewBranch ? "Thêm chi nhánh mới" : "Chi tiết chi nhánh"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8">
            {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded text-sm font-medium italic">{errorMessage}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Form Info */}
              <div className="space-y-4">
                <InputField 
                    label="Tên chi nhánh" 
                    name="branchName" 
                    icon={FaBuilding} 
                    placeholder="VD: Chi nhánh Quận 1" 
                    value={formData.branchName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
                <InputField 
                    label="Địa chỉ" 
                    name="address" 
                    icon={FaMapMarkerAlt} 
                    placeholder="Số 123, Đường..." 
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField 
                    label="Số điện thoại" 
                    name="phone" 
                    icon={FaPhone} 
                    placeholder="090..." 
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  <InputField 
                    label="Email" 
                    name="email" 
                    icon={FaEnvelope} 
                    placeholder="branch@example.com" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Right: Photo Upload */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 relative group min-h-[300px]">
                {photoPreview ? (
                  <div className="relative w-full h-full min-h-[250px]">
                    <img
                      src={photoPreview.startsWith("http") || photoPreview.startsWith("blob:") ? photoPreview : `${API_BASE_URL}/${photoPreview}`}
                      alt="Branch"
                      className="w-full h-full object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                      <button onClick={() => setIsPhotoModalOpen(true)} className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md">
                        <FaExpand size={20} />
                      </button>
                      {isEditing && (
                        <label htmlFor="branch-photo" className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-transform hover:scale-110">
                          <FaCloudUploadAlt size={20} />
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <label htmlFor="branch-photo" className={`flex flex-col items-center gap-2 cursor-pointer ${!isEditing && "pointer-events-none opacity-50"}`}>
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <FaCloudUploadAlt size={32} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Tải ảnh chi nhánh</span>
                  </label>
                )}
                <input id="branch-photo" type="file" accept="image/*" onChange={handlePhotoChange} disabled={!isEditing} className="hidden" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Đóng</button>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition-all">Chỉnh sửa</button>
            ) : (
              <button
                onClick={handleSaveClick}
                disabled={!isValid}
                className={`px-8 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all ${isValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
              >
                Lưu chi nhánh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setIsPhotoModalOpen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors"><FaTimes size={30} /></button>
          <img
            src={photoPreview.startsWith("http") || photoPreview.startsWith("blob:") ? photoPreview : `${API_BASE_URL}/${photoPreview}`}
            className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
            alt="Branch Large"
          />
        </div>
      )}
    </>
  );
}
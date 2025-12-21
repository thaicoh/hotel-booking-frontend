import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";


export default function BranchModal({ branch, onClose, onSave }) {
  const isNewBranch = !branch?.id;

  const [isEditing, setIsEditing] = useState(isNewBranch);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    branchName: "",
    address: "",
    phone: "",
    email: "",
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
      setPhotoFile(null);
      setPhotoPreview(branch?.photoUrl || null);
      setIsEditing(isNewBranch);
      setErrorMessage("");
    }
  }, [branch, isNewBranch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);

    if (file) {
      // tạo URL tạm thời để hiển thị preview
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(branch?.photoUrl || null);
    }
  };

  const isValid =
    formData.branchName.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.email.trim() !== "";

  const handleSaveClick = async () => {
    if (!isValid) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const result = await onSave({ ...formData, photoFile });

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage("");
    setIsEditing(false);
  };

  if (!branch && !isNewBranch) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[650px] max-w-2xl relative">
          <h2 className="text-2xl font-bold mb-6">
            {isNewBranch ? "Thêm chi nhánh mới" : "Thông tin chi nhánh"}
          </h2>

          <div className="space-y-4">
            {errorMessage && (
              <div className="text-red-600 font-semibold">{errorMessage}</div>
            )}

            {/* Branch Name */}
            <div>
              <label className="block font-semibold mb-1">Tên chi nhánh</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                disabled={!isEditing}
                className="border p-2 rounded w-full"
                placeholder="Nhập tên chi nhánh"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-semibold mb-1">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="border p-2 rounded w-full"
                placeholder="Nhập địa chỉ"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-semibold mb-1">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="border p-2 rounded w-full"
                placeholder="Nhập số điện thoại"
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
                disabled={!isEditing}
                className="border p-2 rounded w-full"
                placeholder="Nhập email"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block font-semibold mb-1">Ảnh chi nhánh</label>

              {/* Custom file button */}
              <div className="flex items-center gap-4">
                <label
                  className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition"
                  htmlFor="branch-photo"
                >
                  {photoFile ? "Đổi ảnh" : "Chọn ảnh"}
                </label>
                <span className="text-sm text-gray-500">
                  {photoFile ? photoFile.name : branch?.photoUrl ? "Ảnh hiện tại" : "Chưa chọn ảnh"}
                </span>
              </div>

              {/* Hidden file input */}
              <input
                id="branch-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={!isEditing}
                className="hidden"
              />

              {/* Preview */}
              {photoPreview && (
                <div className="flex justify-center mt-4">
                  <img
                    src={
                          photoPreview && (photoPreview.startsWith("http") || photoPreview.startsWith("blob:"))
                            ? photoPreview
                            : API_BASE_URL + "/" + photoPreview
                        }
                    alt="Chi nhánh"
                    className="h-48 w-48 md:h-64 md:w-64 object-cover rounded-lg border cursor-pointer"
                    onClick={() => setIsPhotoModalOpen(true)}
                  />
                </div>
              )}
            </div>


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

      {/* Fullscreen Photo Modal */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
            onClick={() => setIsPhotoModalOpen(false)}
          >
            &times;
          </button>
          <img
            src={
                  photoPreview && (photoPreview.startsWith("http") || photoPreview.startsWith("blob:"))
                    ? photoPreview
                    : API_BASE_URL + "/" + photoPreview
                }
            alt="Chi nhánh"
            className="max-h-[90%] max-w-[90%] object-contain rounded-lg border"
          />
        </div>
      )}
      
    </>
  );
}

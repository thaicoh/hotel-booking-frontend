import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

export default function RoomTypeQuickModal({ branchId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    typeName: "",
    capacity: 1,
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    if (!formData.typeName.trim() || !formData.capacity) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const result = await onSave(formData);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">Thêm loại phòng nhanh</h2>

        {errorMessage && (
          <div className="text-red-600 font-semibold mb-2">{errorMessage}</div>
        )}

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Tên loại phòng *</label>
            <input
              type="text"
              name="typeName"
              value={formData.typeName}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Sức chứa *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              min={1}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              rows={3}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSaveClick}
          >
            Lưu
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
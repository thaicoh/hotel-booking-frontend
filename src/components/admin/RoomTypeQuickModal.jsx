import { useState } from "react";
import { FaBed, FaUsers, FaAlignLeft, FaTimes, FaSave, FaExclamationCircle } from "react-icons/fa";

export default function RoomTypeQuickModal({ branchId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    typeName: "",
    capacity: 1,
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    if (!formData.typeName.trim() || !formData.capacity) {
      setErrorMessage("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    const result = await onSave(formData);
    setIsSubmitting(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaBed className="text-emerald-100" />
            Thêm loại phòng nhanh
          </h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-100 hover:text-white hover:bg-white/20 rounded-full transition-all"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="flex items-center gap-2 mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-pulse">
              <FaExclamationCircle className="shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="space-y-5">
            {/* Tên loại phòng */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <FaBed className="text-emerald-500" size={14} />
                Tên loại phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="typeName"
                placeholder="VD: Deluxe Double Ocean View"
                value={formData.typeName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Sức chứa */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <FaUsers className="text-emerald-500" size={14} />
                Sức chứa (Người) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  min={1}
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <FaAlignLeft className="text-emerald-500" size={14} />
                Mô tả ngắn
              </label>
              <textarea
                name="description"
                placeholder="Mô tả đặc điểm nổi bật của phòng..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors uppercase tracking-widest"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={issubmitting}
            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-sm"
          >
            {issubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FaSave />
                Lưu loại phòng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
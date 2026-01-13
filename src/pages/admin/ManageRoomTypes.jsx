// src/pages/admin/ManageRoomTypes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaWrench, FaCheck, FaBuilding, FaUsers, FaBed, FaTag, FaArrowRight, FaImage } from "react-icons/fa";

import { getBranches, updateBranchStatus } from "../../api/branches";
import { getRoomTypesByBranch, createRoomType } from "../../api/roomtypes";
import { API_BASE_URL } from "../../config/api";
import RoomTypeQuickModal from "../../components/admin/RoomTypeQuickModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function ManageRoomTypes() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const res = await getBranches();
      if (res.data.code === 1000) {
        setBranches(res.data.result || []);
      }
    } catch (err) {
      console.error("Lỗi tải chi nhánh:", err);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadRoomTypes = async (branchId) => {
    try {
      setLoadingRoomTypes(true);
      const res = await getRoomTypesByBranch(branchId);
      if (res.data.code === 1000) {
        setRoomTypes(res.data.result || []);
      }
    } catch (err) {
      console.error("Lỗi tải loại phòng:", err);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  const handleUpdateBranchStatus = async (branchId, newStatus) => {
    try {
      await updateBranchStatus(branchId, newStatus);
      loadBranches();
    } catch (err) {
      console.error("Update status failed:", err);
      alert("Không thể cập nhật trạng thái chi nhánh");
    }
  };

  const handleSaveRoomType = async (formData) => {
    try {
      const res = await createRoomType({
        branchId: selectedBranch.id,
        typeName: formData.typeName,
        capacity: Number(formData.capacity),
        description: formData.description,
      });

      if (res.data.code !== 1000) {
        return { error: res.data.message };
      }

      await loadRoomTypes(selectedBranch.id);
      return { success: true };
    } catch (err) {
      const message = err?.data?.message;
      return { error: message ? `Lỗi: ${message}` : "Lỗi kết nối server" };
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      loadRoomTypes(selectedBranchId);
    } else {
      setRoomTypes([]);
    }
  }, [selectedBranchId]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý loại phòng</h1>
          <p className="text-gray-500 text-sm md:text-base">Thiết lập cấu hình phòng cho từng chi nhánh khách sạn</p>
        </div>
      </div>

      {/* Select branch Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 mb-8 transition-all hover:shadow-md">
        <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
          <FaBuilding className="text-blue-600" /> Chọn chi nhánh làm việc
        </label>

        {loadingBranches ? (
          <div className="h-10 w-full bg-gray-100 animate-pulse rounded"></div>
        ) : (
          <select
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="">-- Danh sách chi nhánh --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branchName} ({b.status === "ACTIVE" ? "Đang chạy" : "Bảo trì"})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Branch Detail Hero Card */}
      {selectedBranch && (
        <div
          className={`relative overflow-hidden shadow-sm border border-gray-200 rounded-2xl p-6 mb-8 transition-all ${
            selectedBranch.status === "ACTIVE" ? "bg-white" : "bg-orange-50 border-orange-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-800">{selectedBranch.branchName}</h2>
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    selectedBranch.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedBranch.status === "ACTIVE" ? "Hoạt động" : "Bảo trì"}
                </span>
              </div>
              <p className="text-gray-600 flex items-center gap-2"><span className="opacity-70 text-sm">{selectedBranch.address}</span></p>
              <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                <span>📧 {selectedBranch.email}</span>
                <span>📞 {selectedBranch.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                  selectedBranch.status === "ACTIVE"
                    ? "bg-white text-orange-600 border border-orange-600 hover:bg-orange-50"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                }`}
                onClick={() => {
                  const newStatus = selectedBranch.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
                  setPendingStatus(newStatus);
                  setShowConfirmStatus(true);
                }}
              >
                {selectedBranch.status === "ACTIVE" ? <><FaWrench /> Bảo trì</> : <><FaCheck /> Kích hoạt</>}
              </button>

              <button
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                onClick={() => setShowRoomTypeModal(true)}
              >
                <FaPlus /> Thêm loại phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        {!selectedBranchId ? (
          <div className="p-20 text-center">
             <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FaBuilding size={24} />
             </div>
             <p className="text-gray-400 font-medium">Vui lòng chọn một chi nhánh để quản lý danh sách loại phòng</p>
          </div>
        ) : loadingRoomTypes ? (
          <div className="p-20 text-center animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Hình ảnh</th>
                  <th className="px-6 py-4 font-bold">Thông tin loại phòng</th>
                  <th className="px-6 py-4 font-bold text-center">Sức chứa</th>
                  <th className="px-6 py-4 font-bold text-center">Số phòng</th>
                  <th className="px-6 py-4 font-bold">Giá tham khảo</th>
                  <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {roomTypes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      Chưa có dữ liệu loại phòng cho chi nhánh này
                    </td>
                  </tr>
                ) : (
                  roomTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rt.mainPhotoUrl ? (
                          <img
                            src={`${API_BASE_URL}/${rt.mainPhotoUrl}`}
                            alt={rt.typeName}
                            className="w-24 h-16 object-cover rounded-xl shadow-sm border border-gray-100"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-[10px] text-gray-400">
                            <FaImage className="mb-1 text-lg" /> No Image
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{rt.typeName}</div>
                        <div className="text-gray-500 text-xs truncate max-w-[200px]">{rt.description || "Không có mô tả"}</div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${!rt.capacity ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                          <FaUsers className="text-xs" /> {rt.capacity || "0"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${(!rt.roomCount) ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
                          <FaBed className="text-xs" /> {rt.roomCount || "0"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                         {rt.minPrice ? (
                            <div className="flex items-center gap-1">
                                <span className="text-orange-600 text-base">{rt.minPrice.toLocaleString("vi-VN")}</span>
                                <span className="text-xs text-gray-400">VNĐ</span>
                            </div>
                         ) : (
                            <span className="text-red-400 text-xs font-normal">Chưa thiết lập giá</span>
                         )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all group-hover:shadow-sm"
                            title="Chi tiết"
                            onClick={() => navigate(`/admin/room-types/${rt.id}`)}
                          >
                            <FaArrowRight size={14} />
                          </button>
                          <button
                            className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl font-bold hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                            onClick={() => navigate(`/admin/room-types/${rt.id}?mode=edit`)}
                          >
                            Sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRoomTypeModal && selectedBranch && (
        <RoomTypeQuickModal
          branchId={selectedBranch.id}
          onClose={() => setShowRoomTypeModal(false)}
          onSave={handleSaveRoomType}
        />
      )}

      {showConfirmStatus && (
        <ConfirmModal
          title="Thay đổi trạng thái vận hành"
          message={`Hệ thống sẽ chuyển chi nhánh "${selectedBranch.branchName}" sang trạng thái [${pendingStatus === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}]. Bạn có chắc chắn?`}
          onCancel={() => setShowConfirmStatus(false)}
          onConfirm={() => {
            handleUpdateBranchStatus(selectedBranch.id, pendingStatus);
            setShowConfirmStatus(false);
          }}
        />
      )}
    </div>
  );
}
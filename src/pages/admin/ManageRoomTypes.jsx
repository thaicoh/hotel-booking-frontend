// src/pages/admin/ManageRoomTypes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBranches ,updateBranchStatus} from "../../api/branches";
import { getRoomTypesByBranch, createRoomType  } from "../../api/roomtypes";
import { API_BASE_URL } from "../../config/api";
import RoomTypeQuickModal from "../../components/admin/RoomTypeQuickModal"; 
import ConfirmModal from "../../components/common/ConfirmModal"; 


export default function ManageRoomTypes() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const selectedBranch = branches.find(b => b.id === selectedBranchId);


  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);

  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // =========================
  // Load all branches
  // =========================
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

  // =========================
  // Load room types by branch
  // =========================
  
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
      loadBranches(); // reload danh sách
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

        console.log("ERR:", err);

        const code = err?.data?.code;
        const message = err?.data?.message;

        return { error: message ? `Lỗi ${code}: ${message}` : "Lỗi kết nối server" };
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý loại phòng</h1>
      </div>

      {/* Select branch */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <label className="block font-medium mb-2">
          Chi nhánh <span className="text-red-500">*</span>
        </label>

        {loadingBranches ? (
          <p>Đang tải chi nhánh...</p>
        ) : (
              <select
                className="border p-2 rounded w-full"
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="">-- Vui lòng chọn chi nhánh --</option>
                {branches.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className={
                      b.status === "ACTIVE"
                        ? "text-green-600 font-medium"
                        : "text-orange-600 font-medium"
                    }
                  >
                    {b.branchName} - {b.status}
                  </option>
                ))}
              </select>
        )}
      </div>

      {selectedBranch && (
        <div
          className={`shadow rounded p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
            selectedBranch.status === "ACTIVE"
              ? "bg-white"
              : "bg-orange-100" // nền cam nhẹ khi bảo trì
          }`}
        >
          {/* Thông tin chi nhánh */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">{selectedBranch.branchName}</h2>
            <p className="text-gray-600">{selectedBranch.address}</p>
            <p className="text-gray-600">
              📧 {selectedBranch.email} &nbsp;&nbsp; 📞 {selectedBranch.phone}
            </p>
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                selectedBranch.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {selectedBranch.status === "ACTIVE" ? "Đang hoạt động" : "Bảo trì"}
            </span>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2">

            <button
              className={`px-4 py-2 rounded font-medium ${
                selectedBranch.status === "ACTIVE"
                  ? "bg-orange-500 text-white"
                  : "bg-green-600 text-white"
              }`}
              onClick={() => {
                const newStatus =
                  selectedBranch.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
                setPendingStatus(newStatus);
                setShowConfirmStatus(true);
              }}
            >
              {selectedBranch.status === "ACTIVE" ? "🔧 Bảo trì" : "✅ Kích hoạt"}
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium"
              onClick={() => setShowRoomTypeModal(true)}
            >
              ➕ Thêm loại phòng
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedBranchId && (
        <div className="text-gray-500 italic">
          Vui lòng chọn chi nhánh để xem danh sách loại phòng
        </div>
      )}

      {/* Room type table */}
      {selectedBranchId && (
        <>
          {loadingRoomTypes ? (
            <p>Đang tải loại phòng...</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border w-24">Ảnh</th>
                    <th className="p-3 border">Loại phòng</th>
                    <th className="p-3 border">Sức chứa</th>
                    <th className="p-3 border">Số phòng</th>
                    <th className="p-3 border">Giá từ</th>
                    <th className="p-3 border w-40">Hành động</th>
                  </tr>
                </thead>

                <tbody>
                  {roomTypes.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-4 text-center text-gray-500"
                      >
                        Chưa có loại phòng nào
                      </td>
                    </tr>
                  )}

                  {roomTypes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-gray-50">
                      {/* Photo */}
                      <td className="p-3 border">
                        {rt.mainPhotoUrl ? (
                          <img
                            src={`${API_BASE_URL}/${rt.mainPhotoUrl}`}
                            alt={rt.typeName}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-red-100 rounded flex items-center justify-center text-xs text-red-600 font-semibold">
                            No img
                          </div>
                        )}
                      </td>



                      {/* Name */}
                      <td className="p-3 border font-medium">
                        {rt.typeName}
                      </td>

                      {/* Capacity */}
                      <td className={`p-3 border ${!rt.capacity ? "bg-red-100 text-red-600" : ""}`}>
                        {rt.capacity ? `👤 ${rt.capacity}` : "Chưa có sức chứa"}
                      </td>


                      {/* Room count */}
                      <td
                        className={`p-3 border ${
                          rt.roomCount === undefined || rt.roomCount === 0
                            ? "bg-red-100 text-red-600"
                            : ""
                        }`}
                      >
                        {rt.roomCount !== undefined && rt.roomCount !== 0
                          ? `🏨 ${rt.roomCount}`
                          : "Chưa có phòng"}
                      </td>


                      {/* Min price */}
                      <td className={`p-3 border ${!rt.minPrice ? "bg-red-100 text-red-600" : ""}`}>
                        {rt.minPrice ? `${rt.minPrice.toLocaleString("vi-VN")}đ` : "Chưa set giá"}
                      </td>


                      {/* Actions */}
                      <td className="p-3 border">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                          onClick={() =>
                            navigate(`/admin/room-types/${rt.id}`)
                          }
                        >
                          View
                        </button>

                        <button
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                          onClick={() =>
                            navigate(`/admin/room-types/${rt.id}?mode=edit`)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ✅ Modal nằm trong return, nhưng ngoài layout */}
      {showRoomTypeModal && selectedBranch && (
        <RoomTypeQuickModal
          branchId={selectedBranch.id}
          onClose={() => setShowRoomTypeModal(false)}
          onSave={handleSaveRoomType}
        />
      )}

      {showConfirmStatus && (
        <ConfirmModal
          title="Xác nhận thay đổi trạng thái"
          message={`Bạn có chắc muốn chuyển chi nhánh "${selectedBranch.branchName}" sang trạng thái ${pendingStatus}?`}
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


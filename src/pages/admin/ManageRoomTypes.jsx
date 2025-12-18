// src/pages/admin/ManageRoomTypes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBranches } from "../../api/branches";
import { getRoomTypesByBranch } from "../../api/roomtypes";
import { API_BASE_URL } from "../../config/api";

export default function ManageRoomTypes() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

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
              <option key={b.id} value={b.id}>
                {b.branchName}
              </option>
            ))}
          </select>
        )}
      </div>

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
                          <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="p-3 border font-medium">
                        {rt.typeName}
                      </td>

                      {/* Capacity */}
                      <td className="p-3 border">
                        👤 {rt.capacity}
                      </td>

                      {/* Room count */}
                      <td className="p-3 border">
                        {rt.roomCount !== undefined
                          ? `🏨 ${rt.roomCount}`
                          : "—"}
                      </td>

                      {/* Min price */}
                      <td className="p-3 border">
                        {rt.minPrice
                          ? `${rt.minPrice.toLocaleString("vi-VN")}đ`
                          : "—"}
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
    </div>
  );
}

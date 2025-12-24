import { useState, useEffect } from "react";
import {
  getBranches,
  createBranch,
  updateBranch,
  getBranchesPaging,
  updateBranchStatus 
} from "../../api/branches";

import { API_BASE_URL } from "../../config/api";


import BranchModal from "../../components/admin/BranchModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function ManageBranches() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);

const [showConfirmStatus, setShowConfirmStatus] = useState(false);
const [pendingBranch, setPendingBranch] = useState(null);
const [pendingStatus, setPendingStatus] = useState(null);


  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await getBranchesPaging(page, size, search);

      if (res.data.code === 1000) {
        setBranches(res.data.result.items || []);
        setTotalPages(res.data.result.totalPages || 1);
      }
    } catch (err) {
      console.error("Lỗi tải chi nhánh:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setPage(-1);   // ⭐ ép thay đổi
    setTimeout(() => setPage(0), 0); // ⭐ đưa về 0 để load đúng
  };

  const handleSaveBranch = async (formData) => {
    try {
      const isNew = !selectedBranch?.id; // ✅ DUY NHẤT 1 NGUỒN

      console.log(selectedBranch.id)

      const branchRequest = {
        branchName: formData.branchName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      const multipart = new FormData();
      multipart.append(
        "branchRequest",
        new Blob([JSON.stringify(branchRequest)], {
          type: "application/json",
        })
      );

      if (formData.photoFile) {
        multipart.append("photo", formData.photoFile);
      }

      const res = isNew
        ? await createBranch(multipart)
        : await updateBranch(selectedBranch.id, multipart);

      if (res.data.code !== 1000) {
        return { error: res.data.message };
      }

      setSelectedBranch(null);
      loadBranches();
      return { success: true };
    } catch (err) {

        console.log("ERR:", err);

        const code = err?.data?.code;
        const message = err?.data?.message;

        return { error: message ? `Lỗi ${code}: ${message}` : "Lỗi kết nối server" };
    }
  };


  const handleDeleteBranch = async () => {
    try {

      if (res.data.code !== 1000) {
        alert("Xóa chi nhánh thất bại");
        return;
      }

      setShowConfirm(false);
      loadBranches();
    } catch (err) {
      alert("Lỗi kết nối server");
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
  

  useEffect(() => {
    loadBranches();
  }, [page, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý chi nhánh</h1>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => setSelectedBranch({ id: null })}
        >
          + Thêm chi nhánh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded p-4 mb-6 flex gap-4">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Tìm theo tên chi nhánh hoặc địa chỉ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded"
          onClick={resetFilters}
        >
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Tên chi nhánh</th>
                <th className="p-3 border">Địa chỉ</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">SĐT</th>
                <th className="p-3 border">Ngày tạo</th>
                <th className="p-3 border">Ảnh</th>
                <th className="p-3 border">Trạng thái</th>
                <th className="p-3 border">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{b.branchName}</td>
                  <td className="p-3 border">{b.address}</td>
                  <td className="p-3 border">{b.email}</td>
                  <td className="p-3 border">{b.phone}</td>
                  <td className="p-3 border">
                    {b.createdAt
                      ? new Date(b.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="p-3 border">
                    {b.photoUrl ? (
                      <img
                        src={API_BASE_URL + "/" + b.photoUrl}
                        alt={b.branchName}
                        className="w-16 h-10 object-cover rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3 border">
                    {b.status === "ACTIVE" ? (
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded">
                        Maintenance
                      </span>
                    )}
                  </td>

                  <td className="p-3 border">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                      onClick={() => setSelectedBranch(b)}
                    >
                      View
                    </button>

                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => setSelectedBranch({ ...b })}

                    >
                      Edit
                    </button>


                    <button
                      className={`px-3 py-1 rounded ${
                        b.status === "ACTIVE"
                          ? "bg-orange-500 text-white"
                          : "bg-green-600 text-white"
                      }`}
                      onClick={() => {
                        const newStatus = b.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
                        setPendingBranch(b);
                        setPendingStatus(newStatus);
                        setShowConfirmStatus(true);
                      }}
                    >
                      {b.status === "ACTIVE" ? "Set Maintenance" : "Set Active"}
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded ${
                page === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Previous
            </button>

            <span>
              Trang <strong>{page + 1}</strong> / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded ${
                page + 1 >= totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedBranch && (
        <BranchModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          onSave={handleSaveBranch}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa chi nhánh \"${branchToDelete.branchName}\" không?`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleDeleteBranch}
        />
      )}

      {showConfirmStatus && pendingBranch && (
        <ConfirmModal
          title="Xác nhận thay đổi trạng thái"
          message={`Bạn có chắc muốn chuyển chi nhánh "${pendingBranch.branchName}" sang trạng thái ${pendingStatus}?`}
          onCancel={() => setShowConfirmStatus(false)}
          onConfirm={() => {
            handleUpdateBranchStatus(pendingBranch.id, pendingStatus);
            setShowConfirmStatus(false);
          }}
        />
      )}   
    </div>
  );
}

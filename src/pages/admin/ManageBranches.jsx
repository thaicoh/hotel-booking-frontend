import { useState, useEffect } from "react";
import { 
  getBranchesPaging, 
  createBranch, 
  updateBranch, 
  updateBranchStatus 
} from "../../api/branches";
import { API_BASE_URL } from "../../config/api";

// Components
import BranchModal from "../../components/admin/BranchModal";
import ConfirmModal from "../../components/common/ConfirmModal";

// Icons
import { 
  FaPlus, FaSearch, FaSync, FaEye, 
  FaEdit, FaTools, FaCheckCircle, 
  FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt 
} from "react-icons/fa";

export default function ManageBranches() {
  // --- States ---
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modals & Pending Actions
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [pendingBranch, setPendingBranch] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  // --- Logic Tải dữ liệu ---
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

  useEffect(() => {
    loadBranches();
  }, [page, search]);

  const resetFilters = () => {
    setSearch("");
    setPage(0);
    loadBranches();
  };

  // --- Logic Lưu (Thêm/Sửa) ---
  const handleSaveBranch = async (formData) => {
    try {
      const isNew = !selectedBranch?.id;
      const branchRequest = {
        branchName: formData.branchName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      const multipart = new FormData();
      multipart.append(
        "branchRequest",
        new Blob([JSON.stringify(branchRequest)], { type: "application/json" })
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
      console.error("ERR:", err);
      const message = err?.response?.data?.message || "Lỗi kết nối server";
      return { error: message };
    }
  };

  // --- Logic Cập nhật trạng thái ---
  const handleUpdateBranchStatus = async (branchId, newStatus) => {
    try {
      await updateBranchStatus(branchId, newStatus);
      loadBranches();
    } catch (err) {
      alert("Không thể cập nhật trạng thái chi nhánh");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Quản lý chi nhánh</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý danh sách, thông tin và trạng thái vận hành</p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
            onClick={() => setSelectedBranch({ id: null })}
          >
            <FaPlus size={16} /> Thêm chi nhánh
          </button>
        </div>

        {/* --- Thanh công cụ tìm kiếm --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Tìm theo tên chi nhánh hoặc địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            onClick={resetFilters}
          >
            <FaSync size={14} className={loading ? "animate-spin" : ""} /> Tải lại
          </button>
        </div>

        {/* --- Bảng dữ liệu --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 border-b">Chi nhánh</th>
                  <th className="p-4 border-b">Liên hệ</th>
                  <th className="p-4 border-b">Ngày tạo</th>
                  <th className="p-4 border-b">Trạng thái</th>
                  <th className="p-4 border-b text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                  </tr>
                ) : branches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">Không tìm thấy chi nhánh nào</td>
                  </tr>
                ) : (
                  branches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                            {b.photoUrl ? (
                              <img 
                                src={`${API_BASE_URL}/${b.photoUrl}`} 
                                alt="" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><FaBuilding size={20} /></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{b.branchName}</div>
                            <div className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                              <FaMapMarkerAlt size={10} /> {b.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2"><FaEnvelope className="text-slate-400" size={10}/> {b.email}</div>
                        <div className="flex items-center gap-2"><FaPhone className="text-slate-400" size={10}/> {b.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 font-medium">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="p-4">
                        {b.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-tight">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Đang bảo trì
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1">
                          <button 
                            onClick={() => setSelectedBranch(b)} 
                            className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Xem chi tiết"
                          >
                            <FaEye size={16} />
                          </button>
                          <button 
                            onClick={() => setSelectedBranch({...b})} 
                            className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const newStatus = b.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
                              setPendingBranch(b); 
                              setPendingStatus(newStatus); 
                              setShowConfirmStatus(true);
                            }}
                            className={`p-2.5 rounded-lg transition-colors ${
                              b.status === "ACTIVE" ? "text-rose-500 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={b.status === "ACTIVE" ? "Đặt bảo trì" : "Kích hoạt lại"}
                          >
                            {b.status === "ACTIVE" ? <FaTools size={16} /> : <FaCheckCircle size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination --- */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-600">
              Trang <span className="font-bold text-slate-800">{page + 1}</span> / <span className="font-bold text-slate-800">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-5 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Trước
              </button>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-5 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      {selectedBranch && (
        <BranchModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          onSave={handleSaveBranch}
        />
      )}

      {showConfirmStatus && pendingBranch && (
        <ConfirmModal
          title="Thay đổi trạng thái"
          message={`Bạn có chắc muốn chuyển chi nhánh "${pendingBranch.branchName}" sang trạng thái ${
            pendingStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "BẢO TRÌ"
          }?`}
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
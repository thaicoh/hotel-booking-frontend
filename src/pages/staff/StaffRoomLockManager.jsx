import { useState, useEffect } from "react";
import { FaLock, FaCalendarAlt, FaClock, FaPlus, FaTrash, FaInfoCircle, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify"; // Giả sử bạn có dùng thư viện toast, nếu không có thể dùng alert

// APIs
import { getMyBranch } from "../../api/staff";
import { getRoomTypesByBranch } from "../../api/roomtypes";
import { getLocksByBranch, createRoomLock, deleteRoomLock, getAllBookingTypes } from "../../api/roomlocks";

// Components
import ConfirmModal from "../../components/common/ConfirmModal";

export default function StaffRoomLockManager() {
  // --- States ---
  const [branch, setBranch] = useState(null);
  const [locks, setLocks] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedLockId, setSelectedLockId] = useState(null);

  // Form Data State
  const [formData, setFormData] = useState({
    roomTypeId: "",
    bookingTypeId: "",
    lockedAt: "",
    unlockedAt: "",
    remarks: ""
  });

  // --- Helpers ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // --- Logic Tải dữ liệu ---
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy Branch ID
      const branchRes = await getMyBranch();
      if (branchRes.data.code === 1000) {
        const branchData = branchRes.data.result;
        setBranch(branchData);

        if (branchData?.id) {
          // 2. Load song song: Locks, RoomTypes, BookingTypes
          const [locksRes, rtRes, btRes] = await Promise.all([
            getLocksByBranch(branchData.id),
            getRoomTypesByBranch(branchData.id),
            getAllBookingTypes().catch(() => ({ data: { result: [] } })) // Fallback nếu chưa có API này
          ]);

          if (locksRes.data.code === 1000) setLocks(locksRes.data.result || []);
          if (rtRes.data.code === 1000) setRoomTypes(rtRes.data.result || []);
          if (btRes?.data?.code === 1000) setBookingTypes(btRes.data.result || []);
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu khóa phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Logic Tạo mới ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate cơ bản
      if (new Date(formData.lockedAt) >= new Date(formData.unlockedAt)) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }

      const payload = {
        roomTypeId: Number(formData.roomTypeId),
        bookingTypeId: Number(formData.bookingTypeId),
        lockedAt: formData.lockedAt, // format input datetime-local thường đã chuẩn ISO (hoặc gần chuẩn)
        unlockedAt: formData.unlockedAt,
        remarks: formData.remarks
      };

      const res = await createRoomLock(payload);
      if (res.data.code === 1000) {
        alert("Thêm khóa phòng thành công!");
        setShowCreateModal(false);
        setFormData({ roomTypeId: "", bookingTypeId: "", lockedAt: "", unlockedAt: "", remarks: "" });
        loadData(); // Reload list
      } else {
        alert(res.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server");
    }
  };

  // --- Logic Xóa ---
  const handleDeleteClick = (id) => {
    setSelectedLockId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedLockId) return;
    try {
      const res = await deleteRoomLock(selectedLockId);
      if (res.data.code === 1000) {
        // Cập nhật UI ngay lập tức bằng cách lọc mảng local
        setLocks(prev => prev.filter(l => l.id !== selectedLockId));
        setShowConfirmDelete(false);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Không thể xóa khóa này");
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-screen bg-gray-50 pt-20">
        <FaBuilding className="mx-auto text-4xl mb-4 text-gray-300" />
        <h2 className="text-xl font-bold">Chưa xác định chi nhánh</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <FaLock className="text-rose-500" /> Quản lý Khóa phòng
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Chặn đặt phòng tạm thời (Bảo trì, dọn dẹp, hoặc giữ phòng) tại <strong>{branch.branchName}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-200"
          >
            <FaPlus /> Thêm khóa mới
          </button>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 border-b">Loại phòng</th>
                  <th className="p-4 border-b">Hình thức khóa</th>
                  <th className="p-4 border-b">Thời gian khóa</th>
                  <th className="p-4 border-b">Ghi chú</th>
                  <th className="p-4 border-b">Người tạo</th>
                  <th className="p-4 border-b text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 italic">
                      Hiện tại không có phòng nào bị khóa.
                    </td>
                  </tr>
                ) : (
                  locks.map((lock) => {
                    // Check trạng thái dựa trên thời gian
                    const now = new Date();
                    const end = new Date(lock.unlockedAt);
                    const isActive = now < end;

                    return (
                      <tr key={lock.id} className={`hover:bg-slate-50 transition-colors ${!isActive ? 'opacity-60 bg-slate-50' : ''}`}>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{lock.roomType?.typeName}</div>
                          <div className="text-xs text-slate-500">ID: {lock.roomType?.id}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                             {lock.bookingType?.name || lock.bookingType?.code}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-rose-500 font-medium w-12 text-xs uppercase">Từ:</span>
                              <span className="font-mono">{formatDate(lock.lockedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600 font-medium w-12 text-xs uppercase">Đến:</span>
                              <span className="font-mono">{formatDate(lock.unlockedAt)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-600 max-w-[200px] truncate" title={lock.remarks}>
                            {lock.remarks || "—"}
                          </div>
                        </td>
                         <td className="p-4 text-sm text-slate-500">
                           {lock.lockedBy}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(lock.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors border border-rose-100"
                            title="Mở khóa (Xóa)"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Thêm khóa phòng mới</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >&times;</button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              {/* Chọn loại phòng */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Loại phòng</label>
                <select 
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({...formData, roomTypeId: e.target.value})}
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.typeName} (Tổng: {rt.roomCount})</option>
                  ))}
                </select>
              </div>

              {/* Chọn loại đặt phòng (Booking Type) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Loại hình đặt bị khóa</label>
                <select 
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.bookingTypeId}
                  onChange={(e) => setFormData({...formData, bookingTypeId: e.target.value})}
                >
                  <option value="">-- Chọn loại hình đặt --</option>
                  {bookingTypes.length > 0 ? (
                    bookingTypes.map(bt => (
                      <option key={bt.id} value={bt.id}>{bt.name} ({bt.code})</option>
                    ))
                  ) : (
                    // Fallback nếu chưa có API booking types
                    <>
                      <option value="1">Qua Đêm (Overnight)</option>
                      <option value="2">Theo Giờ (Hourly)</option>
                      <option value="3">Theo Ngày (Daily)</option>
                    </>
                  )}
                </select>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <FaInfoCircle /> Khách sẽ không thể tìm kiếm loại phòng này với hình thức đặt đã chọn.
                </p>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Bắt đầu khóa</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.lockedAt}
                    onChange={(e) => setFormData({...formData, lockedAt: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kết thúc khóa</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.unlockedAt}
                    onChange={(e) => setFormData({...formData, unlockedAt: e.target.value})}
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú / Lý do</label>
                <textarea 
                  rows="3"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Ví dụ: Bảo trì điều hòa, dọn vệ sinh sâu..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                ></textarea>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  Xác nhận khóa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {showConfirmDelete && (
        <ConfirmModal 
          title="Mở khóa phòng"
          message="Bạn có chắc chắn muốn xóa lệnh khóa này? Phòng sẽ có thể đặt được ngay lập tức."
          onCancel={() => setShowConfirmDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

    </div>
  );
}
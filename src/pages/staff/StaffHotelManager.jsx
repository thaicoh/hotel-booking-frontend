import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import { 
  FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, 
  FaEdit, FaBed, FaUsers, FaImage, FaArrowRight, FaPlus,
  FaTools, FaCheckCircle 
} from "react-icons/fa";

// APIs
import { getMyBranch } from "../../api/staff"; //
import { updateBranch, updateBranchStatus } from "../../api/branches"; //
import { getRoomTypesByBranch, createRoomType } from "../../api/roomtypes"; //
import { API_BASE_URL } from "../../config/api";

// Components
import BranchModal from "../../components/admin/BranchModal"; //
import RoomTypeQuickModal from "../../components/admin/RoomTypeQuickModal"; //
import ConfirmModal from "../../components/common/ConfirmModal"; //

export default function StaffHotelManager() {
  const navigate = useNavigate();

  // --- States ---
  const [branch, setBranch] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
  
  // State cho Confirm Modal (Bật/Tắt trạng thái)
  const [showConfirmStatus, setShowConfirmStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // --- Logic Tải dữ liệu ---
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Lấy thông tin Branch của Staff hiện tại
      const branchRes = await getMyBranch(); //
      if (branchRes.data.code === 1000) {
        const branchData = branchRes.data.result;
        setBranch(branchData);

        // 2. Lấy danh sách Room Types của Branch đó
        if (branchData?.id) {
          const rtRes = await getRoomTypesByBranch(branchData.id); //
          if (rtRes.data.code === 1000) {
            setRoomTypes(rtRes.data.result || []);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi tải thông tin khách sạn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Logic Lưu thông tin Branch ---
  const handleSaveBranch = async (formData) => {
    if (!branch?.id) return;
    try {
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

      const res = await updateBranch(branch.id, multipart); //

      if (res.data.code !== 1000) {
        return { error: res.data.message };
      }

      loadData();
      return { success: true };
    } catch (err) {
      console.error("ERR:", err);
      const message = err?.response?.data?.message || "Lỗi kết nối server";
      return { error: message };
    }
  };

  // --- Logic Cập nhật trạng thái (Active <-> Maintenance) ---
  const handleStatusChangeClick = () => {
    const newStatus = branch.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
    setPendingStatus(newStatus);
    setShowConfirmStatus(true);
  };

  const confirmUpdateStatus = async () => {
    if (!branch?.id || !pendingStatus) return;
    try {
      await updateBranchStatus(branch.id, pendingStatus); //
      // Cập nhật lại state local ngay lập tức để UI phản hồi nhanh
      setBranch(prev => ({ ...prev, status: pendingStatus }));
      setShowConfirmStatus(false);
    } catch (err) {
      console.error("Update status failed:", err);
      alert("Không thể cập nhật trạng thái chi nhánh");
    }
  };

  // --- Logic Thêm loại phòng nhanh ---
  const handleSaveRoomType = async (formData) => {
    if (!branch?.id) return;
    try {
      const res = await createRoomType({
        branchId: branch.id,
        typeName: formData.typeName,
        capacity: Number(formData.capacity),
        description: formData.description,
      });

      if (res.data.code !== 1000) {
        return { error: res.data.message };
      }

      // Reload danh sách phòng
      const rtRes = await getRoomTypesByBranch(branch.id);
      if (rtRes.data.code === 1000) {
        setRoomTypes(rtRes.data.result || []);
      }
      return { success: true };
    } catch (err) {
      const message = err?.data?.message;
      return { error: message ? `Lỗi: ${message}` : "Lỗi kết nối server" };
    }
  };

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
        <h2 className="text-xl font-bold">Không tìm thấy thông tin chi nhánh</h2>
        <p>Tài khoản của bạn chưa được gán vào chi nhánh nào.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Quản lý khách sạn</h1>
          <p className="text-slate-500 text-sm mt-1">Thông tin chi nhánh và thiết lập phòng</p>
        </div>

        {/* --- Phần 1: Thông tin Branch --- */}
        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-all ${
            branch.status === "ACTIVE" 
            ? "bg-white border-slate-200" 
            : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex flex-col md:flex-row">
            {/* Ảnh Branch */}
            <div className="md:w-1/3 h-64 md:h-auto relative bg-slate-100">
               {branch.photoUrl ? (
                  <img 
                    src={`${API_BASE_URL}/${branch.photoUrl}`} 
                    alt={branch.branchName} 
                    className="w-full h-full object-cover"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FaBuilding size={64} />
                  </div>
               )}
            </div>

            {/* Thông tin chi tiết */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{branch.branchName}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2 ${
                    branch.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${branch.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {branch.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang bảo trì'}
                  </span>
                </div>
                
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="mt-1 text-indigo-500 flex-shrink-0" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-indigo-500" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-indigo-500" />
                    <span>{branch.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100/50 flex flex-wrap gap-3 justify-end">
                {/* Nút Bật/Tắt trạng thái */}
                <button
                  onClick={handleStatusChangeClick}
                  className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all shadow-sm ${
                    branch.status === "ACTIVE"
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                  }`}
                >
                  {branch.status === "ACTIVE" 
                    ? <><FaTools /> Đặt bảo trì</> 
                    : <><FaCheckCircle /> Kích hoạt lại</>
                  }
                </button>

                {/* Nút Chỉnh sửa */}
                <button 
                  onClick={() => setShowBranchModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-amber-100"
                >
                  <FaEdit /> Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Phần 2: Danh sách loại phòng --- */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaBed className="text-indigo-600" /> Danh sách loại phòng
            </h3>
            <button
               onClick={() => setShowRoomTypeModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              <FaPlus size={14}/> Thêm loại phòng
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 border-b">Hình ảnh</th>
                    <th className="p-4 border-b">Tên loại phòng</th>
                    <th className="p-4 border-b text-center">Sức chứa</th>
                    <th className="p-4 border-b text-center">Số lượng phòng</th>
                    <th className="p-4 border-b">Giá tham khảo</th>
                    <th className="p-4 border-b text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomTypes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 italic">
                        Chưa có loại phòng nào được thiết lập.
                      </td>
                    </tr>
                  ) : (
                    roomTypes.map((rt) => (
                      <tr key={rt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                           {rt.mainPhotoUrl ? (
                              <img
                                src={`${API_BASE_URL}/${rt.mainPhotoUrl}`}
                                alt={rt.typeName}
                                className="w-20 h-14 object-cover rounded-lg shadow-sm border border-slate-100"
                              />
                            ) : (
                              <div className="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                                <FaImage size={20} />
                              </div>
                            )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{rt.typeName}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{rt.description}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                            <FaUsers size={10} /> {rt.capacity}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                            <FaBed size={10} /> {rt.roomCount || 0}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {rt.minPrice ? rt.minPrice.toLocaleString() + " đ" : <span className="text-xs font-normal text-slate-400">Chưa thiết lập</span>}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => navigate(`/staff/room-types/${rt.id}`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                            title="Chi tiết & Quản lý phòng"
                          >
                            <FaArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* --- Modals --- */}
      
      {showBranchModal && branch && (
        <BranchModal
          branch={branch}
          onClose={() => setShowBranchModal(false)}
          onSave={handleSaveBranch}
        />
      )}

      {showRoomTypeModal && branch && (
        <RoomTypeQuickModal
          branchId={branch.id}
          onClose={() => setShowRoomTypeModal(false)}
          onSave={handleSaveRoomType}
        />
      )}

      {/* Modal xác nhận chuyển trạng thái */}
      {showConfirmStatus && branch && (
        <ConfirmModal
          title="Thay đổi trạng thái"
          message={`Bạn có chắc muốn chuyển khách sạn sang trạng thái ${
            pendingStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "BẢO TRÌ"
          }?`}
          onCancel={() => setShowConfirmStatus(false)}
          onConfirm={confirmUpdateStatus}
        />
      )}

    </div>
  );
}
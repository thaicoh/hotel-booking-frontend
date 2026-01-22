import { useState, useEffect } from "react";
import { 
  FaStar, FaFilter, FaQuoteLeft, FaCalendarAlt, 
  FaUserCircle, FaBuilding, FaGlobe, FaBed 
} from "react-icons/fa";

// APIs
import { getBranches } from "../../api/branches";
import { getRoomTypesByBranch } from "../../api/roomtypes";
import { getReviewsForAdmin } from "../../api/reviews"; 

export default function AdminReviewManager() {
  // --- States ---
  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Filter States - Mặc định là "" để Backend nhận diện là null/không truyền
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");

  // --- Helpers ---
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <FaStar key={i} className={i <= rating ? "text-amber-400" : "text-gray-200"} size={14} />
        ))}
      </div>
    );
  };

  // --- 1. Load danh sách chi nhánh (chỉ load 1 lần) ---
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const res = await getBranches();
        if (res.data.code === 1000) setBranches(res.data.result || []);
      } catch (err) {
        console.error("Lỗi tải chi nhánh:", err);
      }
    };
    fetchInitData();
  }, []);

  // --- 2. Load RoomTypes khi đổi Chi nhánh ---
  useEffect(() => {
    const fetchRoomTypes = async () => {
      if (!selectedBranchId) {
        setRoomTypes([]);
        setSelectedRoomTypeId(""); // Reset loại phòng khi về "Tất cả chi nhánh"
        return;
      }
      try {
        const res = await getRoomTypesByBranch(selectedBranchId);
        if (res.data.code === 1000) setRoomTypes(res.data.result || []);
      } catch (err) {
        setRoomTypes([]);
      }
    };
    fetchRoomTypes();
  }, [selectedBranchId]);

  // --- 3. Load Reviews theo Filter (Branch + RoomType) ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        // Backend nhận @RequestParam(required = false), truyền rỗng/null sẽ lấy tất cả
        const res = await getReviewsForAdmin(
          selectedBranchId || null, 
          selectedRoomTypeId || null
        );
        if (res.data.code === 1000) {
          setReviews(res.data.result || []);
        }
      } catch (err) {
        console.error("Lỗi tải reviews:", err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
        setLoading(false);
      }
    };
    fetchReviews();
  }, [selectedBranchId, selectedRoomTypeId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">
              <FaGlobe /> Admin Dashboard
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              Quản Lý Phản Hồi
            </h1>
            <p className="text-slate-500 mt-1">
              {selectedBranchId ? "Đang xem chi nhánh cụ thể" : "Đang xem tất cả đánh giá trên hệ thống"}
            </p>
          </div>

          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Branch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Chi nhánh</label>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-transparent focus-within:border-indigo-300 transition-all">
                <FaBuilding className="text-slate-400" />
                <select
                  className="bg-transparent py-2 outline-none text-slate-700 font-semibold min-w-[160px] text-sm cursor-pointer"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.branchName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter RoomType */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Loại phòng</label>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-transparent focus-within:border-indigo-300 transition-all">
                <FaBed className="text-slate-400" />
                <select
                  className="bg-transparent py-2 outline-none text-slate-700 font-semibold min-w-[160px] text-sm cursor-pointer"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Tất cả loại phòng</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>{rt.typeName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List Reviews */}
        <div className="relative">
          {loadingReviews && (
             <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex justify-center pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
             </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-200">
              <FaQuoteLeft className="mx-auto text-5xl text-slate-100 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Không tìm thấy đánh giá</h3>
              <p className="text-slate-400">Hệ thống chưa ghi nhận đánh giá nào cho bộ lọc này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xl shadow-md font-bold">
                        {review.user?.fullName?.charAt(0) || <FaUserCircle />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">
                          {review.user?.fullName || "Khách ẩn danh"}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDateTime(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                         {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="flex-grow mb-6">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                      {review.comment || <span className="italic text-slate-300 font-light">Không có nội dung bình luận.</span>}
                    </p>
                  </div>

                  {/* Booking Info - Footer */}
                  <div className="pt-4 border-t border-slate-50 bg-slate-50/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Booking ID</span>
                       <span className="text-[11px] font-mono font-bold text-indigo-600">
                         #{review.booking?.bookingReference || 'SYSTEM'}
                       </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                         <span className="text-slate-400 flex items-center gap-1"><FaCalendarAlt size={10} /> Check-in:</span>
                         <span className="font-semibold text-slate-600">{review.booking?.checkInDate || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                         <span className="text-slate-400 flex items-center gap-1"><FaCalendarAlt size={10} /> Check-out:</span>
                         <span className="font-semibold text-slate-600">{review.booking?.checkOutDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaFilter, 
  FaQuoteLeft, 
  FaCalendarAlt, 
  FaUserCircle, 
  FaBuilding 
} from "react-icons/fa";

// APIs
import { getMyBranch } from "../../api/staff";
import { getRoomTypesByBranch } from "../../api/roomtypes";
import { getReviewsByRoomType } from "../../api/reviews"; // Import API vừa tạo

export default function StaffReviewManager() {
  // --- States ---
  const [branch, setBranch] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Filter State (Mặc định là rỗng "" nghĩa là Tất cả)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState("");

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper render ngôi sao
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  // --- Logic Tải dữ liệu ban đầu (Branch & RoomTypes) ---
  useEffect(() => {
    const loadInitData = async () => {
      try {
        setLoading(true);
        // 1. Lấy Branch ID
        const branchRes = await getMyBranch();
        if (branchRes.data.code === 1000) {
          const branchData = branchRes.data.result;
          setBranch(branchData);

          // 2. Lấy RoomTypes của Branch đó để làm dropdown
          if (branchData?.id) {
            const rtRes = await getRoomTypesByBranch(branchData.id);
            if (rtRes.data.code === 1000) {
              setRoomTypes(rtRes.data.result || []);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu ban đầu:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitData();
  }, []);

  // --- Logic Tải Reviews khi thay đổi bộ lọc ---
  useEffect(() => {
    // Chỉ chạy khi đã xác định được branch (tránh chạy lần đầu khi branch null)
    if (!branch) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        // Gọi API: nếu selectedRoomTypeId rỗng -> lấy tất cả
        const res = await getReviewsByRoomType(selectedRoomTypeId || null);
        if (res.data.code === 1000) {
          setReviews(res.data.result || []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Lỗi tải reviews:", err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [selectedRoomTypeId, branch]); // Chạy lại khi filter thay đổi hoặc branch load xong

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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <FaStar className="text-yellow-500" /> Quản lý Đánh giá
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem phản hồi của khách hàng tại chi nhánh <strong>{branch.branchName}</strong>
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="px-3 text-slate-400">
              <FaFilter />
            </div>
            <select
              className="p-2 bg-transparent outline-none text-slate-700 font-medium min-w-[200px] cursor-pointer"
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
            >
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.typeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-transparent">
          {loadingReviews ? (
             <div className="py-20 flex justify-center text-slate-400">
                <span className="loading-spinner">Đang tải đánh giá...</span>
             </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <FaQuoteLeft className="mx-auto text-4xl text-slate-200 mb-4" />
              <p className="text-slate-500 italic">Chưa có đánh giá nào cho lựa chọn này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div 
                  key={review.reviewId} 
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Card Header: User Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
                        <FaUserCircle />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {review.user?.fullName || "Khách ẩn danh"}
                        </h4>
                        <span className="text-xs text-slate-400 block">
                          {formatDateTime(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    {/* Rating Badge */}
                    <div className="bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                        {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Card Body: Comment */}
                  <div className="mb-6">
                    <div className="relative">
                      <FaQuoteLeft className="absolute -top-1 -left-1 text-slate-100 text-2xl z-0" />
                      <p className="relative z-10 text-slate-600 text-sm leading-relaxed pl-2">
                        {review.comment || "Không có nội dung bình luận."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Booking Info */}
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-semibold text-slate-400 uppercase">Mã đặt phòng</span>
                       <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                         #{review.booking?.bookingReference}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-emerald-500" />
                        <span>In: {formatDate(review.booking?.checkInDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-rose-500" />
                        <span>Out: {formatDate(review.booking?.checkOutDate)}</span>
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking, getBookingDetails } from '../../api/bookings'; 
import { createReview } from '../../api/reviews';
import { 
  FaCalendarAlt, FaCreditCard, FaStar, FaTimesCircle, 
  FaInfoCircle, FaTimes, FaUser, FaHotel, FaMoneyBillWave, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify'; 

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- Modal States ---
  const [selectedBooking, setSelectedBooking] = useState(null); 
  const [detailedBooking, setDetailedBooking] = useState(null); 
  const [loadingDetails, setLoadingDetails] = useState(false);  
   
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // --- Review Form State ---
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- Load Data ---
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      if (res.data && res.data.code === 1000) {
        const sorted = (res.data.result || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- Helpers ---
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
   
  const getStatusBadge = (status) => {
    const map = {
      'PAID': 'bg-green-100 text-green-700 border-green-200',
      'RESERVED': 'bg-blue-100 text-blue-700 border-blue-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
      'CHECKED_OUT': 'bg-purple-100 text-purple-700 border-purple-200',
      'SUCCESS': 'bg-green-100 text-green-700'
    };
    return `px-2 py-1 rounded text-xs font-bold border ${map[status] || 'bg-gray-100'}`;
  };

  // Helper hiển thị sao nhỏ (read-only)
  const renderMiniStars = (rating) => {
    return (
      <div className="flex items-center text-yellow-400 gap-0.5" title={`Bạn đã đánh giá ${rating} sao`}>
        {[...Array(5)].map((_, i) => (
           <FaStar key={i} size={12} className={i < rating ? "text-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    );
  };

  // --- 🆕 Handlers: Details (Gọi API mới) ---
  const handleDetailClick = async (bookingId) => {
    setShowDetailModal(true);
    setLoadingDetails(true);
    try {
      const res = await getBookingDetails(bookingId);
      if (res.data.code === 1000) {
        setDetailedBooking(res.data.result);
      } else {
        alert("Không thể tải chi tiết đơn hàng.");
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- Handlers: Cancel & Review ---
  const handleCancelClick = (booking) => { setSelectedBooking(booking); setShowCancelModal(true); };
  const handleReviewClick = (booking) => { setSelectedBooking(booking); setReviewForm({ rating: 5, comment: '' }); setShowReviewModal(true); };

  const confirmCancel = async () => {
    if (!selectedBooking) return;
    try {
      setSubmitting(true);
      const res = await cancelBooking(selectedBooking.bookingId);
      if (res.data.code === 1000) {
        alert("Hủy phòng thành công!");
        setShowCancelModal(false);
        fetchBookings();
      } else {
        alert(res.data.message || "Không thể hủy booking này.");
      }
    } catch (err) { alert("Lỗi kết nối server."); } finally { setSubmitting(false); }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return alert("Vui lòng nhập nội dung.");
    try {
      setSubmitting(true);
      const res = await createReview({ bookingId: selectedBooking.bookingId, ...reviewForm });
      if (res.data.code === 1000) { 
        alert("Đánh giá thành công!"); 
        setShowReviewModal(false); 
        fetchBookings(); // Reload lại để cập nhật trạng thái reviewed = true
      }
      else { alert(res.data.message); }
    } catch (err) { alert("Lỗi gửi đánh giá."); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử đặt phòng</h1>
          <button onClick={() => navigate('/')} className="text-orange-600 hover:underline font-medium">+ Đặt phòng mới</button>
        </div>

        {/* --- Table List --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           {bookings.length === 0 ? (
             <div className="p-8 text-center text-gray-500">Bạn chưa có đơn đặt phòng nào.</div>
           ) : (
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Chi nhánh / Loại phòng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đến - đi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{b.branchName}</div>
                        <div className="text-sm text-orange-600">{b.roomTypeName}</div>
                        <div className="text-xs text-gray-400">#{b.bookingReference}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateTime(b.checkInDate)} <br/> 
                          <span className="text-gray-400 text-xs">đến</span> <br/>
                          {formatDateTime(b.checkOutDate)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-6 py-4"><span className={getStatusBadge(b.status)}>{b.status}</span></td>
                      <td className="px-6 py-4 flex flex-col items-center justify-center gap-2">
                        {/* Nút Chi tiết */}
                        <div className="flex gap-2">
                            <button onClick={() => handleDetailClick(b.bookingId)} className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100" title="Chi tiết"><FaInfoCircle /></button>
                            
                            {/* Logic Hủy: Chỉ hiện khi RESERVED */}
                            {b.status === 'RESERVED' && (
                                <button onClick={() => handleCancelClick(b)} className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100" title="Hủy phòng"><FaTimesCircle /></button>
                            )}
                        </div>

                        {/* Logic Review: Chỉ hiện khi CHECKED_OUT */}
                        {b.status === 'CHECKED_OUT' && (
                            b.reviewed ? (
                                // Nếu đã đánh giá -> Hiện số sao
                                <div className="mt-1 flex flex-col items-center">
                                    {renderMiniStars(b.rating)}
                                    <span className="text-[10px] text-gray-400">Đã đánh giá</span>
                                </div>
                            ) : (
                                // Nếu chưa đánh giá -> Hiện nút Review
                                <button onClick={() => handleReviewClick(b)} className="mt-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 flex items-center gap-1">
                                    <FaStar /> Đánh giá
                                </button>
                            )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
           )}
        </div>
      </div>

      {/* --- MODAL: CHI TIẾT ĐẦY ĐỦ --- */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaHotel className="text-orange-600"/> Chi tiết đặt phòng
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"><FaTimes /></button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {loadingDetails || !detailedBooking ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>
              ) : (
                <>
                  {/* --- Phần hiển thị trạng thái đánh giá trong modal --- */}
                  {detailedBooking.status === 'CHECKED_OUT' && detailedBooking.reviewed && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-center justify-between">
                          <span className="text-yellow-800 font-medium text-sm flex items-center gap-2">
                              <FaCheckCircle /> Bạn đã đánh giá dịch vụ này
                          </span>
                          <div className="flex bg-white px-2 py-1 rounded border border-yellow-100">
                             {renderMiniStars(detailedBooking.rating)}
                          </div>
                      </div>
                  )}

                  {/* Section 1: Thông tin chung & Khách hàng */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Thông tin phòng</h4>
                      <div className="text-sm">
                        <p className="text-gray-500">Mã đặt phòng:</p>
                        <p className="font-mono font-bold text-lg text-gray-800">{detailedBooking.bookingReference}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500">Chi nhánh:</p>
                        <p className="font-semibold">{detailedBooking.branchName}</p>
                      </div>
                      <div className="text-sm">
                          <p className="text-gray-500">Loại phòng:</p>
                          <p className="font-semibold text-orange-600">{detailedBooking.roomTypeName}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500">Số phòng:</p>
                        {detailedBooking.roomNumber ? (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">Phòng {detailedBooking.roomNumber}</span>
                        ) : (
                          <span className="text-gray-400 italic">Chưa xếp phòng</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Khách hàng & Thời gian</h4>
                      <div className="text-sm">
                          <p className="text-gray-500">Người đặt:</p>
                          <p className="font-semibold flex items-center gap-1"><FaUser className="text-gray-400"/> {detailedBooking.customerName}</p>
                      </div>
                      <div className="text-sm">
                          <p className="text-gray-500">Số điện thoại:</p>
                          <p className="font-mono">{detailedBooking.customerPhone}</p>
                      </div>
                      <div className="text-sm grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-gray-50 p-2 rounded border">
                          <span className="text-xs text-gray-500 block">Check-in</span>
                          <span className="font-bold text-gray-800">{formatDateTime(detailedBooking.checkInDate)}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border">
                          <span className="text-xs text-gray-500 block">Check-out</span>
                          <span className="font-bold text-gray-800">{formatDateTime(detailedBooking.checkOutDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Thanh toán */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase border-b pb-1 mb-3 flex items-center gap-2">
                      <FaMoneyBillWave /> Lịch sử thanh toán
                    </h4>
                    
                    {detailedBooking.payments && detailedBooking.payments.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden text-sm">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Ngày GD</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Phương thức</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Số tiền</th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailedBooking.payments.map((p) => (
                              <tr key={p.paymentId}>
                                <td className="px-3 py-2 text-gray-600">{new Date(p.paymentDate).toLocaleDateString('vi-VN')}</td>
                                <td className="px-3 py-2 font-medium">{p.paymentMethod}</td>
                                <td className="px-3 py-2 font-bold text-gray-800">{formatCurrency(p.amount)}</td>
                                <td className="px-3 py-2 text-right">
                                  <span className={getStatusBadge(p.paymentStatus)}>{p.paymentStatus}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-sm">Chưa có giao dịch thanh toán nào.</div>
                    )}
                  </div>

                  {/* Footer Info: Status & Total */}
                  <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center border border-orange-100">
                    <div>
                      <span className="text-sm text-gray-500 block">Trạng thái đơn</span>
                      <span className={getStatusBadge(detailedBooking.status)}>{detailedBooking.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500 block">Tổng tiền phải trả</span>
                      <span className="text-2xl font-bold text-orange-600">{formatCurrency(detailedBooking.totalPrice)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            {detailedBooking && (
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
                {detailedBooking.status === 'RESERVED' && (
                  <button 
                    onClick={() => { setShowDetailModal(false); handleCancelClick(detailedBooking); }}
                    className="px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition"
                  >
                    Hủy phòng
                  </button>
                )}
                
                {/* Chỉ hiện nút Đánh giá khi CHECKED_OUT và CHƯA Đánh giá */}
                {detailedBooking.status === 'CHECKED_OUT' && !detailedBooking.reviewed && (
                    <button 
                    onClick={() => { setShowDetailModal(false); handleReviewClick(detailedBooking); }}
                    className="px-4 py-2 text-yellow-600 font-bold hover:bg-yellow-50 rounded-lg transition flex items-center gap-2"
                  >
                    <FaStar /> Viết đánh giá
                  </button>
                )}

                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- ReviewModal và CancelModal giữ nguyên --- */}
      {showCancelModal && selectedBooking && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
                 <FaTimesCircle className="mx-auto text-4xl text-red-500 mb-4"/>
                 <h3 className="font-bold text-lg mb-2">Hủy phòng?</h3>
                 <p className="text-sm text-gray-500 mb-4">Bạn chắc chắn muốn hủy đơn <b>{selectedBooking.bookingReference}</b>?</p>
                 <div className="flex gap-2">
                    <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2 bg-gray-100 rounded-lg font-bold">Quay lại</button>
                    <button onClick={confirmCancel} disabled={submitting} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">{submitting ? '...' : 'Xác nhận'}</button>
                 </div>
             </div>
         </div>
      )}

      {showReviewModal && selectedBooking && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="font-bold text-lg text-center mb-4">Đánh giá trải nghiệm</h3>
                <div className="flex justify-center gap-2 mb-4">
                   {[1,2,3,4,5].map(s => (
                       <FaStar key={s} size={30} className={`cursor-pointer ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setReviewForm({...reviewForm, rating: s})}/>
                   ))}
                </div>
                <textarea className="w-full border rounded-lg p-3 mb-4" rows="3" placeholder="Nhập đánh giá của bạn..." value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm, comment: e.target.value})}></textarea>
                <button onClick={submitReview} disabled={submitting} className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700">{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
                <button onClick={() => setShowReviewModal(false)} className="w-full mt-2 text-gray-500 text-sm hover:underline">Đóng</button>
            </div>
         </div>
      )}

    </div>
  );
};

export default MyBookingsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings';
import { FaCalendarAlt, FaHotel, FaRegClock, FaCreditCard } from 'react-icons/fa';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        if (res.data && res.data.code === 1000) {
          setBookings(res.data.result);
        } else {
          setError("Không thể tải danh sách đơn hàng.");
        }
      } catch (err) {
        setError("Đã có lỗi xảy ra khi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PAID': 'bg-green-100 text-green-700 border-green-200',
      'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
      'SUCCESS': 'bg-green-100 text-green-700 border-green-200'
    };
    return `px-3 py-1 rounded-full text-xs font-bold border ${statusMap[status] || 'bg-gray-100 text-gray-700'}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Lịch sử đặt phòng</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-orange-600 hover:underline font-medium"
          >
            + Đặt phòng mới
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 mb-4">Bạn chưa có đơn đặt phòng nào.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Chi tiết phòng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Thời gian lưu trú</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{b.branchName}</div>
                        <div className="text-sm text-orange-600">{b.roomTypeName}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Ref: {b.bookingReference.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-16 text-gray-400">Vào:</span> {formatDate(b.checkInDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16 text-gray-400">Ra:</span> {formatDate(b.checkOutDate)}
                        </div>
                        <div className="mt-1 font-medium text-gray-800">Loại: {b.bookingTypeName}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(b.status)}>{b.status}</span>
                        <div className="text-[10px] mt-2 text-gray-400 uppercase tracking-tighter">
                          {b.isPaid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {bookings.map((b) => (
                <div key={b.bookingId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{b.branchName}</h3>
                      <p className="text-orange-600 text-sm font-medium">{b.roomTypeName}</p>
                    </div>
                    <span className={getStatusBadge(b.status)}>{b.status}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaRegClock className="text-gray-400" />
                      <span>Hình thức: {b.bookingTypeName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaCreditCard className="text-gray-400" />
                      <span className="font-bold text-gray-900">{formatCurrency(b.totalPrice)}</span>
                      <span className={`text-[10px] px-1 rounded ${b.isPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {b.isPaid ? 'PAID' : 'UNPAID'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
import { useEffect, useState, useCallback, useRef } from "react";
import { getBookings, getBranches, getRoomTypes } from "../../api/bookings";
import { FaSearch, FaRedo, FaEdit, FaEye, FaBan, FaCheckCircle, FaBell } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";

// 1️⃣ Import thư viện WebSocket
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ManageBookings = () => {
  // ✅ Default values
  const DEFAULT_FILTERS = {
    branchId: "",
    roomTypeId: "",
    bookingType: "",
    bookingStatus: "",
    paymentStatus: "",
    checkInDate: "",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [isLoading, setIsLoading] = useState(true);
  
  // State cho thông báo real-time
  const [newBookingAlert, setNewBookingAlert] = useState(null);

  // Load danh sách Branch & RoomType khi mới vào trang
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [branchRes, roomTypeRes] = await Promise.all([
          getBranches(),
          getRoomTypes()
        ]);
        setBranches(branchRes.data.result || []);
        setRoomTypes(roomTypeRes.data.result || []);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  // ✅ Hàm gọi API lấy danh sách Booking
  const fetchBookingsData = useCallback(async () => {
    // Không set isLoading=true ở đây để tránh bảng bị nháy khi auto-reload
    // setIsLoading(true); 
    try {
      const currentFilters = {
        ...filters,
        searchQuery,
      };

      const res = await getBookings(currentFilters, page, pageSize);
      
      if (res.data && res.data.code === 1000) {
        const result = res.data.result;
        setBookings(result.items || []); 
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery, page]);

  // Gọi API khi page thay đổi
  useEffect(() => {
    setIsLoading(true); // Chỉ hiện loading khi chuyển trang hoặc filter tay
    fetchBookingsData();
  }, [page]); 

  // ============================================================
  // 🔥 WEBSOCKET SETUP START
  // ============================================================
  useEffect(() => {
    const socketUrl = API_BASE_URL.replace('/api', '') + "/ws-bookings";
    
    // Lấy token từ localStorage (đảm bảo key đúng với dự án của bạn, thường là 'token')
    const token = localStorage.getItem("token"); 

    const socket = new SockJS(socketUrl);
    const stompClient = Stomp.over(socket);

    stompClient.debug = null; 

    // Truyền token vào headers của lệnh connect
    const headers = {
      Authorization: `Bearer ${token}`
    };

    stompClient.connect(headers, (frame) => {
      console.log('✅ Connected to WebSocket');
      
      stompClient.subscribe('/topic/bookings', (message) => {
        if (message.body) {
          setNewBookingAlert("Có đơn đặt phòng mới!");
          fetchBookingsData();
        }
      });
    }, (error) => {
      console.error('❌ WebSocket error:', error);
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [fetchBookingsData]);
  // ============================================================
  // 🔥 WEBSOCKET SETUP END
  // ============================================================


  // Handler cho nút "Cập nhật" (Search)
  const handleSearchClick = () => {
    setPage(0); 
    setIsLoading(true);
    fetchBookingsData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    setPage(0);
    setTimeout(() => {
        setIsLoading(true);
        fetchBookingsData();
    }, 100);
  };

  const handleAction = (action, bookingId) => {
    alert(`Action ${action} on booking with ID: ${bookingId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen relative">
      
      {/* 🔥 THÔNG BÁO REAL-TIME */}
      {newBookingAlert && (
        <div className="fixed top-20 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
            <FaBell className="text-xl animate-pulse"/>
            <div>
                <h4 className="font-bold">Booking Mới!</h4>
                <p className="text-sm">{newBookingAlert}</p>
            </div>
            <button onClick={() => setNewBookingAlert(null)} className="ml-4 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Đặt phòng</h1>
        <div className="text-sm text-gray-500">
          Tổng cộng: <span className="font-bold text-orange-600">{totalElements}</span> đơn
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-700">Bộ lọc tìm kiếm</h3>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1 transition"
          >
            <FaRedo className="text-xs" /> Đặt lại
          </button>
        </div>

        {/* Grid filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4 lg:col-span-1">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm kiếm chung</label>
             <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tên khách / SĐT / Mã Booking..."
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chi nhánh</label>
            <select
              name="branchId"
              value={filters.branchId}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại phòng</label>
            <select
              name="roomTypeId"
              value={filters.roomTypeId}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.typeName}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hình thức đặt</label>
            <select
              name="bookingType"
              value={filters.bookingType}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Tất cả</option>
              <option value="DAY">Theo ngày</option>
              <option value="NIGHT">Qua đêm</option>
              <option value="HOUR">Theo giờ</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái đơn</label>
            <select
              name="bookingStatus"
              value={filters.bookingStatus}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Thanh toán</label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Đã thanh toán (PAID)</option>
              <option value="PENDING">Chưa thanh toán</option>
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày Check-in</label>
            <input
              type="date"
              name="checkInDate"
              value={filters.checkInDate}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
                onClick={handleSearchClick}
                className="w-full h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
            >
                <FaSearch /> Cập nhật kết quả
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4">Mã Booking</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Chi nhánh / Phòng</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4 text-center">Thanh toán</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-orange-50 transition">
                      {/* Booking Ref */}
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {booking.bookingReference}
                        <div className="text-xs text-gray-400 mt-1">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{booking.customerName}</div>
                        <div className="text-gray-500 text-xs">{booking.customerPhone}</div>
                      </td>

                      {/* Branch Info */}
                      <td className="px-6 py-4">
                        <div className="font-semibold">{booking.branchName}</div>
                        <div className="text-orange-600 text-xs">{booking.roomTypeName} ({booking.bookingTypeName})</div>
                      </td>

                      {/* Check In/Out */}
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div><span className="font-semibold w-8 inline-block">In:</span> {booking.checkInDate}</div>
                        <div><span className="font-semibold w-8 inline-block">Out:</span> {booking.checkOutDate}</div>
                      </td>

                      {/* Total Price */}
                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(booking.totalPrice)}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                            ${booking.isPaid 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {booking.isPaid ? "Đã TT" : "Chưa TT"}
                        </span>
                        <div className="text-[10px] mt-1 text-gray-400">{booking.paymentStatus}</div>
                      </td>

                      {/* Booking Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border
                             ${booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                               booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                               booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                               'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleAction("View", booking.bookingId)} className="text-blue-500 hover:text-blue-700 tooltip" title="Xem">
                                <FaEye size={18}/>
                            </button>
                            <button onClick={() => handleAction("Edit", booking.bookingId)} className="text-yellow-500 hover:text-yellow-700" title="Sửa">
                                <FaEdit size={18}/>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {bookings.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-gray-500" colSpan={8}>
                         Không tìm thấy đơn đặt phòng nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
                    <button 
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
                    >
                        Trước
                    </button>
                    <span className="text-sm text-gray-600">
                        Trang <span className="font-bold">{page + 1}</span> / {totalPages}
                    </span>
                    <button 
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium"
                    >
                        Sau
                    </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
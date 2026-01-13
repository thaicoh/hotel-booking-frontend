import React, { useEffect, useState, useCallback } from "react";
import { 
  FaSearch, 
  FaRedo, 
  FaEdit, 
  FaEye, 
  FaBell, 
  FaBuilding,
  FaDoorOpen,    // Icon xếp phòng
  FaTimes,       // Icon đóng modal
  FaCheckCircle,
  FaTimesCircle, // Icon hủy xếp phòng
  FaMinusCircle
} from "react-icons/fa";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// Import API
import { 
    getBookings, 
    getRoomTypes, 
    getAvailableRoomsForBooking, 
    assignRoomToBooking,
    removeRoomFromBooking ,
    getBookingDetails,
    updateBookingStatus
} from "../../api/bookings";
import { getMyBranch } from "../../api/staff";
import { API_BASE_URL } from "../../config/api";

const ManageBookings = () => {
  // --- UTILS: Lấy ngày hiện tại YYYY-MM-DD ---
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Định nghĩa danh sách loại đặt phòng cố định
  const BOOKING_TYPES = [
    { code: "DAY", label: "Theo Ngày" },
    { code: "HOUR", label: "Theo Giờ" },
    { code: "NIGHT", label: "Qua Đêm" },
  ];

  // Định nghĩa danh sách trạng thái theo yêu cầu
  const STATUS_OPTIONS = [
      { code: "RESERVED",    label: "Giữ phòng (Chưa thanh toán)", color: "text-yellow-600 bg-yellow-50" },
      { code: "PAID",        label: "Đã thanh toán (Chưa nhận phòng)", color: "text-green-600 bg-green-50" },
      { code: "CHECKED_IN",  label: "Đã nhận phòng (Check-in)",    color: "text-blue-600 bg-blue-50" },
      { code: "CHECKED_OUT", label: "Đã trả phòng (Check-out)",    color: "text-gray-600 bg-gray-50" },
      { code: "CANCELLED",   label: "Đã hủy",                      color: "text-red-600 bg-red-50" },
  ];

  // --- STATE QUẢN LÝ DỮ LIỆU CHUNG ---
  const [myBranch, setMyBranch] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookings, setBookings] = useState([]);

  // --- STATE BỘ LỌC & PHÂN TRANG ---
  // 🆕 CẬP NHẬT: Mặc định checkInDate là hôm nay
  const DEFAULT_FILTERS = {
    roomTypeId: "",
    bookingType: "",
    bookingStatus: "",
    paymentStatus: "",
    checkInDate: getTodayString(), 
  };

  // --- STATE MODAL CHI TIẾT BOOKING  ---
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [isLoading, setIsLoading] = useState(true);
  const [newBookingAlert, setNewBookingAlert] = useState(null);

  // --- STATE MODAL GÁN PHÒNG ---
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);      
  const [isAssignLoading, setIsAssignLoading] = useState(false);   

  // --- STATE MODAL EDIT STATUS ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null); // Booking đang được chọn để sửa
  const [selectedStatus, setSelectedStatus] = useState("");   // Trạng thái mới đang chọn
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // ============================================================
  // 1️⃣ KHỞI TẠO DATA
  // ============================================================
  useEffect(() => {
    const initStaffData = async () => {
      try {
        const branchRes = await getMyBranch();
        if (branchRes.data?.result) {
          const branch = branchRes.data.result;
          setMyBranch(branch);

          const roomTypeRes = await getRoomTypes(branch.id);
          if (roomTypeRes.data?.result) {
            setRoomTypes(roomTypeRes.data.result);
          }
        }
      } catch (error) {
        console.error("Failed to initialize staff data", error);
      }
    };
    initStaffData();
  }, []);

  // ============================================================
  // 2️⃣ FETCH BOOKINGS
  // ============================================================
  const fetchBookingsData = useCallback(async () => {
    if (!myBranch) return;

    try {
      const currentFilters = {
        ...filters,
        searchQuery,
        branchId: myBranch.id 
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
  }, [filters, searchQuery, page, myBranch]);

  useEffect(() => {
    if (myBranch) {
      setIsLoading(true);
      fetchBookingsData();
    }
  }, [page, myBranch, fetchBookingsData]);

  // ============================================================
  // 3️⃣ WEBSOCKET
  // ============================================================
  useEffect(() => {
    if (!myBranch) return;

    const socketUrl = API_BASE_URL.replace('/api', '') + "/ws-bookings";
    const token = localStorage.getItem("token"); 

    const socket = new SockJS(socketUrl);
    const stompClient = Stomp.over(socket);
    stompClient.debug = null; 

    const headers = { Authorization: `Bearer ${token}` };

    stompClient.connect(headers, () => {
      console.log("✅ WebSocket connected successfully!");
      stompClient.subscribe(`/topic/branch/${myBranch.id}/bookings`, (message) => {
        if (message.body) {
          setNewBookingAlert("Có đơn đặt phòng mới tại chi nhánh của bạn!");
          fetchBookingsData(); // Reload khi có thông báo
        }
      });
    }, (err) => console.error('❌ WS Error:', err));

    return () => {
      if (stompClient && stompClient.connected) stompClient.disconnect();
    };
  }, [fetchBookingsData, myBranch]);

  // ============================================================
  // 4️⃣ HANDLERS CHUNG
  // ============================================================
  const handleSearchClick = () => { setPage(0); setIsLoading(true); fetchBookingsData(); };
  const handleFilterChange = (e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  
  const handleResetFilters = () => {
    // Reset về mặc định (bao gồm ngày hôm nay)
    setFilters(DEFAULT_FILTERS); 
    setSearchQuery(""); 
    setPage(0);
    setTimeout(() => { setIsLoading(true); fetchBookingsData(); }, 100);
  };

  const handleAction = (action, bookingId) => { alert(`Staff Action: ${action} on booking ID: ${bookingId}`); };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  // ============================================================
  // 🆕 HANDLERS XỬ LÝ GÁN / HỦY PHÒNG
  // ============================================================
  
  // 1. Mở Modal chọn phòng
  const handleOpenAssignModal = async (bookingId) => {
    setSelectedBookingId(bookingId);
    setAvailableRooms([]);
    setIsAssignLoading(true);
    setShowAssignModal(true);

    try {
        const res = await getAvailableRoomsForBooking(bookingId);
        if (res.data && res.data.code === 1000) {
            setAvailableRooms(res.data.result.availableRooms || []);
        } else {
            alert("Không thể tải danh sách phòng khả dụng.");
        }
    } catch (error) {
        console.error("Lỗi lấy phòng trống:", error);
        alert("Lỗi hệ thống khi tải danh sách phòng.");
    } finally {
        setIsAssignLoading(false);
    }
  };

  // 2. Xác nhận gán phòng
  const handleConfirmAssign = async (roomId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xếp phòng này cho khách?")) return;

    try {
        const res = await assignRoomToBooking(selectedBookingId, roomId);
        if (res.data && res.data.code === 1000) {
            alert("✅ Xếp phòng thành công!");
            setShowAssignModal(false);
            fetchBookingsData(); 
        } else {
            alert("❌ Xếp phòng thất bại: " + (res.data.message || "Lỗi không xác định"));
        }
    } catch (error) {
        alert("❌ Đã có lỗi xảy ra khi gán phòng.");
    }
  };

  // 🆕 3. Hủy gán phòng
  const handleRemoveRoom = async (bookingId, roomNumber) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn HỦY phòng ${roomNumber} khỏi booking này?`)) return;

    try {
        const res = await removeRoomFromBooking(bookingId);
        if (res.data && res.data.result === "success") {
            alert("✅ Đã hủy phòng thành công!");
            fetchBookingsData(); // Reload lại bảng
        } else {
            alert("❌ Hủy phòng thất bại.");
        }
    } catch (error) {
        console.error("Lỗi hủy phòng:", error);
        alert("❌ Đã có lỗi xảy ra khi hủy phòng.");
    }
  };

  // --- HANDLER XEM CHI TIẾT ---
  const handleViewDetail = async (bookingId) => {
      setShowDetailModal(true);
      setIsDetailLoading(true);
      setSelectedBookingDetail(null); // Reset dữ liệu cũ

      try {
          const res = await getBookingDetails(bookingId);
          if (res.data && res.data.code === 1000) {
              setSelectedBookingDetail(res.data.result);
          } else {
              alert("Không thể tải thông tin chi tiết: " + res.data.message);
              setShowDetailModal(false);
          }
      } catch (error) {
          console.error("Lỗi tải chi tiết:", error);
          alert("Lỗi kết nối server.");
          setShowDetailModal(false);
      } finally {
          setIsDetailLoading(false);
      }
  };

  // Mở Modal Edit
  const handleOpenEditModal = (booking) => {
      setEditingBooking(booking);
      setSelectedStatus(booking.status); // Mặc định chọn trạng thái hiện tại
      setShowEditModal(true);
  };

  // Gọi API Cập nhật
  const handleConfirmUpdateStatus = async () => {
      if (!editingBooking) return;
      if (selectedStatus === editingBooking.status) {
          alert("Trạng thái mới trùng với trạng thái hiện tại!");
          return;
      }
      
      // Confirm đơn giản
      if (!window.confirm(`Bạn có chắc muốn đổi trạng thái từ ${editingBooking.status} sang ${selectedStatus}?`)) return;

      setIsUpdatingStatus(true);
      try {
          const res = await updateBookingStatus(editingBooking.bookingId, selectedStatus);
          
          // Kiểm tra response dựa trên ApiResponse Java của bạn
          if (res.data && (res.data.result === "success" || res.data.code === 1000)) {
              alert("✅ Cập nhật trạng thái thành công!");
              setShowEditModal(false);
              fetchBookingsData(); // Load lại bảng dữ liệu
          } else {
              alert("❌ Cập nhật thất bại: " + (res.data.message || "Lỗi server"));
          }
      } catch (error) {
          console.error("Update status error:", error);
          alert("❌ Lỗi kết nối khi cập nhật trạng thái.");
      } finally {
          setIsUpdatingStatus(false);
      }
  };


  // ============================================================
  // 5️⃣ RENDER UI
  // ============================================================
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen relative">
      
      {/* Alert Realtime */}
      {newBookingAlert && (
        <div className="fixed top-20 right-5 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce cursor-pointer" 
             onClick={() => setNewBookingAlert(null)}>
            <FaBell className="text-xl animate-pulse"/>
            <div>
                <h4 className="font-bold">Booking Mới!</h4>
                <p className="text-sm">Danh sách đã được cập nhật.</p>
            </div>
            <button className="ml-4 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Quản lý Đặt phòng
            </h1>
            <p className="text-gray-500 mt-1 text-sm flex items-center gap-2">
                <FaBuilding className="text-blue-500"/> 
                Chi nhánh: <span className="font-bold text-blue-700">{myBranch ? myBranch.branchName : "Đang tải..."}</span>
            </p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded border border-gray-200 shadow-sm">
          Tổng đơn: <span className="font-bold text-blue-600">{totalElements}</span>
        </div>
      </div>

      {/* Filters Section */}
      {/* Filters Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-700">Bộ lọc tìm kiếm</h3>
          <button onClick={handleResetFilters} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition">
            <FaRedo className="text-xs" /> Đặt lại
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-2">
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tìm kiếm</label>
             <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Tên khách / SĐT / Mã..." className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
          
          {/* 🆕 Bổ sung Lọc theo Loại đặt phòng */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại đặt</label>
            <select name="bookingType" value={filters.bookingType} onChange={handleFilterChange} className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Tất cả</option>
              {BOOKING_TYPES.map(type => (
                <option key={type.code} value={type.code}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại phòng</label>
            <select name="roomTypeId" value={filters.roomTypeId} onChange={handleFilterChange} className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map((t) => (<option key={t.id} value={t.id}>{t.typeName}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
            <select
              name="bookingStatus"
              value={filters.bookingStatus}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="RESERVED">RESERVED</option>
              <option value="PAID">PAID</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CHECKED_OUT">CHECKED_OUT</option>
              <option value="CANCELLED">CANCELLED</option>

            </select>
        </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
            <input type="date" name="checkInDate" value={filters.checkInDate} onChange={handleFilterChange} className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>

          <div className="flex items-end">
            <button onClick={handleSearchClick} disabled={isLoading} className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-bold shadow-md disabled:opacity-70">
                {isLoading ? "..." : <><FaSearch /> Lọc</>}
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        {isLoading && bookings.length === 0 ? (
          <div className="p-10 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Mã Booking</th>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Chi tiết phòng</th>
                    {/* 🆕 Cột mới: Loại đặt phòng */}
                    <th className="px-6 py-4">Loại đặt</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4 text-center">Thanh toán</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {booking.bookingReference}
                        <div className="text-xs text-gray-400 mt-1">{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{booking.customerName}</div>
                        <div className="text-gray-500 text-xs">{booking.customerPhone}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-blue-700">{booking.roomTypeName}</div>
                        {booking.roomNumber ? (
                             <div className="mt-1 inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200">
                                <FaCheckCircle size={10}/> Phòng {booking.roomNumber}
                             </div>
                        ) : (
                             <div className="mt-1 text-xs text-orange-500 italic flex items-center gap-1">
                                ⚠️ Chưa xếp phòng
                             </div>
                        )}
                      </td>

                      {/* 🆕 Render Loại đặt phòng */}
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded shadow-sm
                          ${booking.bookingTypeCode === 'DAY' ? 'bg-purple-100 text-purple-700' : 
                            booking.bookingTypeCode === 'HOUR' ? 'bg-amber-100 text-amber-700' : 
                            'bg-indigo-100 text-indigo-700'}`}>
                          {booking.bookingTypeCode === 'DAY' ? 'Theo Ngày' : 
                          booking.bookingTypeCode === 'HOUR' ? 'Theo Giờ' : 'Qua Đêm'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div><span className="font-semibold w-8 inline-block">In:</span> {booking.checkInDate}</div>
                        <div><span className="font-semibold w-8 inline-block">Out:</span> {booking.checkOutDate}</div>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(booking.totalPrice)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                            ${booking.isPaid ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {booking.isPaid ? "Đã TT" : "Chưa TT"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border
                            ${booking.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              booking.status === 'RESERVED' ? 'bg-yellow-200 text-yellow-800 border-yellow-300' :
                              booking.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border-red-200' :
                              booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700 border-green-200' :
                              booking.status === 'CHECKED_OUT' ? 'bg-orange-200 text-orange-800 border-orange-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                            {/* Nút Xem chi tiết */}
                            <button onClick={() => handleViewDetail(booking.bookingId)} className="text-gray-500 hover:text-blue-600" title="Xem chi tiết">
                                <FaEye size={18}/>
                            </button>
                            
                            {/* 🆕 LOGIC NÚT SET PHÒNG / HỦY SET PHÒNG */}
                            {booking.status !== '' && booking.status !== '' && (
                                <>
                                    {booking.roomNumber ? (
                                        // Nếu ĐÃ có phòng -> Hiện nút HỦY (Màu đỏ)
                                        <button 
                                            onClick={() => handleRemoveRoom(booking.bookingId, booking.roomNumber)} 
                                            className="text-red-500 hover:text-red-700 transition transform hover:scale-110" 
                                            title="Hủy xếp phòng"
                                        >
                                            <FaMinusCircle size={18}/>
                                        </button>
                                    ) : (
                                        // Nếu CHƯA có phòng -> Hiện nút XẾP (Màu xanh)
                                        <button 
                                            onClick={() => handleOpenAssignModal(booking.bookingId)} 
                                            className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110" 
                                            title="Xếp phòng ngay"
                                        >
                                            <FaDoorOpen size={18}/>
                                        </button>
                                    )}
                                </>
                            )}

                            {/* Nút Edit */}
                            {booking.status !== 'CANCELLED' && booking.status !== '' && (
                                <button onClick={() => handleOpenEditModal(booking)} className="text-gray-500 hover:text-orange-500" title="Cập nhật">
                                    <FaEdit size={18}/>
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && bookings.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-gray-500" colSpan={8}>
                          <div className="flex flex-col items-center">
                             <FaSearch className="text-4xl text-gray-200 mb-2"/>
                             <span>Không tìm thấy đơn đặt phòng nào (Ngày: {filters.checkInDate}).</span>
                          </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium transition">Trước</button>
                    <span className="text-sm text-gray-600">Trang <span className="font-bold text-blue-600">{page + 1}</span> / {totalPages}</span>
                    <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm font-medium transition">Sau</button>
                </div>
            )}
          </>
        )}
      </div>

      {/* ================= MODAL CHỌN PHÒNG ================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FaDoorOpen /> Chọn phòng cho Booking #{selectedBookingId}
                    </h3>
                    <button onClick={() => setShowAssignModal(false)} className="hover:bg-blue-700 p-1 rounded transition">
                        <FaTimes size={20}/>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    {isAssignLoading ? (
                        <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            Đang tìm phòng trống...
                        </div>
                    ) : availableRooms.length === 0 ? (
                        <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg border border-red-100 p-6">
                            <FaDoorOpen className="mx-auto text-4xl mb-2 opacity-50"/>
                            <p className="font-bold text-lg">Hết phòng trống!</p>
                            <p className="text-sm">Không còn phòng nào khả dụng cho loại phòng và thời gian này.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            <p className="text-sm text-gray-500 mb-2">Vui lòng chọn một phòng bên dưới để gán cho khách:</p>
                            {availableRooms.map((room) => (
                                <div 
                                    key={room.roomId} 
                                    className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md hover:border-blue-400 cursor-pointer transition group"
                                    onClick={() => handleConfirmAssign(room.roomId)}
                                >
                                    <div>
                                        <div className="font-bold text-lg text-blue-800 flex items-center gap-2">
                                            Phòng {room.roomNumber}
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase font-bold tracking-wider">
                                                {room.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1 font-medium">{room.roomType?.typeName}</div>
                                        {room.description && <div className="text-xs text-gray-400 italic mt-0.5">{room.description}</div>}
                                    </div>
                                    <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-blue-700 transform translate-x-2 group-hover:translate-x-0">
                                        Chọn
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t flex justify-end shrink-0">
                    <button 
                        onClick={() => setShowAssignModal(false)} 
                        className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-semibold border border-gray-300"
                    >
                        Đóng lại
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ================= MODAL CHI TIẾT BOOKING ================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaEye /> Chi tiết Booking
                {!isDetailLoading && selectedBookingDetail && (
                  <span className="bg-gray-600 text-gray-200 px-2 py-0.5 rounded text-sm">
                    #{selectedBookingDetail.bookingReference}
                  </span>
                )}
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="hover:bg-gray-700 p-1.5 rounded transition">
                <FaTimes size={18}/>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 custom-scrollbar">
              {isDetailLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      Đang tải dữ liệu...
                  </div>
              ) : selectedBookingDetail ? (
                  <div className="space-y-6">
                      
                      {/* 1. Thông tin chung & Trạng thái */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <h4 className="text-gray-500 text-xs font-bold uppercase mb-3 border-b pb-1">Khách hàng</h4>
                              <div className="flex items-start gap-3">
                                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                      <FaSearch className="text-lg" /> {/* Icon đại diện user */}
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-800 text-lg">{selectedBookingDetail.customerName}</p>
                                      <p className="text-gray-500 font-mono">{selectedBookingDetail.customerPhone}</p>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                              <h4 className="text-gray-500 text-xs font-bold uppercase mb-3 border-b pb-1">Trạng thái</h4>
                              <div className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-sm">Booking:</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                          selectedBookingDetail.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : 
                                          selectedBookingDetail.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                          selectedBookingDetail.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                                      }`}>
                                          {selectedBookingDetail.status}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-sm">Thanh toán:</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                          selectedBookingDetail.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                      }`}>
                                          {selectedBookingDetail.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 2. Thông tin phòng & Thời gian */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="text-gray-500 text-xs font-bold uppercase mb-3 border-b pb-1">Thông tin lưu trú</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                  <p className="text-gray-500 text-xs">Chi nhánh</p>
                                  <p className="font-semibold">{selectedBookingDetail.branchName}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Loại phòng</p>
                                  <p className="font-semibold text-blue-600">{selectedBookingDetail.roomTypeName}</p>
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Phòng số</p>
                                  {selectedBookingDetail.roomNumber ? (
                                      <span className="font-bold text-green-600">P.{selectedBookingDetail.roomNumber}</span>
                                  ) : (
                                      <span className="italic text-orange-500">Chưa xếp</span>
                                  )}
                              </div>
                              <div>
                                  <p className="text-gray-500 text-xs">Hình thức</p>
                                  <p className="font-semibold">{selectedBookingDetail.bookingTypeName}</p>
                              </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                  <span className="block text-xs text-gray-500">Nhận phòng (Check-in)</span>
                                  <span className="font-mono font-bold text-gray-700">
                                      {new Date(selectedBookingDetail.checkInDate).toLocaleString('vi-VN')}
                                  </span>
                              </div>
                              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                  <span className="block text-xs text-gray-500">Trả phòng (Check-out)</span>
                                  <span className="font-mono font-bold text-gray-700">
                                      {new Date(selectedBookingDetail.checkOutDate).toLocaleString('vi-VN')}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* 3. Lịch sử thanh toán */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                              <h4 className="text-gray-700 text-xs font-bold uppercase">Lịch sử thanh toán</h4>
                              <span className="text-blue-600 font-bold text-sm">
                                  Tổng tiền: {formatCurrency(selectedBookingDetail.totalPrice)}
                              </span>
                          </div>
                          
                          {selectedBookingDetail.payments && selectedBookingDetail.payments.length > 0 ? (
                              <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-gray-500 bg-gray-50 border-b">
                                      <tr>
                                          <th className="px-4 py-2">Ngày</th>
                                          <th className="px-4 py-2">Phương thức</th>
                                          <th className="px-4 py-2">Số tiền</th>
                                          <th className="px-4 py-2">Trạng thái</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                      {selectedBookingDetail.payments.map((pay) => (
                                          <tr key={pay.paymentId}>
                                              <td className="px-4 py-2 text-xs text-gray-500">
                                                  {new Date(pay.paymentDate).toLocaleString('vi-VN')}
                                                  <div className="text-[10px] text-gray-400 truncate max-w-[150px]" title={pay.notes}>
                                                      {pay.notes}
                                                  </div>
                                              </td>
                                              <td className="px-4 py-2 font-medium">{pay.paymentMethod}</td>
                                              <td className="px-4 py-2 font-bold text-gray-800">
                                                  {formatCurrency(pay.amount)}
                                              </td>
                                              <td className="px-4 py-2">
                                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                                      pay.paymentStatus === 'SUCCESS' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                                  }`}>
                                                      {pay.paymentStatus}
                                                  </span>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          ) : (
                              <div className="p-4 text-center text-gray-500 text-sm italic">
                                  Chưa có giao dịch thanh toán nào.
                              </div>
                          )}
                      </div>

                  </div>
              ) : (
                  <div className="text-center text-red-500">Không tìm thấy dữ liệu</div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-gray-100 border-t flex justify-end">
              <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold transition"
              >
                  Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL CẬP NHẬT TRẠNG THÁI ================= */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaEdit /> Cập nhật Trạng thái
              </h3>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-blue-600 p-1 rounded transition">
                <FaTimes size={18}/>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              
              {/* Thông tin tóm tắt */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                  <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Mã Booking:</span>
                      <span className="font-bold">#{editingBooking.bookingReference}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Khách hàng:</span>
                      <span className="font-bold">{editingBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-500">Thanh toán:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                          editingBooking.isPaid 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                          {editingBooking.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                  </div>
              </div>

              {/* Chọn trạng thái mới */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chọn trạng thái mới:</label>
                  <div className="space-y-2">
                      {STATUS_OPTIONS.map((option) => (
                          <label 
                              key={option.code} 
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition hover:shadow-md ${
                                  selectedStatus === option.code 
                                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                          >
                              <div className="flex items-center gap-3">
                                  <input 
                                      type="radio" 
                                      name="statusObj" 
                                      value={option.code}
                                      checked={selectedStatus === option.code}
                                      onChange={(e) => setSelectedStatus(e.target.value)}
                                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className={`font-medium text-sm ${selectedStatus === option.code ? 'text-gray-900' : 'text-gray-600'}`}>
                                      {option.label}
                                  </span>
                              </div>
                              {/* Hiển thị badge nhỏ minh họa màu sắc */}
                              <span className={`w-3 h-3 rounded-full ${option.color.split(' ')[1].replace('bg-', 'bg-')}`}></span>
                          </label>
                      ))}
                  </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                  onClick={() => setShowEditModal(false)} 
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium transition disabled:opacity-50"
              >
                  Hủy bỏ
              </button>
              <button 
                  onClick={handleConfirmUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                  {isUpdatingStatus ? (
                      <>Wait...</> 
                  ) : (
                      <> <FaCheckCircle/> Lưu thay đổi</>
                  )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBookings;
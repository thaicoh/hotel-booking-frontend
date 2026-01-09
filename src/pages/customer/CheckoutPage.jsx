import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaArrowLeft, FaUserFriends, FaCommentDots } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkRoomAvailability } from '../../api/checkout';
import { createBooking } from '../../api/bookings';
import { verifyVnPayPayment } from '../../api/payment'; // 👈 Import API mới tạo
import { API_BASE_URL } from "../../config/api";



const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  
  const { search } = useLocation();
  const navigate = useNavigate();

  // Dùng để chặn gọi API 2 lần (do React StrictMode)
  const isVerifyCalled = useRef(false);

  function parseVnpParams(searchStr) {
    const raw = (searchStr || "").replace(/^\?/, "");
    const fixed = raw.replace(/\?/g, "&"); // VNPay trả về bị dính nhiều ?
    return new URLSearchParams(fixed);
  }


  // 🔥 UPDATE: useEffect xử lý kết quả trả về từ VNPay
  useEffect(() => {
    const params = parseVnpParams(search);
    const vnpCode = params.get("vnp_ResponseCode");

    // Nếu không có mã phản hồi thì không làm gì (đang ở bước checkout bình thường)
    if (!vnpCode) return;

    // Nếu đã gọi verify rồi thì thôi (tránh double request)
    if (isVerifyCalled.current) return;
    isVerifyCalled.current = true;

    const handleVnPayReturn = async () => {
      // 1. Chuyển URLSearchParams thành Object đơn giản để gửi về Backend
      const vnpParamsObj = {};
      for (const [key, value] of params.entries()) {
        vnpParamsObj[key] = value;
      }

      // Nếu VNPay trả về lỗi (Code != 00)
      if (vnpCode !== "00") {
        alert(`❌ Thanh toán thất bại hoặc bị hủy (Code: ${vnpCode})`);
        navigate("/"); 
        return;
      }

      // 2. Gọi Backend để verify chữ ký và update DB
      try {
        setLoading(true); // Hiện loading để user không bấm lung tung
        const res = await verifyVnPayPayment(vnpParamsObj);

        if (res.data && res.data.code === 1000) {
          const amount = Number(params.get("vnp_Amount") || 0) / 100;
          alert(`✅ Thanh toán thành công ${amount.toLocaleString("vi-VN")}đ! Đơn hàng đã được xác nhận.`);
          navigate("/my-bookings"); // Hoặc trang lịch sử booking
        } else {
          alert(`⚠️ Thanh toán thành công tại ngân hàng nhưng lỗi ghi nhận tại hệ thống: ${res.data.message}`);
          // Vẫn navigate về profile để họ check lại
          navigate("/my-bookings");
        }
      } catch (err) {
        console.error("VnPay verify error:", err);
        alert("Có lỗi kết nối khi xác thực thanh toán. Vui lòng liên hệ bộ phận CSKH.");
      } finally {
        setLoading(false);
      }
    };

    handleVnPayReturn();

  }, [search, navigate]);



  const requestPayload = useMemo(() => {

    const params = parseVnpParams(search);

    const roomTypeId = params.get("roomTypeId");
    const bookingTypeCode = params.get("bookingTypeCode");
    const dateIn = params.get("checkInDate");
    const dateOut = params.get("checkOutDate");
    const timeIn = params.get("checkInTime");
    const hours = params.get("hours");

    if (!roomTypeId || !dateIn) return null;

    let isoCheckIn = "";
    let isoCheckOut = null;

    if (bookingTypeCode === "HOUR") {
        const timePart = timeIn && timeIn.includes(":") ? timeIn : "12:00";
        isoCheckIn = `${dateIn}T${timePart}:00`;
        isoCheckOut = null; 
    } 
    else if (bookingTypeCode === "NIGHT") {
        isoCheckIn = `${dateIn}T21:00:00`;
        isoCheckOut = dateOut ? `${dateOut}T12:00:00` : null;
    } 
    else {
        isoCheckIn = `${dateIn}T14:00:00`;
        isoCheckOut = dateOut ? `${dateOut}T12:00:00` : null;
    }

    return {
      roomTypeId: roomTypeId,
      bookingTypeCode: bookingTypeCode,
      checkIn: isoCheckIn,
      checkOut: isoCheckOut,
      hours: hours ? Number(hours) : 0,
    };
  }, [search]);

  useEffect(() => {
    const fetchCheckoutInfo = async () => {

      // ✅ nếu đang return từ VNPay (có vnp_ResponseCode) thì bỏ qua fetch phòng
      const vnpCode = parseVnpParams(search).get("vnp_ResponseCode");
      if (vnpCode) return;


      if (!requestPayload) {
        setLoading(false);
        setError("Thiếu thông tin ngày giờ hoặc loại phòng.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await checkRoomAvailability(requestPayload);

        if (res.data && res.data.code === 1000) {
          const result = res.data.result;
          if (result.availableRooms <= 0) {
             alert("Rất tiếc, loại phòng này đã hết chỗ.");
             navigate(-1); 
             return;
          }
          setCheckoutData(result);
        } else {
          setError(res.data.message || "Không thể lấy thông tin phòng.");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Đã có lỗi xảy ra khi tải dữ liệu.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutInfo();
  }, [requestPayload, navigate, search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = async () => {
    if (!checkoutData || !requestPayload) return;

    setIsProcessing(true);
    const finalPaymentMethod = paymentMethod === "VNPAY" ? "ONLINE" : "PAY_AT_HOTEL";

    const bookingPayload = {
      roomTypeId: Number(requestPayload.roomTypeId),
      bookingTypeCode: requestPayload.bookingTypeCode,
      checkInDate: requestPayload.checkIn,
      checkOutDate: requestPayload.checkOut,
      hours: requestPayload.hours,
      numberOfGuests: numberOfGuests || 1,
      specialRequests: specialRequests || null,
      bookingSource: "WEB",
      paymentMethod: finalPaymentMethod
    };

    try {
        const res = await createBooking(bookingPayload);
        if (res.data && res.data.code === 1000) {
              const booking = res.data.result;

              // ✅ nếu ONLINE -> BE sẽ trả paymentUrl
              if (finalPaymentMethod === "ONLINE" && booking?.paymentUrl) {
                window.location.href = booking.paymentUrl;   // đi sang VNPay
                return;
              }

              // ✅ PAY_AT_HOTEL -> xong luôn
              alert("🎉 Đặt phòng thành công!");
              navigate("/");
        } else {
            alert(`Lỗi: ${res.data.message || "Đặt phòng thất bại."}`);
            navigate(-1);
        }
    } catch (err) {
        const errorRes = err.response?.data;
        if (errorRes) {
            alert(`Đặt phòng thất bại: ${errorRes.message}`);
        } else {
            alert("Đã có lỗi kết nối xảy ra.");
        }
        navigate(-1);
    } finally {
        setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-orange-600 font-semibold animate-pulse">Đang xử lý...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="text-red-600 font-semibold px-4 text-center">{error}</div>
      <button onClick={() => navigate(-1)} className="text-gray-600 underline hover:text-orange-600">Quay lại</button>
    </div>
  );

  if (!checkoutData) return null;

  const { branch, roomType, user, price, checkIn, checkOut, bookingTypeCode } = checkoutData;
  const displayImage = branch?.photoUrl ? `${API_BASE_URL}/${branch.photoUrl}` : "https://via.placeholder.com/300";
  const maxGuests = roomType?.capacity || 2;
  const guestOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);

  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString('vi-VN', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-3">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 mb-3">
          <FaArrowLeft
            className="text-2xl text-gray-600 cursor-pointer hover:text-orange-600 transition"
            onClick={() => navigate(-1)}
          />
          <h2 className="text-2xl font-bold text-gray-800">Xác nhận & Thanh toán</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
          
          {/* --- LEFT SECTION (Thông tin phòng & Khách) --- */}
          <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6 flex flex-col h-fit">
            <div className="space-y-4">
              <p className="font-semibold text-lg text-gray-700 border-b pb-2">Thông tin đặt phòng</p>
              <div className="flex gap-4">
                <img
                  src={displayImage}
                  alt={branch?.branchName}
                  className="w-36 h-36 object-cover rounded-lg shadow-md flex-shrink-0"
                  onError={(e) => {e.target.src = "https://via.placeholder.com/150"}} 
                />
                <div className="space-y-2 flex-1">
                  <h3 className="font-bold text-gray-900 text-xl">{branch?.branchName}</h3>
                  <p className="text-orange-600 font-semibold text-lg">{roomType?.typeName}</p>
                  <p className="text-sm text-gray-600">📍 {branch?.address}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <p className="text-gray-500">Loại hình</p>
                    <p className="font-medium text-gray-800">
                        {bookingTypeCode === 'HOUR' ? 'Theo giờ' : bookingTypeCode === 'NIGHT' ? 'Qua đêm' : 'Theo ngày'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Thời gian</p>
                    <p className="font-medium text-gray-800">
                        {checkoutData.hours ? `${checkoutData.hours} tiếng` : 'Theo lịch trình'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nhận phòng</p>
                    <p className="font-medium text-gray-800">{formatDateTime(checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trả phòng</p>
                    <p className="font-medium text-gray-800">{formatDateTime(checkOut)}</p>
                  </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <p className="font-semibold text-lg text-gray-700">Thông tin khách hàng</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="font-medium">{user?.fullName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">SĐT:</span>
                    <span className="font-medium">{user?.phone}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT SECTION (Cột bên phải) --- */}
          <div className="flex flex-col gap-6 sticky top-6 h-fit">

            {/* BLOCK 1: THÔNG TIN BỔ SUNG (Card Riêng) */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
                 <p className="font-semibold text-lg text-gray-700 border-b pb-2">Thông tin bổ sung</p>
                 
                 {/* Số lượng khách */}
                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaUserFriends className="text-gray-500"/> Số lượng khách
                    </label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        value={numberOfGuests}
                        onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    >
                        {guestOptions.map(num => (
                            <option key={num} value={num}>{num} người</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">Tối đa {maxGuests} người.</p>
                 </div>

                 {/* Yêu cầu đặc biệt */}
                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaCommentDots className="text-gray-500"/> Yêu cầu đặc biệt
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        placeholder="Ví dụ: Phòng tầng cao, thêm gối..."
                        rows="2"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                    ></textarea>
                 </div>
            </div>

            {/* BLOCK 2: THANH TOÁN (Card Riêng) */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
                <div className="space-y-2 border-b pb-4">
                  <p className="font-semibold text-lg text-gray-700">Chi tiết thanh toán</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng tiền phòng</span>
                    <span className="text-gray-900 font-bold text-xl text-orange-600">
                        {price ? price.toLocaleString() : 0} {checkoutData.currency || 'VND'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-lg text-gray-700">Phương thức thanh toán</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-orange-50 transition border-gray-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === "VNPAY"}
                        onChange={handlePaymentChange}
                        className="accent-orange-600 w-5 h-5"
                      />
                      <div className="flex flex-col">
                          <span className="font-medium text-gray-800">Thanh toán VNPAY</span>
                          <span className="text-xs text-gray-500">Thẻ ATM / QR Code / Ví điện tử</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-orange-50 transition border-gray-200 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PayAtHotel"
                        checked={paymentMethod === "PayAtHotel"}
                        onChange={handlePaymentChange}
                        className="accent-orange-600 w-5 h-5"
                      />
                      <span className="font-medium text-gray-800">Thanh toán tại khách sạn</span>
                    </label>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className={`px-6 py-3 rounded-lg font-semibold text-lg w-full transition shadow-md
                      ${isProcessing 
                          ? 'bg-gray-400 cursor-not-allowed text-white' 
                          : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg'
                      }`}
                  >
                    {isProcessing 
                      ? "Đang xử lý..." 
                      : (paymentMethod === "PayAtHotel" ? "Xác nhận đặt phòng" : "Thanh toán ngay")
                    }
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                      Bằng việc bấm vào nút trên, bạn đồng ý với điều khoản và chính sách của chúng tôi.
                  </p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
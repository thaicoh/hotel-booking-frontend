import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("ZaloPay");

  const { search } = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ query string
  const params = new URLSearchParams(search);

  const bookingDetails = {
    hotelId: params.get("hotelId") || "",
    hotelName: params.get("hotelName") || "Tên khách sạn",
    roomTypeId: params.get("roomTypeId") || "",
    roomType: params.get("roomType") || "Loại phòng",
    bookingType: params.get("bookingTypeCode") || "Theo giờ",
    checkInDate: params.get("checkInDate") || "",
    checkOutDate: params.get("checkOutDate") || "",
    checkInTime: params.get("checkInTime") || "",
    hours: params.get("hours") || "",
    price: Number(params.get("price")) || 0,
    customerName: params.get("customerName") || "Khách hàng",
    phone: params.get("phone") || "",
    imageUrl: params.get("imageUrl") || "https://via.placeholder.com/150",
  };

  const totalAmount = bookingDetails.price;

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Processing payment...", {
      ...bookingDetails,
      paymentMethod,
    });
    // TODO: gọi API confirm booking
  };

  // Log toàn bộ dữ liệu nhận được từ URL
  useEffect(() => {
    console.log("👉 Dữ liệu truyền từ URL:", bookingDetails);
  }, [search]);

  // Khi component mount → cuộn lên đầu trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="h-screen items-center justify-center">
      {/* Header */}
      <div className="flex items-center gap-3 p-6">
        <FaArrowLeft
          className="text-2xl text-gray-600 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="text-2xl font-bold text-gray-800">Xác nhận & Thanh toán</h2>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        {/* Left Section */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg space-y-6 flex flex-col justify-between self-stretch">
          {/* Booking Choice */}
          <div className="space-y-4">
            <p className="font-semibold text-lg text-gray-700">Lựa chọn của bạn</p>
            <div className="flex gap-4">
              <img
                src={bookingDetails.imageUrl}
                alt="Hotel"
                className="w-36 h-36 object-cover rounded-lg shadow-md"
              />
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-lg">{bookingDetails.hotelName}</p>
                <p className="text-gray-600">{bookingDetails.roomType}</p>
                <p className="text-gray-600">
                  Loại đặt phòng: <span className="font-medium">{bookingDetails.bookingType}</span>
                </p>
                <p className="text-gray-600">
                  Nhận phòng: <span className="font-medium">{bookingDetails.checkInDate}</span>
                </p>
                <p className="text-gray-600">
                  Trả phòng: <span className="font-medium">{bookingDetails.checkOutDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <p className="font-semibold text-lg text-gray-700">Người đặt phòng</p>
            <p className="text-gray-600">
              Họ tên: <span className="font-medium">{bookingDetails.customerName}</span>
            </p>
            <p className="text-gray-600">
              Số điện thoại: <span className="font-medium">{bookingDetails.phone}</span>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <aside className="bg-white p-6 border border-gray-200 rounded-xl shadow-lg space-y-6 flex flex-col justify-between self-stretch">
          {/* Payment Details */}
          <div className="space-y-2 border-b pb-4">
            <p className="font-semibold text-lg text-gray-700">Chi tiết thanh toán</p>
            <p className="text-gray-900 text-xl font-bold">
              Tổng tiền: <span className="text-orange-600">{totalAmount.toLocaleString()} VND</span>
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <p className="font-semibold text-lg text-gray-700">Phương thức thanh toán</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ZaloPay"
                  checked={paymentMethod === "ZaloPay"}
                  onChange={handlePaymentChange}
                  className="accent-orange-600"
                />
                <span className="text-gray-700">ZaloPay</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MoMo"
                  checked={paymentMethod === "MoMo"}
                  onChange={handlePaymentChange}
                  className="accent-orange-600"
                />
                <span className="text-gray-700">MoMo</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold text-lg w-full hover:bg-orange-700 transition"
            >
              Thanh toán
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
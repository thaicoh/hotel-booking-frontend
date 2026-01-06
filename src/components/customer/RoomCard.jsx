import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { API_BASE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";

export default function RoomCard({ 
  
    room,
    hotelId,
    bookingTypeCode,
    checkInDate,
    checkOutDate,
    checkInTime,
    hours,
    onViewDetail

    }) 
  {

  const navigate = useNavigate();

  const handleBooking = () => {
    // Nếu checkInDate/checkOutDate có dạng yyyy-MM-ddTHH:mm:ss thì chỉ lấy phần yyyy-MM-dd
    const onlyDateIn = checkInDate ? checkInDate.split("T")[0] : "";
    const onlyDateOut = checkOutDate ? checkOutDate.split("T")[0] : "";

    const queryParams = new URLSearchParams({
      hotelId,
      roomTypeId: room.roomTypeId,
      bookingTypeCode,
      checkInDate: onlyDateIn,
      checkOutDate: onlyDateOut,
      checkInTime,
      hours,
    });

    navigate(`/checkout?${queryParams.toString()}`);
  };


  // Lấy ảnh chính: nếu có photoUrls thì lấy ảnh đầu tiên, nếu không thì dùng imageUrl
  const mainImage =
    room.images && room.images.length > 0
      ? `${API_BASE_URL}/${room.images[0]}`
      : room.imageUrl
      ? `${API_BASE_URL}/${room.imageUrl}`
      : "https://via.placeholder.com/400x300?text=No+Image";

  // Format giá tiền với dấu chấm ngăn cách
  const formatPrice = (price) => {
    if (!price) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg p-4">
      {/* Image */}
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4">
        <img
          src={mainImage}
          alt={room.name || room.roomTypeName}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Room Info */}
      <div className="flex flex-col justify-between text-left p-4">
        <p className="text-lg font-semibold mb-2">
          {room.name || room.roomTypeName}
        </p>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-600 mb-2">{room.description}</p>
        )}

        {/* Capacity & Available Rooms */}
        <div className="text-sm text-gray-500 mb-4">
          {room.capacity && <span>Sức chứa: {room.capacity} người</span>}
          {room.availableRooms !== undefined && (
            <>
              {" "}
              ・ <span>Còn {room.availableRooms} phòng trống</span>
            </>
          )}
        </div>

        <hr className="my-4 text-gray-200" />

        {/* Pricing & Booking Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-gray-800">
              {formatPrice(room.price)} {room.currency || ""}
            </span>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg cursor-pointer"
            onClick={handleBooking}

          >
            Đặt phòng
          </button>
        </div>

        {/* Cancellation Policy */}
        <div className="flex justify-between gap-4 cursor-pointer text-gray-600 mt-2">
          {/* Chính sách hủy phòng */}
          <div className="flex gap-2">
            <span className="text-sm">Chính sách hủy phòng</span>
          </div>

          {/* Nút chi tiết phòng */}
          <div
            className="flex items-center justify-between gap-4 cursor-pointer text-gray-600 "
            onClick={() => onViewDetail(room)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-600">Chi tiết loại phòng</span>
              <ChevronRightIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
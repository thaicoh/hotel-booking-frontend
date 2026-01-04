import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config/api";

export default function RoomDetailModal({ room, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageFullOpen, setIsImageFullOpen] = useState(false);
  const images = room.images || [];
  const modalRef = useRef();

  // Reset ảnh về đầu mỗi khi mở modal cho phòng mới
  useEffect(() => {
    setCurrentIndex(0);
  }, [room]);

  // Đóng modal khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    console.log(typeof room.price, room.price);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const formatPrice = (price) => {
    if (!price) return "0";
    // Loại bỏ mọi ký tự không phải số
    const numeric = String(price).replace(/\D/g, "");
    return Number(numeric).toLocaleString("vi-VN");
    };

  return (
    <>
      {/* Modal chính */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div
          ref={modalRef}
          className="bg-white rounded-lg max-w-[90vw] flex overflow-hidden relative shadow-2xl"
        >
          {/* Slideshow - 2/3 trái */}
          <div className="w-2/3 p-6">
            {/* Ảnh lớn */}
            <div className="relative mb-4">
              <img
                src={`${API_BASE_URL}/${images[currentIndex]}`}
                alt={`Room image ${currentIndex + 1}`}
                className="w-full h-96 object-cover rounded-lg cursor-pointer"
                onClick={() => setIsImageFullOpen(true)} // 👉 mở full màn hình
              />
              <button
                onClick={prevImage}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 py-1 bg-black text-white rounded-l"
              >
                &#10094;
              </button>
              <button
                onClick={nextImage}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 px-3 py-1 bg-black text-white rounded-r"
              >
                &#10095;
              </button>
            </div>

            {/* Thumbnail list */}
            <div className="grid grid-cols-9 gap-1">
            {images.slice(0, 9).map((img, idx) => (
                <img
                key={idx}
                src={`${API_BASE_URL}/${img}`}
                alt={`Thumb ${idx}`}
                className={`h-20 w-full object-cover rounded cursor-pointer border ${
                    idx === currentIndex ? "border-orange-500" : "border-transparent"
                }`}
                onClick={() => setCurrentIndex(idx)}
                />
            ))}
            </div>
          </div>

          {/* Thông tin - 1/3 phải */}
          <div className="w-1/3 p-6 border-l border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{room.name || room.roomTypeName}</h2>
              <p className="text-sm text-gray-600 mb-2">{room.description}</p>
              <p className="text-sm text-gray-600 mb-2">Sức chứa: {room.capacity} người</p>
              <p className="text-sm text-gray-600 mb-2">Còn lại: {room.availableRooms} phòng</p>
            </div>
            <div>
                    <p className="text-xl font-bold mb-4">
                {formatPrice(room.price)} VND
                </p>
              <button
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                onClick={() => alert("Đặt phòng")}
              >
                Đặt phòng
              </button>
            </div>
          </div>

          {/* Nút đóng modal chính */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Full màn hình ảnh */}
      {isImageFullOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="relative w-full h-full flex justify-center items-center">
            <img
              src={`${API_BASE_URL}/${images[currentIndex]}`}
              alt="Full screen"
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => setIsImageFullOpen(false)}
              className="absolute top-6 right-6 text-3xl text-white hover:text-gray-300"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
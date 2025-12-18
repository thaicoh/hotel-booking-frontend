import React from 'react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-lg rounded-md">
        <h1 className="text-4xl font-bold text-red-600">404</h1>
        <h2 className="text-2xl mt-4 text-gray-700">Trang không tìm thấy</h2>
        <p className="mt-2 text-gray-500">
          Xin lỗi, trang bạn đang tìm không tồn tại. Vui lòng quay lại trang chính hoặc kiểm tra lại liên kết.
        </p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}

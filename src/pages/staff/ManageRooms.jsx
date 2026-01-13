import React, { useEffect, useState, useMemo } from "react";
import {
  FaCalendarAlt,
  FaBed,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaPhone,
  FaHashtag,
} from "react-icons/fa";
import { getMyBranch } from "../../api/staff";
import { getRoomsByBranch } from "../../api/rooms";
import { getBookingsByBranch } from "../../api/bookings";

// --- CẤU HÌNH ---
const TIME_SLOTS = [
  { label: "Trước 12h", value: 11 },
  { label: "12:00", value: 12 },
  { label: "13:00", value: 13 },
  { label: "14:00", value: 14 },
  { label: "15:00", value: 15 },
  { label: "16:00", value: 16 },
  { label: "17:00", value: 17 },
  { label: "18:00", value: 18 },
  { label: "19:00", value: 19 },
  { label: "20:00", value: 20 },
  { label: "21:00", value: 21 },
  { label: "Sau 22h đến 12h trưa hôm sau", value: 22 },
];



// Helper format giờ
const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

// Màu theo status
const getBookingColorClass = (booking) => {
  const status = booking?.status;

  if (status === "CHECKED_IN") return "bg-green-600";
  if (status === "CHECKED_OUT") return "bg-orange-700";
  if (status === "RESERVED" || status === "PAID") return "bg-yellow-500";

  // fallback: nếu API có isPaid mà status không chuẩn
  if (booking?.isPaid) return "bg-yellow-500";

  return "bg-gray-500";
};

const getPaymentBadge = (booking) => {
  // Ưu tiên theo status PAID, fallback isPaid
  const paid = booking?.status === "PAID" || booking?.isPaid;
  return paid
    ? { text: "Đã TT", cls: "bg-white/20 text-white" }
    : { text: "Chưa TT", cls: "bg-black/20 text-white" };
};

const getNowLineLeftPercent = () => {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const startMinutes = 11 * 60;   // 11:00
  const endMinutes = 22 * 60;     // 22:00
  const total = endMinutes - startMinutes; // 660 phút

  // ngoài range thì ẩn
  if (minutesNow < startMinutes || minutesNow > endMinutes) return null;

  const progress = (minutesNow - startMinutes) / total; // 0..1
  return progress * 100; // %
};


export default function ManageRooms() {
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [branch, setBranch] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const branchRes = await getMyBranch();
        if (branchRes.data?.result) {
          const branchData = branchRes.data.result;
          setBranch(branchData);
          await fetchRoomAndBooking(branchData.id, currentDate);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (branch?.id) {
      fetchRoomAndBooking(branch.id, currentDate, false);
    }
  }, [currentDate]); // eslint-disable-line

  const fetchRoomAndBooking = async (branchId, date, fetchRooms = true) => {
    setIsLoading(true);
    try {
      const promises = [getBookingsByBranch(branchId, date)];
      if (fetchRooms) promises.push(getRoomsByBranch(branchId));

      const results = await Promise.all(promises);

      // Booking
      const bookingRes = results[0];
      if (bookingRes.data?.code === 1000) {
        setBookings(bookingRes.data.result);
      }

      // Room
      if (fetchRooms) {
        const roomRes = results[1];
        if (roomRes.data?.code === 1000) {
          setRooms(roomRes.data.result);
        }
      }
    } catch (error) {
      console.error("Lỗi API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIC TÍNH TOÁN GRID (absolute + left/width theo %) ---
  const calculateGridPosition = (booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    const viewDateStart = new Date(currentDate);
    viewDateStart.setHours(0, 0, 0, 0);

    const viewDateEnd = new Date(currentDate);
    viewDateEnd.setHours(23, 59, 59, 999);

    // START COL
    let startCol = 1;
    if (checkIn < viewDateStart) {
      startCol = 1;
    } else {
      const h = checkIn.getHours();
      if (h < 12) startCol = 1;
      else if (h >= 22) startCol = 12;
      else startCol = h - 12 + 2; // 12h -> col 2
    }

    // END COL
    let endCol = 13;
    if (checkOut > viewDateEnd) {
      endCol = 13;
    } else {
      const h = checkOut.getHours();
      const m = checkOut.getMinutes();

      if (h < 12) endCol = 2;
      else if (h >= 22) endCol = 13;
      else {
        endCol = h - 12 + 2;
        if (m > 0) endCol += 1;
      }
    }

    if (startCol > 12) startCol = 12;
    if (endCol > 13) endCol = 13;

    let span = endCol - startCol;
    if (span < 1) span = 1;

    const TOTAL_COLS = 12;
    const leftPercent = ((startCol - 1) / TOTAL_COLS) * 100;
    const widthPercent = (span / TOTAL_COLS) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  // Nhóm phòng
  const groupedRooms = useMemo(() => {
    const groups = {};
    rooms.forEach((room) => {
      const typeName = room.roomType?.typeName || "Khác";
      if (!groups[typeName]) groups[typeName] = [];
      groups[typeName].push(room);
    });
    return groups;
  }, [rooms]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" /> Quản lý Phòng & Lịch đặt
          </h1>
          <p className="text-sm text-gray-500">
            Chi nhánh:{" "}
            <span className="font-semibold text-blue-700">
              {branch?.branchName || "Đang tải..."}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 1);
              setCurrentDate(d.toISOString().split("T")[0]);
            }}
            className="px-3 py-1 hover:bg-white rounded shadow-sm text-sm font-bold text-gray-600 transition"
          >
            &lt;
          </button>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer"
          />
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 1);
              setCurrentDate(d.toISOString().split("T")[0]);
            }}
            className="px-3 py-1 hover:bg-white rounded shadow-sm text-sm font-bold text-gray-600 transition"
          >
            &gt;
          </button>
        </div>

        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-600 rounded-sm"></span> CHECKED_IN
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-sm"></span>{" "}
            RESERVED/PAID
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-700 rounded-sm"></span> CHECKED_OUT
          </div>
        </div>
      </div>

      {/* TIMELINE TABLE */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="grid grid-cols-[180px_1fr] border-b border-gray-200 bg-gray-100 sticky top-0 z-20">
            <div className="p-3 text-xs font-bold text-gray-500 uppercase flex items-center justify-center border-r border-gray-200 sticky left-0 bg-gray-100 z-30 shadow-sm">
              Phòng / Giờ
            </div>
            <div className="grid grid-cols-12 divide-x divide-gray-200">
              {TIME_SLOTS.map((slot, index) => (
                <div
                  key={index}
                  className="p-2 text-center text-xs font-semibold text-gray-600"
                >
                  {slot.label}
                </div>
              ))}
            </div>
          </div>

          {/* Room Rows */}
          {isLoading && (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          )}

          {!isLoading &&
            Object.keys(groupedRooms).map((typeName) => (
              <React.Fragment key={typeName}>
                <div className="bg-blue-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-blue-800 uppercase flex items-center gap-2 sticky left-0 z-10">
                  <FaBed /> {typeName}
                </div>

                {groupedRooms[typeName].map((room) => {
                  const roomBookings = bookings.filter(
                    (b) => b.roomId === room.roomId
                  );

                  const statusColors = {
                    Available: "bg-green-100 text-green-700",
                    Dirty: "bg-red-100 text-red-700",
                    Cleanup: "bg-yellow-100 text-yellow-700",
                  };
                  const statusClass =
                    statusColors[room.status] || "bg-gray-100 text-gray-600";

                  return (
                    <div
                      key={room.roomId}
                      className="grid grid-cols-[180px_1fr] border-b border-gray-100 hover:bg-gray-50 transition relative group h-16"
                    >
                      {/* Cột thông tin phòng */}
                      <div className="p-2 border-r border-gray-200 flex flex-col justify-center sticky left-0 bg-white group-hover:bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800 text-sm">
                            P.{room.roomNumber}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${statusClass}`}
                          >
                            {room.status === "Available" ? "Ready" : room.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 truncate">
                          {room.description}
                        </span>
                      </div>

                      {/* Lưới Booking */}
                      <div className="relative grid grid-cols-12 divide-x divide-gray-100 bg-white">

                        {currentDate === new Date().toISOString().split("T")[0] && (() => {
                          const left = getNowLineLeftPercent();
                          if (left === null) return null;

                          return (
                            <div
                              className="absolute top-0 bottom-0 z-30 pointer-events-none"
                              style={{ left: `${left}%` }}
                            >
                              {/* đường dọc */}
                              <div className="absolute inset-y-0 -left-[1px] w-[2px] bg-red-500 opacity-70" />
                              
                              {/* chấm trên đầu */}
                              <div className="absolute -top-1 -left-[6px] w-3 h-3 bg-red-500 rounded-full shadow" />
                              
                              {/* label giờ (tuỳ thích) */}
                              <div className="absolute -top-6 -left-6 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                {formatTime(new Date().toISOString())}
                              </div>
                            </div>
                          );
                        })()}


                        {/* Grid Background */}
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="h-full w-full"></div>
                        ))}

                        {/* Booking Bars */}
                        {roomBookings.map((booking) => {
                          const style = calculateGridPosition(booking);

                          const bgClass = getBookingColorClass(booking);
                          const payBadge = getPaymentBadge(booking);

                          // ✅ đổi field giá nếu backend bạn đặt tên khác
                          const price =
                            booking.totalPrice ??
                            booking.finalPrice ??
                            booking.amount ??
                            booking.totalAmount ??
                            booking.price;

                          return (
                            <div
                              key={booking.bookingId}
                              style={style}
                              className={`absolute top-1 bottom-1 m-0.5 rounded-lg shadow-sm text-white px-2 py-1.5 overflow-hidden cursor-pointer hover:brightness-110 z-10 transition-all ${bgClass} border border-white/20`}
                              title={`Ref: ${booking.bookingReference}
KH: ${booking.customerName}
SĐT: ${booking.customerPhone}
Thời gian: ${formatTime(booking.checkInDate)} - ${formatTime(booking.checkOutDate)}
Giá: ${formatCurrency(price)}
Thanh toán: ${
                                payBadge.text === "Đã TT" ? "Đã thanh toán" : "Chưa thanh toán"
                              }`}
                            >
                              {/* Top row: Ref + badge */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1 min-w-0">
                                  <FaHashtag className="text-[10px] opacity-90 flex-shrink-0" />
                                  <span className="text-[11px] font-extrabold tracking-wide truncate">
                                    {booking.bookingReference || booking.bookingId}
                                  </span>
                                </div>

                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${payBadge.cls}`}
                                >
                                  {payBadge.text}
                                </span>
                              </div>

                              {/* Middle: name + phone */}
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold truncate">
                                  {booking.customerName}
                                </span>
                                <span className="text-[10px] opacity-95 flex items-center gap-1 flex-shrink-0">
                                  <FaPhone className="text-[9px] opacity-80" />
                                  <span className="tabular-nums">{booking.customerPhone}</span>
                                </span>
                              </div>

                              {/* Bottom: time + price */}
                              <div className="mt-1 flex items-center justify-between gap-2">
                                <span className="text-[9px] bg-black/15 rounded px-1.5 py-0.5 flex items-center gap-1 min-w-0">
                                  <FaClock className="text-[9px] opacity-80 flex-shrink-0" />
                                  <span className="truncate tabular-nums">
                                    {formatTime(booking.checkInDate)} - {formatTime(booking.checkOutDate)}
                                  </span>
                                </span>

                                <span className="text-[10px] font-extrabold whitespace-nowrap tabular-nums">
                                  {formatCurrency(price)}
                                </span>
                              </div>

                              {/* Optional icon small for CHECKED_IN */}
                              {booking.status === "CHECKED_IN" && (
                                <FaCheckCircle className="absolute bottom-1 right-1 text-[12px] text-white/90" />
                              )}
                            </div>
                          );
                        })}

                        {/* Current Time Line */}
                        {currentDate === new Date().toISOString().split("T")[0] && (
                          <div
                            className="absolute top-0 bottom-0 border-l-2 border-red-500 z-30 pointer-events-none opacity-60"
                            style={{
                              left: `${
                                ((new Date().getHours() -
                                  11 +
                                  new Date().getMinutes() / 60) /
                                  11) *
                                100
                              }%`,
                              display:
                                new Date().getHours() < 11 ||
                                new Date().getHours() > 22
                                  ? "none"
                                  : "block",
                            }}
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full -ml-[5px] -mt-1 shadow"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

          {!isLoading && rooms.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic">
              Không có phòng nào trong chi nhánh này.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-4 bg-white p-3 rounded shadow-sm border border-gray-200">
        <p className="flex items-center gap-1">
          <FaClock /> Trục thời gian hiển thị tương đối.
        </p>
        <p className="flex items-center gap-1">
          <FaExclamationCircle /> Khung giờ <b>Sau 21h</b> sẽ bao gồm cả các booking
          qua đêm.
        </p>
      </div>
    </div>
  );
}
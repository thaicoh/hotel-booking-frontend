import { useEffect, useMemo, useState } from "react";
import RoomCard from '../../components/customer/RoomCard'; // Đảm bảo bạn đã import đúng đường dẫn của RoomCard component
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DailyBookingPicker from "../../components/customer/DailyBookingPicker"; 
import { getHotelDetailWithBooking } from "../../api/branches"
import { API_BASE_URL } from "../../config/api";
import RoomDetailModal from "../../components/customer/RoomDetailModal"



export default function HotelDetail() {

    const [searchParams, setSearchParams] = useSearchParams();

    const hotelId = searchParams.get("hotelId");
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const bookingTypeCode = searchParams.get("bookingTypeCode") || "HOUR";
    const checkInTime = searchParams.get("checkInTime");
    const hours = searchParams.get("hours");




    const buildCheckInOut = ({ bookingTypeCode, checkInDate, checkOutDate, checkInTime, hours }) => {
        if (!bookingTypeCode) return { checkIn: null, checkOut: null, hours: null };

        // Helper: nếu chuỗi đã có 'T' thì coi như đã có giờ, không nối thêm
        const appendTime = (dateStr, timeStr) => {
            if (!dateStr) return null;
            return dateStr.includes("T") ? dateStr : `${dateStr}T${timeStr}`;
        };

        if (bookingTypeCode === "HOUR") {
            const checkIn = (checkInDate && checkInTime) ? appendTime(checkInDate, `${checkInTime}:00`) : null;
            return { checkIn, checkOut: null, hours: hours ? Number(hours) : null };
        }

        if (bookingTypeCode === "NIGHT") {
            const checkIn = appendTime(checkInDate, "21:00:00");
            const checkOut = appendTime(checkOutDate, "12:00:00");
            return { checkIn, checkOut, hours: null };
        }

        if (bookingTypeCode === "DAY") {
            const checkIn = appendTime(checkInDate, "14:00:00");
            const checkOut = appendTime(checkOutDate, "12:00:00");
            return { checkIn, checkOut, hours: null };
        }

        return { checkIn: null, checkOut: null, hours: null };
    };

    const { checkIn, checkOut, hours: hoursNum } = buildCheckInOut({
        bookingTypeCode, checkInDate, checkOutDate, checkInTime, hours,
    });

    const payload = {
        bookingTypeCode,
        checkIn,
        checkOut,
        hours: hoursNum,
    };

    const [branchDetail, setBranchDetail] = useState(null); // { branchId, branchName, address, photoUrl, rooms: [...] }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // Use these parameters to render the hotel details
    console.log(hotelId, checkInDate, checkOutDate, bookingTypeCode, checkInTime, hours);

    
//   const hotel = {
//     name: "Hotel le Jardin Secret Saigon",
//     address: "228 Bến Vân Đồn, Phường 5, Quận 4, Thành phố Hồ Chí Minh, Việt Nam",
//     mainImageUrl: "https://s3.go2joy.vn/1000w/hotel/1052/6130_1672112277_63aa689520013.jpg", // Placeholder image
//     thumbnailImages: [
//       "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/2_1_118_1562826286707.jpg",
//       "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/2_1_118_1562826287319.jpg",
//       "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/2_1052_118_1562826287781.jpg",
//       "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/2_1052_118_1562826288627.jpg",
//     ], // Thumbnails
//     rooms: [
//       {
//         name: "VIP Room",
//         imageUrl: "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/34998bb2a866b045ed3f9893124e94b0.jpg",
//         description: "Room with great facilities and a beautiful view.",
//         price: "500,000 VND",
//         area: 25, // Diện tích phòng
//         bed: "2 giường đôi", // Số giường
//         duration: "3 giờ", // Thời gian sử dụng
//       },
//       {
//         name: "Deluxe Room",
//         imageUrl: "https://s3.go2joy.vn/1000w/hotel/1052_1562808031594/2_1_118_1562827695383.jpg",
//         description: "Luxurious room with premium amenities.",
//         price: "700,000 VND",
//         area: 30,
//         bed: "1 giường lớn",
//         duration: "1 đêm",
//       },
//     ],
//   };



  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.thumbnailImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + hotel.thumbnailImages.length) % hotel.thumbnailImages.length
    );
  };


    const routerLocation = useLocation();

    const [hotels, setHotels] = useState([]);


    // --- Helpers ---
    const toYMD = (d) => toYMDLocal(d);

    const fromYMD = (s) => (s ? new Date(s) : null);

    const getNextDay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
    };

    const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === "") p.delete(key);
    else p.set(key, value);
    setSearchParams(p, { replace: true });
    };

    const replaceParams = (updater) => {
    const p = new URLSearchParams(searchParams);
    updater(p);
    setSearchParams(p, { replace: true });
    };

    // --- Current values from URL ---
    const keyword = searchParams.get("location") || ""; // dùng 'location' để match backend field

    // --- Click đổi loại đặt phòng ---
    const handleChangeType = (code) => {
        replaceParams((p) => {
            p.set("bookingTypeCode", code);

            // reset các field không liên quan
            if (code !== "HOUR") {

            }

            if (code === "HOUR") {
                
            }

            if (code === "NIGHT") {
            // đêm: checkout tự +1 ngày khi chọn checkin
                if (p.get("checkInDate")) {
                    p.set("checkOutDate", getNextDay(p.get("checkInDate")));
                } else {
                    p.delete("checkOutDate");
                }
            }

            if (code === "DAY") {
            // đêm: checkout tự +1 ngày khi chọn checkin
                if (p.get("checkInDate")) {
                    p.set("checkOutDate", getNextDay(p.get("checkInDate")));
                } else {
                    p.delete("checkOutDate");
                }
            }
        });
    };

    // --- Chọn check-in (tùy loại) ---
    const handlePickCheckIn = (dateObj) => {
        const ymd = dateObj ? toYMD(dateObj) : "";
        replaceParams((p) => {
            if (!ymd) {
            p.delete("checkInDate");
            p.delete("checkOutDate");
            return;
            }

            p.set("checkInDate", ymd);

            if (bookingTypeCode === "NIGHT") {
            p.set("checkOutDate", getNextDay(ymd)); // auto +1
            }

            if (bookingTypeCode === "HOUR") {
            p.delete("checkOutDate"); // giờ: không có checkout
            }
        });
    };  


    // Room detail modal 
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

    const handleViewRoomDetail = (room) => {
        setSelectedRoom(room);
        setIsRoomModalOpen(true);
    };

    const closeRoomModal = () => {
        setIsRoomModalOpen(false);
        setSelectedRoom(null);
    };

    const HOURS_OPTIONS = ["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

    const pad2 = (n) => String(n).padStart(2, "0");

    // YYYY-MM-DD theo local (KHÔNG dùng toISOString)
    const toYMDLocal = (d) => {
        const y = d.getFullYear();
        const m = pad2(d.getMonth() + 1);
        const day = pad2(d.getDate());
        return `${y}-${m}-${day}`;
    };

    const addDaysYMD = (ymd, n) => {
        const [y, m, d] = ymd.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        dt.setDate(dt.getDate() + n);
        return toYMDLocal(dt);
    };

    const getDefaultHourTime = () => {
        const now = new Date();
        const currentHour = now.getHours();

        // nếu qua 21h => ngày +1 và giờ đầu tiên
        if (currentHour >= 21) {
            return { dayOffset: 1, time: HOURS_OPTIONS[0] };
        }

        // tìm giờ tiếp theo có trong select
        const nextHour = currentHour + 1;
        const nextCandidate = `${pad2(nextHour)}:00`;
        if (HOURS_OPTIONS.includes(nextCandidate)) {
            return { dayOffset: 0, time: nextCandidate };
        }

        // nếu giờ tiếp theo không nằm trong list => chọn giờ đầu tiên
        return { dayOffset: 0, time: HOURS_OPTIONS[0] };
    };



    useEffect(() => {
        const fetchHotel = async () => {
            if (!hotelId || !bookingTypeCode) return;

            try {
            setLoading(true);
            setError(null);

            const res = await getHotelDetailWithBooking(hotelId, payload);
            // Giả định backend trả về { code, message, result }
            const data = res.data?.result ?? res.data;

            console.log("👉 Kết quả API hotel-detail:", data); // log ra dữ liệu trả về

            setBranchDetail(data);
            } catch (err) {
            console.error("❌ Lỗi khi gọi API hotel-detail:", err);
            setError(
                err?.response?.data?.message ||
                err.message ||
                "Đã xảy ra lỗi khi tải dữ liệu khách sạn"
            );
            } finally {
            setLoading(false);
            }
        };

        fetchHotel();
    }, [hotelId, bookingTypeCode, checkIn, checkOut, hoursNum]);

    useEffect(() => {
            const p = new URLSearchParams(searchParams);
            const code = p.get("bookingTypeCode") || "HOUR";
            let shouldUpdate = false;

            const today = new Date();
            const todayYMD = toYMDLocal(today);

            // 1. Xử lý logic cho Theo Giờ (HOUR)
            if (code === "HOUR") {
                // Nếu chưa có ngày -> set ngày mai (hoặc hôm nay tùy logic giờ)
                if (!p.get("checkInDate")) {
                    const { dayOffset } = getDefaultHourTime();
                    const ymd = dayOffset ? addDaysYMD(todayYMD, 1) : todayYMD;
                    p.set("checkInDate", ymd);
                    shouldUpdate = true;
                }
                
                // QUAN TRỌNG: Kiểm tra riêng checkInTime và hours
                // Nếu thiếu checkInTime -> set default
                if (!p.get("checkInTime")) {
                    const { time } = getDefaultHourTime();
                    p.set("checkInTime", time);
                    shouldUpdate = true;
                }

                // Nếu thiếu hours -> set default là 1
                if (!p.get("hours")) {
                    p.set("hours", "1");
                    shouldUpdate = true;
                }

                // HOUR thì không cần checkOutDate -> xóa đi cho sạch URL
                if (p.get("checkOutDate")) {
                    p.delete("checkOutDate");
                    shouldUpdate = true;
                }
            }

            // 2. Xử lý logic cho Qua Đêm (NIGHT)
            if (code === "NIGHT") {
                if (!p.get("checkInDate")) {
                    p.set("checkInDate", todayYMD);
                    shouldUpdate = true;
                }
                // NIGHT luôn tự động tính checkout = checkin + 1 ngày
                const currentCheckIn = p.get("checkInDate");
                const expectedCheckOut = getNextDay(currentCheckIn);
                
                if (p.get("checkOutDate") !== expectedCheckOut) {
                    p.set("checkOutDate", expectedCheckOut);
                    shouldUpdate = true;
                }

                // Xóa các param thừa của Hour
                if (p.get("checkInTime") || p.get("hours")) {
                    p.delete("checkInTime");
                    p.delete("hours");
                    shouldUpdate = true;
                }
            }

            // 3. Xử lý logic cho Theo Ngày (DAY)
            if (code === "DAY") {
                if (!p.get("checkInDate")) {
                    p.set("checkInDate", todayYMD);
                    shouldUpdate = true;
                }
                if (!p.get("checkOutDate")) {
                    p.set("checkOutDate", addDaysYMD(todayYMD, 1));
                    shouldUpdate = true;
                }
                // Xóa các param thừa của Hour
                if (p.get("checkInTime") || p.get("hours")) {
                    p.delete("checkInTime");
                    p.delete("hours");
                    shouldUpdate = true;
                }
            }

            // Chỉ cập nhật URL nếu có thay đổi để tránh render loop
            if (shouldUpdate) {
                setSearchParams(p, { replace: true });
            }
        }, [searchParams, setSearchParams]); 
        // Lưu ý: dependency chỉ cần searchParams là đủ để kích hoạt khi URL đổi



    return (
        <div className="container mx-auto p-4">
            {/* Section 1: Hotel Images */}
            {branchDetail && (
            <div className="flex mb-6 bg-white p-6 rounded-md shadow-md">
                {/* Ảnh chính của branch */}
                <div className="w-1/2 mr-4">
                <img
                    src={`${API_BASE_URL}/${branchDetail.photoUrl}`}
                    alt="Hotel Main"
                    className="w-full h-100 object-cover rounded-lg"
                />
                </div>

                {/* Ảnh thumbnail: lấy từ tất cả room */}
                <div className="w-1/2 grid grid-cols-2 gap-4">
                {branchDetail.rooms
                    ?.flatMap((room) => room.photoUrls || []) // gom tất cả ảnh từ các room
                    .slice(0, 4) // chỉ lấy 4 ảnh đầu tiên
                    .map((image, index, arr) => (
                    <div key={index} className="relative">
                        <img
                        src={`${API_BASE_URL}/${image}`}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-48 object-cover rounded-lg"
                        />
                        {/* Nút hiển thị tổng số ảnh */}
                        {index === arr.length - 1 && (
                        <div
                            onClick={() => openModal(index)}
                            className="absolute bottom-4 right-4 cursor-pointer z-10"
                        >
                            <div className="flex items-center justify-center gap-6 pl-4 pr-6 py-2 rounded-[50px] h-[32px] bg-[#000000B2] opacity-70 min-w-[72px]">
                            <img
                                width="20"
                                height="20"
                                src="https://go2joy.vn/_nuxt/hotel-detail-total-image-icon.cf781a35.svg"
                                alt="Go2joy icon"
                            />
                            <span className="body-large-regular text-white">
                                {
                                branchDetail.rooms?.flatMap((room) => room.photoUrls || [])
                                    .length
                                }
                            </span>
                            </div>
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
            )}

            {/* Modal Slideshow */}
            {isModalOpen && branchDetail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-4 rounded-lg w-2/3">
                <div className="flex justify-between mb-4">
                    <button onClick={closeModal} className="text-black text-2xl">
                    &times;
                    </button>
                </div>
                <div className="relative">
                    <img
                    src={`${API_BASE_URL}/${
                        branchDetail.rooms?.flatMap((room) => room.photoUrls || [])[currentImageIndex]
                    }`}
                    alt="Slideshow"
                    className="w-full h-auto object-cover rounded-lg"
                    />
                    <div
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4 py-2 bg-black text-white cursor-pointer"
                    onClick={prevImage}
                    >
                    &#10094;
                    </div>
                    <div
                    className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4 py-2 bg-black text-white cursor-pointer"
                    onClick={nextImage}
                    >
                    &#10095;
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Section 2: Branch Information */}
            {branchDetail && (
            <div className="mb-8 bg-white p-6 rounded-md shadow-md">
                <h1 className="text-3xl font-semibold w-full pb-3">
                {branchDetail.branchName}
                </h1>
                <p className="text-gray-600">{branchDetail.address}</p>
            </div>
            )}


            {/* Khối đặt phòng */}
            <div className="bg-white p-6 rounded-md shadow-md">

            {/* Loại đặt phòng */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Loại đặt phòng</h3>
                <div className="flex justify-start gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => handleChangeType("HOUR")}
                    className={`px-6 py-3 rounded-md transition border ${
                    bookingTypeCode === "HOUR"
                        ? "bg-orange-600 text-white font-bold border-orange-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Theo giờ
                </button>

                <button
                    type="button"
                    onClick={() => handleChangeType("NIGHT")}
                    className={`px-6 py-3 rounded-md transition border ${
                    bookingTypeCode === "NIGHT"
                        ? "bg-orange-600 text-white font-bold border-orange-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Qua đêm
                </button>

                <button
                    type="button"
                    onClick={() => handleChangeType("DAY")}
                    className={`px-6 py-3 rounded-md transition border ${
                    bookingTypeCode === "DAY"
                        ? "bg-orange-600 text-white font-bold border-orange-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Theo ngày
                </button>
                </div>
            </div>

            {/* Ngày giờ (tùy bookingType) */}
            <div className="flex items-center justify-between gap-6">
                {/* Bên trái: Text cố định */}
                <h3 className="w-32 font-semibold text-gray-700">Ngày giờ</h3>

                {/* Giữa: các input căn đều */}
                <div className="flex flex-1 justify-center gap-6">
                {/* HOUR */}
                {bookingTypeCode === "HOUR" && (
                    <>
                    <div className="w-1/4">
                        <DatePicker
                        selected={fromYMD(checkInDate)}
                        onChange={handlePickCheckIn}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày nhận phòng"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="w-1/4">
                        <select
                        value={checkInTime}
                        onChange={(e) => setParam("checkInTime", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        >
                        <option value="">Chọn giờ nhận phòng</option>
                        {["13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                        </select>
                    </div>
                    <div className="w-1/4">
                        <select
                        value={hours}
                        onChange={(e) => setParam("hours", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        >
                        <option value="">Chọn số giờ</option>
                        {[1,2,3,4,5,6].map((h) => (
                            <option key={h} value={String(h)}>{h} giờ</option>
                        ))}
                        </select>
                    </div>
                    </>
                )}

                {/* NIGHT */}
                {bookingTypeCode === "NIGHT" && (
                    <>
                    <DatePicker
                        selected={fromYMD(checkInDate)}
                        onChange={handlePickCheckIn}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày nhận phòng"
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="text-sm text-gray-600 bg-gray-50 border rounded-md px-3 py-2">
                        Trả phòng: <span className="font-semibold">{checkOutDate || "—"}</span> (12:00 hôm sau)
                    </div>
                    </>
                )}

                {/* DAY */}
                {bookingTypeCode === "DAY" && (
                    <DailyBookingPicker
                    checkInDate={checkInDate}
                    setCheckInDate={(v) => setParam("checkInDate", v)}
                    checkOutDate={checkOutDate}
                    setCheckOutDate={(v) => setParam("checkOutDate", v)}
                    />
                )}
                </div>

                {/* Bên phải: nút cố định */}
                <button className="w-32 px-6 py-2 bg-orange-600 font-bold text-white rounded-md hover:bg-orange-700">
                Cập nhật
                </button>
            </div>
            </div>


            {branchDetail && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Danh sách phòng</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branchDetail.rooms?.map((room) => (
                        <div key={room.roomTypeId} className="flex justify-center">
                        <RoomCard
                            room={{
                            roomTypeId: room.roomTypeId,
                            name: room.roomTypeName,
                            description: room.description,
                            price: room.price,
                            currency: room.currency,
                            availableRooms: room.availableRooms,
                            images: room.photoUrls,
                            capacity: room.capacity,
                            }}
                            hotelId={hotelId}
                            bookingTypeCode={bookingTypeCode}
                            checkInDate={checkInDate}
                            checkOutDate={checkOutDate}
                            checkInTime={checkInTime}
                            hours={hours}
                            onViewDetail={handleViewRoomDetail}
                        />
                        </div>
                    ))}
                    </div>
                </div>
            )}

            {/* Modal chi tiết phòng */}
            {isRoomModalOpen && selectedRoom && (
            <RoomDetailModal room={selectedRoom} onClose={closeRoomModal} />
            )}


        </div>
    );
}

import { useEffect, useState } from "react";
import RoomCard from '../../components/customer/RoomCard';
import { useLocation, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DailyBookingPicker from "../../components/customer/DailyBookingPicker";
// 👇 Đảm bảo bạn đã export hàm getBranchReviews từ file api
import { getHotelDetailWithBooking, getBranchReviews } from "../../api/branches"; 
import { API_BASE_URL } from "../../config/api";
import RoomDetailModal from "../../components/customer/RoomDetailModal";

export default function HotelDetail() {
    const [searchParams, setSearchParams] = useSearchParams();

    const hotelId = searchParams.get("hotelId");
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const bookingTypeCode = searchParams.get("bookingTypeCode") || "HOUR";
    const checkInTime = searchParams.get("checkInTime");
    const hours = searchParams.get("hours");

    // --- Helpers xử lý ngày tháng ---
    const buildCheckInOut = ({ bookingTypeCode, checkInDate, checkOutDate, checkInTime, hours }) => {
        if (!bookingTypeCode) return { checkIn: null, checkOut: null, hours: null };
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

    // --- State chính ---
    const [branchDetail, setBranchDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- State Reviews (MỚI) ---
    const [reviewsData, setReviewsData] = useState({ content: [], totalPages: 0, number: 0 });
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewPage, setReviewPage] = useState(0); // Page bắt đầu từ 0
    const REVIEW_PAGE_SIZE = 5;

    // --- State Modal Image ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openModal = (index) => {
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);
    const nextImage = () => {
        if (!branchDetail?.rooms) return;
        const allImages = branchDetail.rooms.flatMap((room) => room.photoUrls || []);
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };
    const prevImage = () => {
        if (!branchDetail?.rooms) return;
        const allImages = branchDetail.rooms.flatMap((room) => room.photoUrls || []);
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // --- Helpers General ---
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
    
    // Format ngày giờ hiển thị cho Review
    const formatDateTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // Render sao đánh giá
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <svg 
                key={index} 
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 22 20"
            >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
        ));
    };

    // 👉 Cuộn lên đầu trang khi component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Events
    const handleChangeType = (code) => {
        replaceParams((p) => {
            p.set("bookingTypeCode", code);
            if (code === "NIGHT" || code === "DAY") {
                if (p.get("checkInDate")) {
                    p.set("checkOutDate", getNextDay(p.get("checkInDate")));
                } else {
                    p.delete("checkOutDate");
                }
            }
        });
    };
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
                p.set("checkOutDate", getNextDay(ymd));
            }
            if (bookingTypeCode === "HOUR") {
                p.delete("checkOutDate");
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

    const HOURS_OPTIONS = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const pad2 = (n) => String(n).padStart(2, "0");
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
        if (currentHour >= 21) {
            return { dayOffset: 1, time: HOURS_OPTIONS[0] };
        }
        const nextHour = currentHour + 1;
        const nextCandidate = `${pad2(nextHour)}:00`;
        if (HOURS_OPTIONS.includes(nextCandidate)) {
            return { dayOffset: 0, time: nextCandidate };
        }
        return { dayOffset: 0, time: HOURS_OPTIONS[0] };
    };

    // --- EFFECT FETCH HOTEL DATA ---
    useEffect(() => {
        const fetchHotel = async () => {
            if (!hotelId || !bookingTypeCode) return;
            try {
                setLoading(true);
                setError(null);
                const res = await getHotelDetailWithBooking(hotelId, payload);
                const data = res.data?.result ?? res.data;
                setBranchDetail(data);
            } catch (err) {
                console.error("❌ Lỗi khi gọi API hotel-detail:", err);
                setError(err?.response?.data?.message || err.message || "Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };
        fetchHotel();
    }, [hotelId, bookingTypeCode, checkIn, checkOut, hoursNum]);

    // --- EFFECT FETCH REVIEWS (MỚI) ---
    useEffect(() => {
        const fetchReviews = async () => {
            if (!hotelId) return;
            try {
                console.log("goi review")
                setLoadingReviews(true);
                const res = await getBranchReviews(hotelId, reviewPage, REVIEW_PAGE_SIZE);
                // Giả sử API trả về result có chứa content, totalPages, number
                const result = res.data?.result; 
                setReviewsData({
                    content: result?.content || [],
                    totalPages: result?.totalPages || 0,
                    number: result?.number || 0
                });
            } catch (err) {
                console.error("❌ Lỗi khi tải đánh giá:", err);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [hotelId, reviewPage]);

    // ... Logic set default params ...
    useEffect(() => {
        const p = new URLSearchParams(searchParams);
        const code = p.get("bookingTypeCode") || "HOUR";
        let shouldUpdate = false;
        const today = new Date();
        const todayYMD = toYMDLocal(today);

        if (code === "HOUR") {
            if (!p.get("checkInDate")) {
                const { dayOffset } = getDefaultHourTime();
                const ymd = dayOffset ? addDaysYMD(todayYMD, 1) : todayYMD;
                p.set("checkInDate", ymd);
                shouldUpdate = true;
            }
            if (!p.get("checkInTime")) {
                const { time } = getDefaultHourTime();
                p.set("checkInTime", time);
                shouldUpdate = true;
            }
            if (!p.get("hours")) {
                p.set("hours", "1");
                shouldUpdate = true;
            }
            if (p.get("checkOutDate")) {
                p.delete("checkOutDate");
                shouldUpdate = true;
            }
        }
        if (code === "NIGHT") {
            if (!p.get("checkInDate")) {
                p.set("checkInDate", todayYMD);
                shouldUpdate = true;
            }
            const currentCheckIn = p.get("checkInDate");
            const expectedCheckOut = getNextDay(currentCheckIn);
            if (p.get("checkOutDate") !== expectedCheckOut) {
                p.set("checkOutDate", expectedCheckOut);
                shouldUpdate = true;
            }
            if (p.get("checkInTime") || p.get("hours")) {
                p.delete("checkInTime");
                p.delete("hours");
                shouldUpdate = true;
            }
        }
        if (code === "DAY") {
            if (!p.get("checkInDate")) {
                p.set("checkInDate", todayYMD);
                shouldUpdate = true;
            }
            if (!p.get("checkOutDate")) {
                p.set("checkOutDate", addDaysYMD(todayYMD, 1));
                shouldUpdate = true;
            }
            if (p.get("checkInTime") || p.get("hours")) {
                p.delete("checkInTime");
                p.delete("hours");
                shouldUpdate = true;
            }
        }
        if (shouldUpdate) {
            setSearchParams(p, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const isMaintenance = branchDetail && branchDetail.branchStatus !== 'ACTIVE';

    if (loading && !branchDetail) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mb-4"></div>
                <p className="text-gray-600 font-medium text-lg">Đang tải thông tin khách sạn...</p>
            </div>
        );
    }

    return (
        <div className={`container mx-auto p-4 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Section 1: Hotel Images */}
            {branchDetail && (
                <div className="flex flex-col lg:flex-row mb-6 bg-white p-4 lg:p-6 rounded-md shadow-md">
                    <div className="w-full lg:w-1/2 lg:mr-4 mb-4 lg:mb-0">
                        <img
                            src={`${API_BASE_URL}/${branchDetail.photoUrl}`}
                            alt="Hotel Main"
                            className="w-full h-64 lg:h-full object-cover rounded-lg"
                        />
                    </div>
                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
                        {branchDetail.rooms
                            ?.flatMap((room) => room.photoUrls || [])
                            .slice(0, 4)
                            .map((image, index, arr) => (
                                <div key={index} className="relative">
                                    <img
                                        src={`${API_BASE_URL}/${image}`}
                                        alt={`Thumbnail ${index}`}
                                        className="w-full h-32 lg:h-48 object-cover rounded-lg"
                                    />
                                    {index === arr.length - 1 && (
                                        <div
                                            onClick={() => openModal(index)}
                                            className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 cursor-pointer z-10"
                                        >
                                            <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-black/70">
                                                <img
                                                    width="16" height="16"
                                                    src="https://go2joy.vn/_nuxt/hotel-detail-total-image-icon.cf781a35.svg"
                                                    alt="icon"
                                                />
                                                <span className="text-white text-sm font-semibold">
                                                    {branchDetail.rooms?.flatMap((room) => room.photoUrls || []).length}
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
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 pointer-events-auto">
                    <div className="bg-white p-2 rounded-lg w-full max-w-4xl relative">
                        <button onClick={closeModal} className="absolute top-2 right-4 text-black text-4xl z-10">&times;</button>
                        <div className="relative flex items-center justify-center">
                            <img
                                src={`${API_BASE_URL}/${branchDetail.rooms?.flatMap((room) => room.photoUrls || [])[currentImageIndex]}`}
                                alt="Slideshow"
                                className="max-h-[80vh] w-auto object-contain rounded-lg"
                            />
                            <button
                                className="absolute left-2 p-2 bg-black/50 text-white rounded-full hover:bg-black"
                                onClick={prevImage}
                            >
                                &#10094;
                            </button>
                            <button
                                className="absolute right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black"
                                onClick={nextImage}
                            >
                                &#10095;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Branch Information */}
            {branchDetail && (
                <div className="mb-4 bg-white p-6 rounded-md shadow-md">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-semibold">
                            {branchDetail.branchName}
                        </h1>
                        {isMaintenance && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full border border-red-300">
                                Đang bảo trì
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm lg:text-base">{branchDetail.address}</p>
                </div>
            )}

            {isMaintenance && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start">
                    <div className="mr-3 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-red-800">Khách sạn đang bảo trì</h4>
                        <p className="text-red-700">
                            Hiện tại khách sạn này đang tạm ngưng hoạt động để nâng cấp dịch vụ. 
                            Quý khách vui lòng quay lại sau hoặc chọn chi nhánh khác.
                        </p>
                    </div>
                </div>
            )}

            {/* Khối đặt phòng */}
            <div className={`bg-white p-4 lg:p-6 rounded-md shadow-md transition-opacity duration-300 ${isMaintenance ? "opacity-60 pointer-events-none select-none grayscale-[50%]" : ""}`}>
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Loại đặt phòng</h3>
                    <div className="flex flex-wrap gap-2 lg:gap-4">
                        {["HOUR", "NIGHT", "DAY"].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleChangeType(type)}
                                disabled={isMaintenance}
                                className={`flex-1 sm:flex-none px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base rounded-md transition border ${bookingTypeCode === type
                                    ? "bg-orange-600 text-white font-bold border-orange-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                                    }`}
                            >
                                {type === "HOUR" ? "Theo giờ" : type === "NIGHT" ? "Qua đêm" : "Theo ngày"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                    <h3 className="w-full lg:w-32 font-semibold text-gray-700">Ngày giờ</h3>

                    <div className="flex flex-col sm:flex-row flex-1 w-full gap-4">
                        {bookingTypeCode === "HOUR" && (
                            <>
                                <div className="w-full sm:w-1/3">
                                    <DatePicker
                                        selected={fromYMD(checkInDate)}
                                        onChange={handlePickCheckIn}
                                        minDate={new Date()}
                                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày"
                                        disabled={isMaintenance}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                                    />
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <select
                                        value={checkInTime || ""}
                                        onChange={(e) => setParam("checkInTime", e.target.value)}
                                        disabled={isMaintenance}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                                    >
                                        <option value="">Giờ nhận</option>
                                        {HOURS_OPTIONS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-full sm:w-1/3">
                                    <select
                                        value={hours || ""}
                                        onChange={(e) => setParam("hours", e.target.value)}
                                        disabled={isMaintenance}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                                    >
                                        <option value="">Số giờ</option>
                                        {[1, 2, 3, 4, 5, 6].map((h) => (
                                            <option key={h} value={String(h)}>{h} giờ</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {bookingTypeCode === "NIGHT" && (
                            <>
                                <div className="w-full sm:w-1/2">
                                    <DatePicker
                                        selected={fromYMD(checkInDate)}
                                        onChange={handlePickCheckIn}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        disabled={isMaintenance}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                                    />
                                </div>
                                <div className="w-full sm:w-1/2 text-sm text-gray-600 bg-gray-50 border rounded-md px-3 py-2 flex items-center">
                                    Checkout: <span className="font-semibold ml-1">{checkOutDate || "—"}</span> (12:00)
                                </div>
                            </>
                        )}

                        {bookingTypeCode === "DAY" && (
                            <div className="w-full">
                                <DailyBookingPicker
                                    checkInDate={checkInDate}
                                    setCheckInDate={(v) => setParam("checkInDate", v)}
                                    checkOutDate={checkOutDate}
                                    setCheckOutDate={(v) => setParam("checkOutDate", v)}
                                    disabled={isMaintenance}
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        disabled={isMaintenance}
                        className={`w-full lg:w-32 px-6 py-2 font-bold text-white rounded-md transition
                            ${isMaintenance ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                        Cập nhật
                    </button>
                </div>
            </div>

            {/* Danh sách phòng */}
            {branchDetail && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Danh sách phòng</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {branchDetail.rooms?.map((room) => {
                            const isSoldOut = room.availableRooms === 0;
                            const isLocked = isMaintenance || isSoldOut;

                            return (
                                <div 
                                    key={room.roomTypeId} 
                                    className={`relative flex justify-center transition-all duration-300 rounded-lg ${
                                        isLocked ? "grayscale opacity-75 pointer-events-none select-none bg-gray-100" : ""
                                    }`}
                                >
                                    {isLocked && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 rounded-lg">
                                            {isMaintenance ? (
                                                <div className="bg-gray-800 text-white px-6 py-2 font-bold text-lg rounded shadow-lg transform -rotate-12 border-2 border-white">
                                                    BẢO TRÌ
                                                </div>
                                            ) : (
                                                <div className="bg-red-600 text-white px-6 py-2 font-bold text-lg rounded shadow-lg transform -rotate-12 border-2 border-white">
                                                    HẾT PHÒNG
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="w-full">
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* NEW SECTION: ĐÁNH GIÁ CỦA KHÁCH HÀNG (REVIEWS) */}
            {/* ========================================================= */}
            {branchDetail && (
                <div className="mt-8 bg-white p-6 rounded-md shadow-md">
                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                        Đánh giá từ khách hàng
                        {reviewsData.content?.length > 0 && (
                             <span className="ml-2 text-sm font-normal text-gray-500">
                                ({reviewsData.content.length} đánh giá trang này)
                            </span>
                        )}
                    </h3>
                    
                    {loadingReviews ? (
                         <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                        </div>
                    ) : reviewsData.content && reviewsData.content.length > 0 ? (
                        <div className="space-y-6">
                            {reviewsData.content.map((review) => (
                                <div key={review.reviewId} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-start">
                                        {/* Avatar Placeholder */}
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg uppercase">
                                                {review.user?.fullName?.charAt(0) || "U"}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800">{review.user?.fullName || "Khách hàng ẩn danh"}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(review.createdAt)}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-gray-700 text-sm leading-relaxed">
                                                {review.comment}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có đánh giá nào cho chi nhánh này.
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {reviewsData.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-8 gap-2">
                            <button
                                onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                                disabled={reviewPage === 0 || loadingReviews}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            
                            <span className="text-sm text-gray-600 font-medium">
                                Trang {reviewPage + 1} / {reviewsData.totalPages}
                            </span>

                            <button
                                onClick={() => setReviewPage(p => Math.min(reviewsData.totalPages - 1, p + 1))}
                                disabled={reviewPage >= reviewsData.totalPages - 1 || loadingReviews}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal chi tiết phòng */}
            {isRoomModalOpen && selectedRoom && (
                <RoomDetailModal room={selectedRoom} onClose={closeRoomModal} />
            )}
        </div>
    );
}
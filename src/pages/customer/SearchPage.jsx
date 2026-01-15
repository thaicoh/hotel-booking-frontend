import HotelCard from "../../components/customer/HotelCard";
import PriceRangeSlider from "../../components/customer/PriceRangeSlider";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { searchHotels } from "../../api/branches";
import { API_BASE_URL } from "../../config/api";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- UTILS XỬ LÝ NGÀY THÁNG (LOGIC SEARCHBAR) ---

    // 1. Chuyển Date Object -> "YYYY-MM-DD"
    const toYMD = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // 2. Parse chuỗi URL (có thể có T hoặc không) về Date Object chuẩn (tránh lỗi lùi 1 ngày)
    // Chỉ lấy phần YYYY-MM-DD để tạo Date, bỏ qua giờ
    const parseDateFromParams = (dateStr) => {
        if (!dateStr) return null;
        try {
            // Cắt bỏ phần giờ nếu có (VD: 2023-10-20T14:00:00 -> 2023-10-20)
            const cleanDateStr = dateStr.split("T")[0]; 
            const [y, m, d] = cleanDateStr.split("-").map(Number);
            return new Date(y, m - 1, d); // Tạo Date local chính xác
        } catch (e) {
            return null;
        }
    };

    // 3. Lấy ngày hôm sau (trả về chuỗi YYYY-MM-DD)
    const getNextDayYMD = (dateObj) => {
        if (!dateObj) return "";
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        return toYMD(nextDay);
    };

    // --- STATE TỪ URL ---
    const bookingTypeCode = searchParams.get("bookingTypeCode") || "HOUR";
    const locationKeyword = searchParams.get("location") || "";
    
    // Lấy giá trị thô từ URL để hiển thị lên DatePicker (dùng hàm parse an toàn)
    const checkInDateParam = searchParams.get("checkInDate");
    const checkOutDateParam = searchParams.get("checkOutDate");
    
    const checkInTime = searchParams.get("checkInTime") || "";
    const hours = searchParams.get("hours") || "";
    
    const minPrice = Number(searchParams.get("minPrice") || 20000);
    const maxPrice = Number(searchParams.get("maxPrice") || 10000000);
    // State lưu lại kết quả của lần search cuối cùng để đồng bộ với Card
    const [lastSearchPayload, setLastSearchPayload] = useState(null);

    // --- LOGIC GỌI API ---
    
    const fetchHotelsData = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchHotels(payload);
            setHotels(res.data?.result || []);

            // Lưu lại thông tin loại phòng và thời gian của lần search này
            setLastSearchPayload(payload);
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Search failed";
            setError(msg);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    // Tự động gọi API khi vào trang hoặc reload trang (dựa vào URL hiện tại)
    useEffect(() => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        
        // Chuẩn hóa dữ liệu trước khi gọi API lần đầu
        const payload = {
            bookingTypeCode: params.bookingTypeCode || "HOUR",
            location: params.location || "",
            checkIn: params.checkInDate || null,
            checkOut: params.checkOutDate || null,
            checkInTime: params.checkInTime || null,
            hours: params.hours ? Number(params.hours) : null,
            minPrice: params.minPrice ? Number(params.minPrice) : null,
            maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
        };

        fetchHotelsData(payload);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy 1 lần khi mount, sau đó việc update sẽ do nút "Cập nhật" lo

    // --- HANDLERS ---

    const updateParams = (newParams) => {
        const nextParams = new URLSearchParams(searchParams);
        Object.keys(newParams).forEach(key => {
            if (newParams[key] === null || newParams[key] === undefined || newParams[key] === "") {
                nextParams.delete(key);
            } else {
                nextParams.set(key, newParams[key]);
            }
        });
        setSearchParams(nextParams, { replace: true });
    };

    // Hàm xử lý chọn ngày - Logic quan trọng: Chỉ ghép giờ khi set vào URL
    const handleDateChange = (date, field) => {
        if (!date) {
            updateParams({ [field]: null });
            return;
        }

        const ymd = toYMD(date);
        let fullDateTime = "";

        // Logic ghép giờ tùy theo loại booking
        if (field === "checkInDate") {
            if (bookingTypeCode === "HOUR") {
                // Với HOUR, CheckInDate giữ base ngày, giờ được ghép từ checkInTime sau
                // Nhưng để API hiểu, ta tạm để mặc định hoặc lấy giờ hiện tại, 
                // tuy nhiên logic searchbar thường để T00:00 hoặc T(giờ đã chọn)
                const timePart = checkInTime ? `${checkInTime}:00` : "14:00:00"; 
                fullDateTime = `${ymd}T${timePart}`;
                
                // Nếu đang là HOUR, đổi ngày checkin không tự đổi checkout (vì tính theo hours)
                updateParams({ checkInDate: fullDateTime });
            } 
            else if (bookingTypeCode === "NIGHT") {
                fullDateTime = `${ymd}T21:00:00`;
                const nextDayYMD = getNextDayYMD(date);
                updateParams({ 
                    checkInDate: fullDateTime,
                    checkOutDate: `${nextDayYMD}T12:00:00`
                });
            } 
            else if (bookingTypeCode === "DAY") {
                fullDateTime = `${ymd}T14:00:00`;
                // Nếu ngày checkin > checkout hiện tại, clear checkout
                const currentCheckOut = parseDateFromParams(checkOutDateParam);
                if (currentCheckOut && date >= currentCheckOut) {
                    updateParams({ checkInDate: fullDateTime, checkOutDate: null });
                } else {
                    updateParams({ checkInDate: fullDateTime });
                }
            }
        } 
        else if (field === "checkOutDate") {
            // Checkout luôn là 12:00 trưa
            fullDateTime = `${ymd}T12:00:00`;
            updateParams({ checkOutDate: fullDateTime });
        }
    };

    const handleUpdateSearch = () => {
        // 1. Validate logic cơ bản
        if (bookingTypeCode === "HOUR" && (!checkInTime || !hours)) {
            alert("Vui lòng chọn giờ nhận phòng và số giờ ở.");
            return;
        }

        // 2. Chuẩn bị payload chuẩn xác từ URL Params hiện tại (đã được update bởi DatePicker)
        // Lưu ý: searchParams lúc này đã chứa chuỗi ISO đầy đủ do handleDateChange set vào
        
        let finalCheckIn = searchParams.get("checkInDate");
        let finalCheckOut = searchParams.get("checkOutDate");

        // Logic fix lại CheckIn/Out cho HOUR nếu user thay đổi giờ/hours mà chưa cập nhật date string
        if (bookingTypeCode === "HOUR") {
            // Lấy ngày gốc từ param (cắt T lấy YMD)
            const rawDate = searchParams.get("checkInDate"); 
            if (rawDate && checkInTime && hours) {
                const ymd = rawDate.split("T")[0];
                const startStr = `${ymd}T${checkInTime}:00`;
                
                // Tính checkout dựa trên số giờ
                const startDate = new Date(startStr);
                const endDate = new Date(startDate.getTime() + Number(hours) * 60 * 60 * 1000);
                
                // Format lại thành chuỗi ISO local
                const formatISO = (d) => {
                    const pad = n => String(n).padStart(2,'0');
                    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                };

                finalCheckIn = startStr; // VD: 2023-10-20T14:00:00
                finalCheckOut = formatISO(endDate);
                
                // Cập nhật lại URL cho đúng
                updateParams({
                    checkInDate: finalCheckIn,
                    checkOutDate: finalCheckOut
                });
            }
        }

        // 3. Gọi API
        fetchHotelsData({
            bookingTypeCode,
            location: locationKeyword,
            checkIn: finalCheckIn,
            checkOut: finalCheckOut,
            checkInTime,
            hours: hours ? Number(hours) : null,
            minPrice,
            maxPrice
        });
    };

    const handleChangeType = (code) => {
        // Reset logic khi chuyển tab
        const currentCheckInRaw = searchParams.get("checkInDate");
        const dateObj = parseDateFromParams(currentCheckInRaw) || new Date(); // Giữ ngày hiện tại nếu có
        const ymd = toYMD(dateObj);
        
        const newParams = { bookingTypeCode: code };

        if (code === "HOUR") {
            newParams.checkInDate = `${ymd}T${checkInTime || '14:00'}:00`; // Giữ ngày, ghép giờ tạm
            newParams.checkOutDate = null; // HOUR tính động
        } else if (code === "NIGHT") {
            newParams.checkInTime = null;
            newParams.hours = null;
            newParams.checkInDate = `${ymd}T21:00:00`;
            newParams.checkOutDate = `${getNextDayYMD(dateObj)}T12:00:00`;
        } else if (code === "DAY") {
            newParams.checkInTime = null;
            newParams.hours = null;
            newParams.checkInDate = `${ymd}T14:00:00`;
            newParams.checkOutDate = `${getNextDayYMD(dateObj)}T12:00:00`; // Default 1 ngày
        }

        updateParams(newParams);
    };

    // CSS Classes
    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 hover:bg-white";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- SIDEBAR FILTER --- */}
                <aside className="lg:col-span-5 xl:col-span-4 space-y-6 bg-white border border-gray-100 p-6 rounded-xl shadow-lg lg:sticky lg:top-24">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Bộ lọc tìm kiếm
                        </h2>
                    </div>

                    {/* Location */}
                    <div>
                        <label className={labelClass}>Khu vực / Tên khách sạn</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={locationKeyword}
                                onChange={(e) => updateParams({ location: e.target.value })}
                                placeholder="Nhập thành phố, quận hoặc tên khách sạn..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>

                    {/* Booking Type */}
                    <div>
                        <label className={labelClass}>Loại đặt phòng</label>
                        <div className="flex p-1.5 bg-gray-100 rounded-xl">
                            {[
                                { id: 'HOUR', label: 'Theo giờ' },
                                { id: 'NIGHT', label: 'Qua đêm' },
                                { id: 'DAY', label: 'Theo ngày' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleChangeType(type.id)}
                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                                        bookingTypeCode === type.id
                                            ? "bg-white text-orange-600 shadow-md ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Logic */}
                    <div className="space-y-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                        <label className={labelClass}>Chi tiết thời gian</label>

                        {/* MODE: HOUR */}
                        {bookingTypeCode === "HOUR" && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <DatePicker
                                        selected={parseDateFromParams(checkInDateParam) || new Date()}
                                        onChange={(date) => handleDateChange(date, "checkInDate")}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        className={inputClass}
                                        wrapperClassName="w-full"
                                        placeholderText="Chọn ngày"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        value={checkInTime} 
                                        onChange={(e) => updateParams({ checkInTime: e.target.value })} 
                                        className={inputClass}
                                    >
                                        <option value="">Giờ đến</option>
                                        {["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <select 
                                        value={hours} 
                                        onChange={(e) => updateParams({ hours: e.target.value })} 
                                        className={inputClass}
                                    >
                                        <option value="">Số giờ</option>
                                        {[1, 2, 3, 4, 5, 6].map((h) => (
                                            <option key={h} value={String(h)}>{h} giờ</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* MODE: NIGHT */}
                        {bookingTypeCode === "NIGHT" && (
                            <div className="space-y-4">
                                <DatePicker
                                    selected={parseDateFromParams(checkInDateParam) || new Date()}
                                    onChange={(date) => handleDateChange(date, "checkInDate")}
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    className={inputClass}
                                    wrapperClassName="w-full"
                                    placeholderText="Chọn ngày nhận"
                                />
                                <div className="text-sm bg-white border border-orange-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                    <div>
                                        <span className="text-[10px] text-orange-800 uppercase font-black block">Trả phòng dự kiến</span>
                                        <span className="font-bold text-gray-800">
                                            {checkOutDateParam ? parseDateFromParams(checkOutDateParam).toLocaleDateString('vi-VN') : "—"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded">12:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODE: DAY */}
                        {bookingTypeCode === "DAY" && (
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Ngày nhận phòng</label>
                                    <DatePicker
                                        selected={parseDateFromParams(checkInDateParam) || new Date()}
                                        onChange={(date) => handleDateChange(date, "checkInDate")}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        className={inputClass}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Ngày trả phòng</label>
                                    <DatePicker
                                        selected={parseDateFromParams(checkOutDateParam)}
                                        onChange={(date) => handleDateChange(date, "checkOutDate")}
                                        // Min date của checkout phải là ngày sau ngày checkin
                                        minDate={
                                            checkInDateParam 
                                            ? new Date(parseDateFromParams(checkInDateParam).getTime() + 86400000) 
                                            : new Date()
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày trả"
                                        className={inputClass}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price Slider */}
                    <div className="pt-2">
                        <label className={labelClass}>Khoảng giá (VND)</label>
                        <div className="px-2 pt-4 pb-2">
                            <PriceRangeSlider
                                values={[minPrice, maxPrice]}
                                onChange={(values) => updateParams({ minPrice: String(values[0]), maxPrice: String(values[1]) })}
                            />
                        </div>
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={handleUpdateSearch}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.97] flex items-center justify-center gap-3 mt-4"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        CẬP NHẬT KẾT QUẢ
                    </button>
                </aside>

                {/* --- MAIN RESULTS AREA --- */}
                <main className="lg:col-span-7 xl:col-span-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div>
                            <h2 className="font-bold text-xl text-gray-800">Kết quả tìm kiếm</h2>
                            {!loading && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Tìm thấy <span className="font-semibold text-orange-600">{hotels.length}</span> khách sạn phù hợp
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <label htmlFor="sort" className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                Sắp xếp theo:
                            </label>
                            <div className="relative">
                                <select
                                    id="sort"
                                    name="sort"
                                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer hover:bg-white transition-colors"
                                >
                                    <option value="relevance">Phù hợp nhất</option>
                                    <option value="distance">Khoảng cách gần nhất</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                    <option value="priceLow">Giá thấp nhất</option>
                                    <option value="priceHigh">Giá cao nhất</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid/List */}
                    <div className="space-y-4">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                                <p className="text-gray-500 font-medium">Đang tìm phòng tốt nhất cho bạn...</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
                                <p className="font-semibold">Đã xảy ra lỗi</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        )}

                        {!loading && !error && hotels.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm text-center px-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-700">Không tìm thấy khách sạn nào</h3>
                                <p className="text-gray-500 max-w-md mt-2">
                                    Hãy thử thay đổi ngày, khu vực hoặc điều chỉnh bộ lọc giá để xem thêm kết quả.
                                </p>
                            </div>
                        )}

                        {!loading && !error && hotels.map((h) => (
                            <div key={h.branchId} className="transform transition-transform hover:-translate-y-1 duration-200">
                                <HotelCard
                                    hotelId={h.branchId}
                                    image={h.photoUrl ? `${API_BASE_URL}${h.photoUrl.startsWith("/") ? "" : "/"}${h.photoUrl}` : "https://via.placeholder.com/350x200"}
                                    name={h.branchName}
                                    rating={4.5}
                                    reviews={0}
                                    address={h.address}
                                    promo={h.roomTypeName ? `Loại phòng: ${h.roomTypeName}` : ""}
                                    price={`${Number(h.minPrice || 0).toLocaleString("vi-VN")} ${h.currency || "VND"}`}
                                    rooms={0}

                                    // Dùng thông tin từ payload đã search thành công
                                    bookingTypeCode={lastSearchPayload?.bookingTypeCode || "HOUR"}
                                    checkInDate={lastSearchPayload?.checkIn}
                                    checkOutDate={lastSearchPayload?.checkOut}
                                />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
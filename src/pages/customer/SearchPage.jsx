import HotelCard from "../../components/customer/HotelCard";
import PriceRangeSlider from "../../components/customer/PriceRangeSlider";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { searchHotels } from "../../api/branches";
import { API_BASE_URL } from "../../config/api";
import { useSearchParams } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Bạn có thể import icon nếu muốn, ví dụ từ react-icons hoặc heroicons
// import { FiSearch, FiCalendar, FiClock, FiMapPin } from "react-icons/fi"; 

export default function SearchPage() {
    const routerLocation = useLocation();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buildCheckInOut = ({ bookingTypeCode, checkInDate, checkOutDate, checkInTime, hours }) => {
        if (!bookingTypeCode) return { checkIn: null, checkOut: null, hours: null };

        if (bookingTypeCode === "HOUR") {
            const checkIn = (checkInDate && checkInTime) ? `${checkInDate}T${checkInTime}:00` : null;
            return { checkIn, checkOut: null, hours: hours ? Number(hours) : null };
        }

        if (bookingTypeCode === "NIGHT") {
            const checkIn = checkInDate ? `${checkInDate}T21:00:00` : null;
            const checkOut = checkOutDate ? `${checkOutDate}T12:00:00` : null;
            return { checkIn, checkOut, hours: null };
        }

        if (bookingTypeCode === "DAY") {
            const checkIn = checkInDate ? `${checkInDate}T14:00:00` : null;
            const checkOut = checkOutDate ? `${checkOutDate}T12:00:00` : null;
            return { checkIn, checkOut, hours: null };
        }

        return { checkIn: null, checkOut: null, hours: null };
    };

    const [searchParams, setSearchParams] = useSearchParams();

    const payload = useMemo(() => {
        const bookingTypeCode = searchParams.get("bookingTypeCode") || null;
        const location = searchParams.get("location") || null;
        const checkInDate = searchParams.get("checkInDate") || null;
        const checkOutDate = searchParams.get("checkOutDate") || null;
        const checkInTime = searchParams.get("checkInTime") || null;
        const hours = searchParams.get("hours") || null;
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        const { checkIn, checkOut, hours: hoursNum } = buildCheckInOut({
            bookingTypeCode,
            checkInDate,
            checkOutDate,
            checkInTime,
            hours,
        });

        return {
            bookingTypeCode,
            location,
            checkIn,
            checkOut,
            hours: hoursNum,
            minPrice: minPrice ? Number(minPrice) : null,
            maxPrice: maxPrice ? Number(maxPrice) : null,
        };
    }, [searchParams]);

    const toYMD = (d) => {
        if (!d) return "";
        if (typeof d.format === "function") return d.format("YYYY-MM-DD");
        if (d.target && d.target.value) return d.target.value;
        if (typeof d === "string") return d.split("T")[0];
        if (d instanceof Date) return d.toISOString().split("T")[0];
        const date = new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    };

    const toYMDLocal = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

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

    const formatLocalDateTime = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        const second = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    };

    const bookingTypeCode = searchParams.get("bookingTypeCode") || "HOUR";
    const keyword = searchParams.get("location") || "";
    const checkInDate = searchParams.get("checkInDate") || "";
    const checkOutDate = searchParams.get("checkOutDate") || "";
    const checkInTime = searchParams.get("checkInTime") || "";
    const hours = searchParams.get("hours") || "";

    const handlePickCheckIn = (start, end) => {
        const ymdStart = start ? toYMD(start) : "";
        const ymdEnd = end ? toYMD(end) : "";

        replaceParams((p) => {
            if (!ymdStart) {
                p.delete("checkInDate");
                p.delete("checkOutDate");
                return;
            }

            const checkIn = `${ymdStart}T14:00:00`;
            p.set("checkInDate", checkIn);

            if (bookingTypeCode === "HOUR") {
                if (checkInTime && hours) {
                    const checkInObj = new Date(`${ymdStart}T${checkInTime}:00`);
                    const checkOutObj = new Date(checkInObj.getTime() + hours * 60 * 60 * 1000);
                    p.set("checkInDate", formatLocalDateTime(checkInObj));
                    p.set("checkOutDate", formatLocalDateTime(checkOutObj));
                }
            }

            if (bookingTypeCode === "NIGHT") {
                const nextDay = getNextDay(ymdStart);
                p.set("checkOutDate", `${nextDay}T12:00:00`);
            }

            const checkInObj = new Date(`${ymdStart}T14:00:00`);
            p.set("checkInDate", formatLocalDateTime(checkInObj));

            if (bookingTypeCode === "DAY") {
                if (ymdEnd) {
                    const checkOutObj = new Date(`${ymdEnd}T12:00:00`);
                    checkOutObj.setDate(checkOutObj.getDate());
                    p.set("checkOutDate", formatLocalDateTime(checkOutObj));
                } else {
                    p.delete("checkOutDate");
                }
            }
        });
    };

    const handleChangeType = (code) => {
        replaceParams((p) => {
            p.set("bookingTypeCode", code);
            if (code !== "HOUR") {
                p.delete("checkInTime");
                p.delete("hours");
            }
            if (code === "HOUR") {
                p.delete("checkOutDate");
            }
            if (code === "NIGHT") {
                if (p.get("checkInDate")) {
                    const onlyDate = p.get("checkInDate").split("T")[0];
                    const checkOutWithTime = `${getNextDay(onlyDate)}T12:00:00`;
                    p.set("checkOutDate", checkOutWithTime);
                } else {
                    p.delete("checkOutDate");
                }
            }
            if (code === "DAY") {
                if (p.get("checkInDate")) {
                    const onlyDate = p.get("checkInDate").split("T")[0];
                    const checkOutWithTime = `${getNextDay(onlyDate)}T12:00:00`;
                    p.set("checkOutDate", checkOutWithTime);
                }
            }
        });
    };

    const minPrice = Number(searchParams.get("minPrice") || 20000);
    const maxPrice = Number(searchParams.get("maxPrice") || 10000000);

    const handlePriceChange = (newValues) => {
        replaceParams((p) => {
            p.set("minPrice", String(newValues[0]));
            p.set("maxPrice", String(newValues[1]));
        });
    };

    const handleUpdateSearch = () => {
        if (bookingTypeCode === "HOUR" && (!checkInTime || !hours)) {
            alert("Vui lòng chọn giờ nhận phòng và số giờ ở.");
            return;
        }

        let updatedCheckIn = checkInDate;
        let updatedCheckOut = checkOutDate;

        if (bookingTypeCode === "HOUR" && checkInDate && checkInTime && hours) {
            const onlyDate = checkInDate.split("T")[0];
            const checkInStr = `${onlyDate}T${checkInTime}:00`;
            const checkInObj = new Date(checkInStr);
            const checkOutObj = new Date(checkInObj.getTime() + Number(hours) * 60 * 60 * 1000);
            const checkOutStr = formatLocalDateTime(checkOutObj);

            updatedCheckIn = formatLocalDateTime(checkInObj);
            updatedCheckOut = checkOutStr;
        }

        if (bookingTypeCode === "NIGHT") {
            if (checkInDate) {
                const onlyDate = checkInDate.split("T")[0];
                const checkInObj = new Date(`${onlyDate}T21:00:00`);
                const checkOutObj = new Date(`${getNextDay(onlyDate)}T12:00:00`);

                updatedCheckIn = formatLocalDateTime(checkInObj);
                updatedCheckOut = formatLocalDateTime(checkOutObj);
            }
        }

        if (bookingTypeCode === "DAY") {
            if (checkInDate) {
                const onlyDateIn = checkInDate.split("T")[0];
                const checkInObj = new Date(`${onlyDateIn}T14:00:00`);
                updatedCheckIn = formatLocalDateTime(checkInObj);

                if (checkOutDate) {
                    const onlyDateOut = checkOutDate.split("T")[0];
                    const checkOutObj = new Date(`${onlyDateOut}T12:00:00`);
                    updatedCheckOut = formatLocalDateTime(checkOutObj);
                } else {
                    updatedCheckOut = "";
                }
            }
        }

        const params = new URLSearchParams(searchParams);
        params.set("bookingTypeCode", bookingTypeCode);
        params.set("location", keyword);
        params.set("checkInDate", updatedCheckIn);
        params.set("checkOutDate", updatedCheckOut);
        params.set("minPrice", minPrice);
        params.set("maxPrice", maxPrice);

        if (checkInTime) params.set("checkInTime", checkInTime);
        if (hours) params.set("hours", String(Number(hours)));

        setSearchParams(params, { replace: true });

        fetchHotels({
            bookingTypeCode,
            location: keyword,
            checkIn: updatedCheckIn,
            checkOut: updatedCheckOut,
            checkInTime,
            hours: Number(hours),
            minPrice,
            maxPrice,
        });
    };

    const fetchHotels = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await searchHotels(payload);
            setHotels(res.data?.result || []);
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Search failed";
            setError(msg);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        const checkIn = params.get("checkInDate");
        const checkOut = params.get("checkOutDate");
        const normalize = (s) => s?.replace(/T14:00:00T14:00:00/, "T14:00:00");

        fetchHotels({
            bookingTypeCode: params.get("bookingTypeCode"),
            location: params.get("location"),
            checkIn: normalize(checkIn),
            checkOut: normalize(checkOut),
            minPrice: params.get("minPrice"),
            maxPrice: params.get("maxPrice"),
        });
    }, []);

    // Common CSS classes for inputs
    const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 hover:bg-white";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
            {/* Tăng gap và điều chỉnh tỷ lệ cột: lg:12 cột -> sidebar chiếm 5, main chiếm 7 */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- SIDEBAR FILTER (Đã tăng độ rộng) --- */}
                <aside className="lg:col-span-5 xl:col-span-4 space-y-6 bg-white border border-gray-100 p-6 rounded-xl shadow-lg lg:sticky lg:top-24">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Bộ lọc tìm kiếm
                        </h2>
                    </div>

                    {/* Location Input */}
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
                                value={keyword}
                                onChange={(e) => setParam("location", e.target.value)}
                                placeholder="Nhập thành phố, quận hoặc tên khách sạn..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                    </div>

                    {/* Booking Type Tabs */}
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

                    {/* Dynamic Date/Time Inputs */}
                    <div className="space-y-4 bg-orange-50/30 p-4 rounded-xl border border-orange-100">
                        <label className={labelClass}>Chi tiết thời gian</label>

                        {/* MODE: HOUR */}
                        {bookingTypeCode === "HOUR" && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <DatePicker
                                        selected={checkInDate ? new Date(checkInDate) : new Date()}
                                        onChange={(date) => {
                                            setParam("checkInDate", toYMDLocal(date));
                                            handlePickCheckIn(date, checkOutDate ? new Date(checkOutDate) : null);
                                        }}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        className={inputClass}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={checkInTime} onChange={(e) => setParam("checkInTime", e.target.value)} className={inputClass}>
                                        <option value="">Giờ đến</option>
                                        {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <select value={hours} onChange={(e) => setParam("hours", e.target.value)} className={inputClass}>
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
                                    selected={checkInDate ? new Date(checkInDate) : new Date()}
                                    onChange={handlePickCheckIn}
                                    minDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    className={inputClass}
                                    wrapperClassName="w-full"
                                />
                                <div className="text-sm bg-white border border-orange-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                    <div>
                                        <span className="text-[10px] text-orange-800 uppercase font-black block">Trả phòng dự kiến</span>
                                        <span className="font-bold text-gray-800">
                                            {checkOutDate ? new Date(checkOutDate).toLocaleDateString('vi-VN') : "—"}
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
                                        selected={checkInDate ? new Date(checkInDate) : new Date()}
                                        onChange={(date) => {
                                            setParam("checkInDate", toYMDLocal(date));
                                            handlePickCheckIn(date, checkOutDate ? new Date(checkOutDate) : null);
                                        }}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        className={inputClass}
                                        wrapperClassName="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Ngày trả phòng</label>
                                    <DatePicker
                                        selected={checkOutDate ? new Date(checkOutDate.split("T")[0]) : null}
                                        onChange={(date) => {
                                            const ymd = date ? date.toISOString().split("T")[0] : "";
                                            setParam("checkOutDate", ymd);
                                            handlePickCheckIn(checkInDate ? new Date(checkInDate.split("T")[0]) : null, date);
                                        }}
                                        minDate={checkInDate ? new Date(new Date(checkInDate.split("T")[0]).getTime() + 86400000) : new Date()}
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
                                onChange={handlePriceChange}
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

                {/* --- MAIN RESULTS AREA ( lg:col-span-7 ) --- */}
                <main className="lg:col-span-7 xl:col-span-8 space-y-6">
                    {/* ... phần hiển thị HotelCard ... */}
                    {/* Header Results */}
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
                                    checkInDate={checkInDate}
                                    checkOutDate={checkOutDate}
                                    bookingTypeCode={bookingTypeCode}
                                />
                            </div>
                        ))}
                    </div>

                </main>
            </div>
        </div>
    );
}
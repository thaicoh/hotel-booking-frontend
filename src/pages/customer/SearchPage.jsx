import HotelCard from "../../components/customer/HotelCard";
import PriceRangeSlider from "../../components/customer/PriceRangeSlider";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { searchHotels } from "../../api/branches";
import { API_BASE_URL } from "../../config/api";
import { useSearchParams } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DailyBookingPicker from "../../components/customer/DailyBookingPicker"; 




export default function SearchPage() {

    const routerLocation = useLocation();

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const buildCheckInOut = ({ bookingTypeCode, checkInDate, checkOutDate, checkInTime, hours }) => {
        // trả về { checkIn, checkOut, hours }
        if (!bookingTypeCode) return { checkIn: null, checkOut: null, hours: null };

        // HOUR: checkInDate + checkInTime, hours
        if (bookingTypeCode === "HOUR") {
            const checkIn = (checkInDate && checkInTime) ? `${checkInDate}T${checkInTime}:00` : null;
            return { checkIn, checkOut: null, hours: hours ? Number(hours) : null };
        }

        // NIGHT: 21:00 -> 12:00 hôm sau
        if (bookingTypeCode === "NIGHT") {
            const checkIn = checkInDate ? `${checkInDate}T21:00:00` : null;
            const checkOut = checkOutDate ? `${checkOutDate}T12:00:00` : null;
            return { checkIn, checkOut, hours: null };
        }

        // DAY: 14:00 -> 12:00
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

    // --- Helpers ---
    const toYMD = (d) => d.toISOString().split("T")[0];
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
    const bookingTypeCode = searchParams.get("bookingTypeCode") || "HOUR"; // mặc định
    const keyword = searchParams.get("location") || ""; // dùng 'location' để match backend field
    const checkInDate = searchParams.get("checkInDate") || "";
    const checkOutDate = searchParams.get("checkOutDate") || "";
    const checkInTime = searchParams.get("checkInTime") || "";
    const hours = searchParams.get("hours") || "";

    // --- Click đổi loại đặt phòng ---
    const handleChangeType = (code) => {
    replaceParams((p) => {
        p.set("bookingTypeCode", code);

        // reset các field không liên quan
        if (code !== "HOUR") {
        p.delete("checkInTime");
        p.delete("hours");
        }
        if (code === "HOUR") {
        p.delete("checkOutDate"); // giờ: không dùng checkout
        }
        if (code === "NIGHT") {
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

    const minPrice = Number(searchParams.get("minPrice") || 20000);
    const maxPrice = Number(searchParams.get("maxPrice") || 10000000);

    const handlePriceChange = (newValues) => {
    // newValues = [min, max]
    replaceParams((p) => {
        p.set("minPrice", String(newValues[0]));
        p.set("maxPrice", String(newValues[1]));
    });
    };




    useEffect(() => {
        const run = async () => {
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

        run();
    }, [payload]);



    return (
        <div className="max-w-7xl mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Sidebar lọc (1/3) */}
            <aside className="md:col-span-1 space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-md sticky top-24 self-start">
            <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Bộ lọc tìm kiếm</h2>

            {/* Ô nhập tên chi nhánh hoặc địa chỉ */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Tìm theo tên / địa chỉ</h3>
                <input
                type="text"
                value={keyword}
                onChange={(e) => setParam("location", e.target.value)}
                placeholder="Nhập tên chi nhánh hoặc địa chỉ..."
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Loại đặt phòng */}
            <div>
                <h3 className="font-semibold text-gray-700 mb-2">Loại đặt phòng</h3>
                <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => handleChangeType("HOUR")}
                    className={`px-4 py-2 rounded-md transition border ${
                    bookingTypeCode === "HOUR"
                        ? "bg-blue-600 text-white font-bold border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Theo giờ
                </button>

                <button
                    type="button"
                    onClick={() => handleChangeType("NIGHT")}
                    className={`px-4 py-2 rounded-md transition border ${
                    bookingTypeCode === "NIGHT"
                        ? "bg-blue-600 text-white font-bold border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Qua đêm
                </button>

                <button
                    type="button"
                    onClick={() => handleChangeType("DAY")}
                    className={`px-4 py-2 rounded-md transition border ${
                    bookingTypeCode === "DAY"
                        ? "bg-blue-600 text-white font-bold border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                    }`}
                >
                    Theo ngày
                </button>
                </div>
            </div>

            {/* Ngày giờ (tùy bookingType) */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Ngày giờ</h3>

                {/* HOUR: chọn ngày + giờ + số giờ, KHÔNG có checkout */}
                {bookingTypeCode === "HOUR" && (
                <>
                    <DatePicker
                    selected={fromYMD(checkInDate)}
                    onChange={handlePickCheckIn}
                    minDate={new Date()}
                    maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày nhận phòng"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    wrapperClassName="w-full"
                    />

                    <select
                    value={checkInTime}
                    onChange={(e) => setParam("checkInTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                    >
                    <option value="">Chọn giờ nhận phòng</option>
                    {[
                        "08:00","09:00","10:00","11:00","12:00",
                        "13:00","14:00","15:00","16:00","17:00",
                        "18:00","19:00","20:00","21:00","22:00",
                    ].map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                    </select>

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
                </>
                )}

                {/* NIGHT: chỉ chọn checkin, checkout auto +1 (không có input checkout) */}
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
                    wrapperClassName="w-full"
                    />

                    {/* hiển thị checkout tự tính */}
                    <div className="text-sm text-gray-600 bg-gray-50 border rounded-md px-3 py-2">
                    Trả phòng: <span className="font-semibold">{checkOutDate || "—"}</span> (12:00 hôm sau)
                    </div>
                </>
                )}

                {/* DAY: chọn range nhiều ngày bằng DailyBookingPicker */}
                {bookingTypeCode === "DAY" && (
                <DailyBookingPicker
                    checkInDate={checkInDate}
                    setCheckInDate={(v) => setParam("checkInDate", v)}
                    checkOutDate={checkOutDate}
                    setCheckOutDate={(v) => setParam("checkOutDate", v)}
                />
                )}
            </div>

            {/* Khoảng giá (giữ lại) */}
            <div>
                <PriceRangeSlider
                    values={[minPrice, maxPrice]}
                    onChange={handlePriceChange}
                />

            </div>
            </aside>







            {/* Kết quả tìm kiếm (2/3) */}
            <main className="md:col-span-2 space-y-6 bg-green-100 border border-green-300 p-4 rounded">
                {/* Tiêu đề + Dropdown */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="font-semibold text-green-700 text-xl">Kết quả tìm kiếm</h2>

                    <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-700 font-medium">
                        Sắp xếp:
                    </label>
                    <select
                        id="sort"
                        name="sort"
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                        <option value="relevance">Phù hợp nhất</option>
                        <option value="distance">Khoảng cách từ gần đến xa</option>
                        <option value="rating">Điểm đánh giá từ cao đến thấp</option>
                        <option value="priceLow">Giá từ thấp đến cao</option>
                        <option value="priceHigh">Giá từ cao đến thấp</option>
                    </select>
                    </div>
                </div>

                {/* Danh sách khách sạn */}
                {loading && <div>Đang tải...</div>}
                {error && <div className="text-red-600">Lỗi: {error}</div>}

                {!loading && !error && hotels.map((h) => (
                <HotelCard
                    key={h.branchId}
                    
                    image={
                        h.photoUrl
                            ? `${API_BASE_URL}${h.photoUrl.startsWith("/") ? "" : "/"}${h.photoUrl}`
                            : "https://via.placeholder.com/350x200"
                        }

                    name={h.branchName}
                    rating={4.5}
                    reviews={0}
                    address={h.address}
                    promo={h.roomTypeName ? `Loại phòng: ${h.roomTypeName}` : ""}
                    price={`${Number(h.minPrice || 0).toLocaleString("vi-VN")} ${h.currency || "VND"}`}
                    rooms={0}
                />
                ))}

            </main>


        </div>
    );
}
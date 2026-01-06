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

        // Nếu là dayjs/moment
        if (typeof d.format === "function") {
            return d.format("YYYY-MM-DD");
        }

        // Nếu là event từ input type="date"
        if (d.target && d.target.value) {
            return d.target.value; // đã là "YYYY-MM-DD"
        }

        // Nếu là string
        if (typeof d === "string") {
            return d.split("T")[0]; // cắt nếu có giờ
        }

        // Nếu là Date object
        if (d instanceof Date) {
            return d.toISOString().split("T")[0];
        }

        // fallback
        const date = new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    };

    // Helper function to format date as YYYY-MM-DD using local time
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
        const ymdEnd   = end ? toYMD(end) : "";

        replaceParams((p) => {
            if (!ymdStart) {
                p.delete("checkInDate");
                p.delete("checkOutDate");
                return;
            }

            // check-in = ngày start + 14:00
            const checkIn = `${ymdStart}T14:00:00`;
            p.set("checkInDate", checkIn);

            // Logic cho từng loại phòng
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

            // check-in = ngày start + 14:00
            const checkInObj = new Date(`${ymdStart}T14:00:00`);
            p.set("checkInDate", formatLocalDateTime(checkInObj));

            if (bookingTypeCode === "DAY") {
                if (ymdEnd) {
                    // Cộng thêm 1 ngày vào ngày checkOut để inclusive
                    const checkOutObj = new Date(`${ymdEnd}T12:00:00`);
                    checkOutObj.setDate(checkOutObj.getDate());  // Thêm 1 ngày vào checkOut
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

            // Reset các field không liên quan khi thay đổi loại phòng
            if (code !== "HOUR") {
                p.delete("checkInTime");
                p.delete("hours");
            }
            if (code === "HOUR") {
                p.delete("checkOutDate"); // "HOUR" không cần checkOutDate
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
        // Kiểm tra nếu là "HOUR" mà chưa chọn giờ hoặc chưa chọn số giờ, thì không cho phép cập nhật
        if (bookingTypeCode === "HOUR" && (!checkInTime || !hours)) {
            alert("Vui lòng chọn giờ nhận phòng và số giờ ở.");
            return;
        }

        // Nếu chọn phòng giờ (HOUR), tính checkIn và checkOut hợp lý trước khi gửi request
        let updatedCheckIn = checkInDate;
        let updatedCheckOut = checkOutDate;

        // Kiểm tra và xử lý `checkIn` và `checkOut` hợp lệ
        if (bookingTypeCode === "HOUR" && checkInDate && checkInTime && hours) {
            const onlyDate = checkInDate.split("T")[0]; // lấy phần ngày
            const checkInStr = `${onlyDate}T${checkInTime}:00`; // ví dụ "2026-01-02T11:00:00"
            const checkInObj = new Date(checkInStr);

            const checkOutObj = new Date(checkInObj.getTime() + Number(hours) * 60 * 60 * 1000);
            const checkOutStr = formatLocalDateTime(checkOutObj); // luôn ra "YYYY-MM-DDTHH:mm:ss"

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
                // Get the date part only (YYYY-MM-DD)
                const onlyDateIn = checkInDate.split("T")[0];
                
                // Explicitly set the time to 14:00:00 for checkIn
                const checkInObj = new Date(`${onlyDateIn}T14:00:00`);  // 14:00:00 local time for check-in
                updatedCheckIn = formatLocalDateTime(checkInObj);

                if (checkOutDate) {
                    // For checkOut, set the time to 12:00:00
                    const onlyDateOut = checkOutDate.split("T")[0];
                    const checkOutObj = new Date(`${onlyDateOut}T12:00:00`);  // 12:00:00 local time for check-out
                    updatedCheckOut = formatLocalDateTime(checkOutObj);
                } else {
                    updatedCheckOut = "";
                }

                console.log("checkInDate", updatedCheckIn);
                console.log("checkOutDate", updatedCheckOut);

                console.log("checkInObj", checkInObj);


            }
        }




        // Cập nhật URL
        const params = new URLSearchParams(searchParams);
        params.set("bookingTypeCode", bookingTypeCode);
        params.set("location", keyword);
        params.set("checkInDate", updatedCheckIn);
        params.set("checkOutDate", updatedCheckOut);
        params.set("minPrice", minPrice);
        params.set("maxPrice", maxPrice);

        // Thêm checkInTime và hours vào URL nếu có
        if (checkInTime) params.set("checkInTime", checkInTime);
        if (hours) params.set("hours", String(Number(hours))); 

        setSearchParams(params, { replace: true });

        fetchHotels({
            bookingTypeCode,
            location: keyword,
            checkIn: updatedCheckIn,
            checkOut: updatedCheckOut,
            checkInTime, // Thêm checkInTime vào payload
            hours: Number(hours), // ép về số nguyên

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

        // Gọi API khi trang vừa load (mỗi khi component được mount)
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        const checkIn = params.get("checkInDate");
        const checkOut = params.get("checkOutDate");

        // Nếu checkIn bị lỗi (chứa 2 lần T14:00:00), sửa lại
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


    return (
        <div className="max-w-7xl mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <aside className="md:col-span-1 space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-md sticky top-24 self-start">
                <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Bộ lọc tìm kiếm</h2>
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

                {/* Other Filters */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Loại đặt phòng</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => handleChangeType("HOUR")}
                            className={`px-4 py-2 rounded-md transition border ${
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
                            className={`px-4 py-2 rounded-md transition border ${
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
                            className={`px-4 py-2 rounded-md transition border ${
                                bookingTypeCode === "DAY"
                                    ? "bg-orange-600 text-white font-bold border-orange-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                            }`}
                        >
                            Theo ngày
                        </button>
                    </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Ngày giờ</h3>

                    {bookingTypeCode === "HOUR" && (
                        <>
<DatePicker
    selected={checkInDate ? new Date(checkInDate) : new Date()} // Ensure using local time for initial date
    onChange={(date) => {
        setParam("checkInDate", toYMDLocal(date)); // Ensure local date format (YYYY-MM-DD)
        handlePickCheckIn(date, checkOutDate ? new Date(checkOutDate) : null);
    }}
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
                                    "13:00", "14:00", "15:00", "16:00", "17:00",
                                    "18:00", "19:00", "20:00"
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
                                {[1, 2, 3, 4, 5, 6].map((h) => (
                                    <option key={h} value={String(h)}>{h} giờ</option>
                                ))}
                            </select>
                        </>
                    )}

                    {bookingTypeCode === "NIGHT" && (
                    <>
                        <DatePicker
                            selected={checkInDate ? new Date(checkInDate) : new Date()} // Use current date if not selected
                            onChange={handlePickCheckIn}
                            minDate={new Date()}
                            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày nhận phòng"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                            wrapperClassName="w-full"
                        />

                        <div className="text-sm text-gray-600 bg-gray-50 border rounded-md px-3 py-2">
                        Trả phòng:{" "}
                        <span className="font-semibold">
                            {checkOutDate ? checkOutDate.split("T")[0] : "—"}
                        </span>{" "}
                        (12:00 hôm sau)
                        </div>
                    </>
                    )}


                    {bookingTypeCode === "DAY" && (
                        <div className="w-full flex gap-4">
                            {/* Ngày nhận phòng */}
                            <DatePicker
                            
                            selected={checkInDate ? new Date(checkInDate) : new Date()} // Use current date if not selected

                            onChange={(date) => {
                                setParam("checkInDate", toYMDLocal(date)); // Ensure local date format
                                handlePickCheckIn(date, checkOutDate ? new Date(checkOutDate) : null);
                            }}

                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Ngày nhận phòng"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                            wrapperClassName="w-full"
                            />

                            {/* Ngày trả phòng */}
                            <DatePicker
                            selected={checkOutDate ? new Date(checkOutDate.split("T")[0]) : null}
                            onChange={(date) => {
                                const ymd = date ? date.toISOString().split("T")[0] : "";
                                setParam("checkOutDate", ymd);
                                handlePickCheckIn(checkInDate ? new Date(checkInDate.split("T")[0]) : null, date);
                            }}
                            minDate={
                                checkInDate
                                ? new Date(new Date(checkInDate.split("T")[0]).getTime() + 24 * 60 * 60 * 1000)
                                : new Date()
                            }
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Ngày trả phòng"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                            wrapperClassName="w-full"
                            />
                        </div>
                    )}



                </div>

                <div>
                    <PriceRangeSlider
                        values={[minPrice, maxPrice]}
                        onChange={handlePriceChange}
                    />
                </div>

                {/* Cập nhật */}
                <div className="mt-6 text-center">
                    <button
                        onClick={handleUpdateSearch}
                        className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Cập nhật
                    </button>
                </div>
            </aside>

            {/* Main search results */}
            <main className="md:col-span-2 space-y-6 bg-white border border-gray-200 p-4 rounded shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="font-semibold text-xl">Kết quả tìm kiếm</h2>

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

                {loading && <div>Đang tải...</div>}
                {error && <div className="text-red-600">Lỗi: {error}</div>}

                {!loading && !error && hotels.map((h) => (
                    <HotelCard
                        key={h.branchId}
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
                ))}
            </main>
        </div>
    );
}

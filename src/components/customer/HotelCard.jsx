import { useNavigate, useLocation } from "react-router-dom";

export default function HotelCard({
    image,
    name,
    rating,
    reviews,
    address,
    promo,
    price,
    rooms,
    hotelId,
    bookingTypeCode, // Thêm prop này
    checkInDate,     // Thêm prop này
    checkOutDate     // Thêm prop này
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        const queryParams = new URLSearchParams(location.search);
        queryParams.set("hotelId", hotelId);
        navigate(`/detail?${queryParams.toString()}`);
    };

    // Label hiển thị loại giá
    const getPriceLabel = () => {
        if (bookingTypeCode === "HOUR") return "Giá theo giờ";
        if (bookingTypeCode === "NIGHT") return "Giá qua đêm";
        return "Giá theo ngày";
    };

    return (
        <div
            className="flex flex-col md:flex-row bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer mb-4"
            onClick={handleClick}
        >
            {/* Hình ảnh - Responsive: Full width trên mobile, Fixed width trên desktop */}
            <div className="w-full md:w-[280px] h-[200px] md:h-auto relative p-2 md:p-3">
                <img
                    src={image}
                    alt={name}
                    className="object-cover w-full h-full rounded-lg md:rounded-xl"
                />
                {rooms > 0 && rooms < 5 && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                        Còn {rooms} phòng cuối
                    </div>
                )}
            </div>

            {/* Nội dung */}
            <div className="flex flex-col justify-between flex-1 p-4 md:px-6 md:py-5">
                <div className="space-y-2">
                    {/* Tên & Rating hàng đầu */}
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 md:line-clamp-2">
                            {name}
                        </h3>
                        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                            <span className="text-orange-600 font-bold text-sm">{rating}</span>
                            <img
                                src="https://go2joy.vn/_nuxt/reviewed_star.95b7b0f3.svg"
                                alt="star"
                                className="w-3 h-3"
                            />
                        </div>
                    </div>

                    {/* Địa chỉ */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <img
                            src="https://go2joy.vn/_nuxt/location-icon.26689bb5.svg"
                            alt="location"
                            className="w-3.5 h-3.5"
                        />
                        <span className="line-clamp-1">{address}</span>
                    </div>

                    {/* Badge thông tin từ SearchPage */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {promo && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[12px] font-medium rounded">
                                {promo}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[12px] font-medium rounded">
                            {bookingTypeCode === "HOUR" ? "⏰ Theo giờ" : "📅 Theo ngày/đêm"}
                        </span>
                    </div>
                </div>

                {/* Giá cả - Responsive: Đẩy sang phải trên desktop, trải dài trên mobile */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-row md:flex-col justify-between items-end md:items-end md:justify-end">
                    <div className="text-left md:text-right">
                        <p className="text-[12px] text-gray-400 uppercase font-medium">
                            {getPriceLabel()}
                        </p>
                        <p className="font-black text-xl text-orange-600">
                            {price}
                        </p>
                    </div>
                    <button className="md:mt-2 px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors">
                        Đặt ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
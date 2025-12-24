import HotelCard from "../../components/customer/HotelCard";

import PriceRangeSlider from "../../components/customer/PriceRangeSlider";



export default function SearchPage() {
    // Mảng dữ liệu khách sạn (ví dụ 15 phần tử)
    const hotels = [
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/3307_1611588901632/cb116eb2e555d6da8021bc5db51b726e.jpg",
        name: "Hoàng Thủy Sinh Hotel",
        rating: 4.7,
        reviews: 23,
        address: "73 Điện Biên Phủ, Chính Gián, Thanh Khê, Đà Nẵng",
        promo: "Giảm 10K",
        price: "150.000đ",
        rooms: 5,
        },
        {
        image: "https://s3.go2joy.vn/350w/hotel/1234_1611588901632/example.jpg",
        name: "Pink Garden 1",
        rating: 5.0,
        reviews: 121,
        address: "39 Tạ Mỹ Duật, Sơn Trà, Đà Nẵng",
        promo: "Giảm 25%",
        price: "169.000đ",
        rooms: 2,
        },
        // 👉 thêm tiếp 13 khách sạn nữa vào đây
    ];

    return (
        <div className="max-w-7xl mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Sidebar lọc (1/3) */}
            <aside className="md:col-span-1 space-y-6 bg-white border border-gray-200 p-6 rounded-lg shadow-md sticky top-24 self-start">
                <h2 className="font-semibold text-lg text-gray-800 border-b pb-2">Bộ lọc tìm kiếm</h2>

                {/* Div 1: Các phần chọn loại đặt phòng, ngày giờ, vị trí */}
                <div className="space-y-6">
                    {/* Chọn loại đặt phòng */}
                    <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Loại đặt phòng</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Theo giờ
                        </button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Qua đêm
                        </button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Theo ngày
                        </button>
                    </div>
                    </div>

                    {/* Ngày giờ */}
                    <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Ngày giờ</h3>
                    <div className="flex flex-col gap-3">
                        <input type="date" className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400" />
                        <input type="date" className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-400" />
                    </div>
                    </div>

                    {/* Vị trí */}
                    <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Vị trí</h3>
                    <select className="px-3 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-400">
                        <option value="">Chọn vị trí</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                    </select>
                    </div>
                </div>

                {/* Div 2: Các bộ lọc khác */}
                <div className="space-y-6">
                    {/* Khoảng giá */}
                    <div>
                        <PriceRangeSlider />
                    </div>

                    {/* Điểm đánh giá */}
                    <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Điểm đánh giá</h3>
                    <div className="flex flex-wrap gap-3">
                        <label className="cursor-pointer">
                        <input type="radio" name="rating" value="4.5" className="hidden peer" />
                        <span className="px-3 py-1 border rounded-full peer-checked:bg-blue-500 peer-checked:text-white">
                            ≥ 4.5
                        </span>
                        </label>
                        <label className="cursor-pointer">
                        <input type="radio" name="rating" value="4.0" className="hidden peer" />
                        <span className="px-3 py-1 border rounded-full peer-checked:bg-blue-500 peer-checked:text-white">
                            ≥ 4.0
                        </span>
                        </label>
                        <label className="cursor-pointer">
                        <input type="radio" name="rating" value="3.5" className="hidden peer" />
                        <span className="px-3 py-1 border rounded-full peer-checked:bg-blue-500 peer-checked:text-white">
                            ≥ 3.5
                        </span>
                        </label>
                    </div>
                    </div>

                    {/* Tiện ích */}
                    <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Tiện ích</h3>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-blue-500" />
                        <span>Wi-Fi miễn phí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-blue-500" />
                        <span>Ghế tình yêu</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-blue-500" />
                        <span>Lễ tân 24/24</span>
                        </label>
                    </div>
                    </div>
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
                {hotels.map((hotel, index) => (
                    <HotelCard
                    key={index}
                    image={hotel.image}
                    name={hotel.name}
                    rating={hotel.rating}
                    reviews={hotel.reviews}
                    address={hotel.address}
                    promo={hotel.promo}
                    price={hotel.price}
                    rooms={hotel.rooms}
                    />
                ))}
            </main>


        </div>
    );
}
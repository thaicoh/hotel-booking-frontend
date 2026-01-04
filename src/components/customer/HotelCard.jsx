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
  hotelId // Add hotelId as a prop
}) {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const location = useLocation(); // Initialize useLocation hook to get the current URL parameters

  const handleClick = () => {
    // Get the current query parameters from the location object
    const queryParams = new URLSearchParams(location.search);

    // Add the hotelId to the query parameters
    queryParams.set("hotelId", hotelId);

    // Navigate to the HotelDetail page, passing all query parameters
    navigate(`/detail?${queryParams.toString()}`);
  };

  return (
    <div
      className="flex flex-col h-[240px] md:flex-row bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer mb-6"
      onClick={handleClick}


    >
      {/* Hình ảnh */}
      <div className="md:w-[238px] w-full h-[240px] relative p-3">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full rounded-xl"
        />
      </div>

      {/* Nội dung */}
        <div className="flex flex-col justify-between flex-1 px-6 py-4">
        {/* Thông tin chính */}
        <div className="space-y-3">
          {/* Tên khách sạn */}
          <p className="font-bold text-lg line-clamp-1">{name}</p>

          {/* Đánh giá */}
          <div className="flex items-center gap-2 text-sm">
            <img
              src="https://go2joy.vn/_nuxt/reviewed_star.95b7b0f3.svg"
              alt="star"
              className="w-4 h-4"
            />
            <p className="font-medium">
              {rating} <span className="text-gray-600">Tuyệt vời</span>
            </p>
            <span className="text-gray-400">({reviews})</span>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <img
              src="https://go2joy.vn/_nuxt/location-icon.26689bb5.svg"
              alt="location"
              className="w-4 h-4"
            />
            <span className="line-clamp-1">{address}</span>
          </div>

          {/* Khuyến mãi */}
          {promo && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded">
              <img
                src="https://go2joy.vn/_nuxt/promotion-active-icon.c7396b7d.svg"
                alt="promo"
                className="w-4 h-4"
              />
              {promo}
            </span>
          )}
        </div>

        {/* Giá và số phòng */}
        <div className="text-right space-y-1">
          <p className="text-sm text-gray-500">Giá cho 1 giờ</p>
          <p className="font-bold text-lg">Chỉ từ {price}</p>
          <p className="text-blue-600 font-semibold text-sm">
            Chỉ còn {rooms} phòng
          </p>
        </div>
      </div>
    </div>
  );
}

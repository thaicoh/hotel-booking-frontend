import { useEffect, useState } from "react";
import { getBookings, getBranches, getRoomTypes } from "../../api/bookings";  // You will need to create these API methods

const ManageBookings = () => {

  // ✅ Default values 
  const DEFAULT_FILTERS = {
    branchId: "",
    roomTypeId: "",
    bookingType: "",
    bookingStatus: "",
    paymentStatus: "",
    checkInDate: "",
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);


  // Update the filter logic inside the useEffect to include search
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prepare the search filters
        const searchParams = {
          ...filters,
          searchQuery, // Add the search query to the filters
        };

        const branchRes = await getBranches();
        const roomTypeRes = await getRoomTypes();
        setBranches(branchRes.data.result);
        setRoomTypes(roomTypeRes.data.result);

        // Fetch bookings with the updated filters
        const bookingsRes = await getBookings(searchParams);
        setBookings(bookingsRes.data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters, searchQuery]); // Include searchQuery in the dependency array

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle the search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAction = (action, bookingId) => {
    // Handle actions like view, edit, cancel, mark paid
    alert(`Action ${action} on booking with ID: ${bookingId}`);
  };

  // ✅ Reset button handler
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
    alert("Đã reset bộ lọc về mặc định");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Manage Bookings</h1>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Filters</h3>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Reset
          </button>
        </div>

        {/* Grid filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tên KH / Booking ID / Booking Reference"
              className="w-full h-11 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Branch</label>
            <select
              name="branchId"
              value={filters.branchId}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Room Type</label>
            <select
              name="roomTypeId"
              value={filters.roomTypeId}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Room Types</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.typeName}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Booking Type</label>
            <select
              name="bookingType"
              value={filters.bookingType}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Booking Types</option>
              <option value="DAY">Day</option>
              <option value="NIGHT">Night</option>
              <option value="HOUR">Hour</option>
            </select>
          </div>

          {/* Booking Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Booking Status</label>
            <select
              name="bookingStatus"
              value={filters.bookingStatus}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Status</label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Check-in Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Check-in Date</label>
            <input
              type="date"
              name="checkInDate"
              value={filters.checkInDate}
              onChange={handleFilterChange}
              className="w-full h-11 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>


      {/* Bookings Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {isLoading ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-[1200px] w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-700">
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Booking Ref</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Branch</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Room Type</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Booking Type</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Check-in / Check-out</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Payment</th>
                  <th className="px-4 py-3 border-b text-left whitespace-nowrap">Created</th>
                  <th className="px-4 py-3 border-b text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {bookings.map((booking) => (
                  <tr key={booking.bookingReference} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b whitespace-nowrap">
                      {booking.bookingReference}
                    </td>

                    <td className="px-4 py-3 border-b">
                      <div className="font-medium text-gray-900">{booking.user?.fullName || "-"}</div>
                      <div className="text-gray-500">{booking.user?.phone || "-"}</div>
                    </td>

                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.branch?.branchName || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.roomType?.typeName || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.bookingType || "-"}</td>

                    <td className="px-4 py-3 border-b whitespace-nowrap">
                      {booking.checkInDate || "-"} / {booking.checkOutDate || "-"}
                    </td>

                    <td className="px-4 py-3 border-b whitespace-nowrap">
                      {booking.totalPrice} {booking.currency || "VND"}
                    </td>

                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.status || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.paymentStatus || "-"}</td>
                    <td className="px-4 py-3 border-b whitespace-nowrap">{booking.createdAt || "-"}</td>

                    <td className="px-4 py-3 border-b">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button
                          onClick={() => handleAction("View", booking.bookingReference)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAction("Edit", booking.bookingReference)}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAction("Cancel", booking.bookingReference)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAction("Mark Paid", booking.bookingReference)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={11}>
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageBookings;

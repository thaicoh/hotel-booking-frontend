import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getRoomTypeDetails, updateBasicInfo  } from "../../api/roomtypes"; // Import hàm từ roomtypes.js
import { getRoomPhotosByRoomTypeId } from "../../api/roomPhotos"; // Import hàm gọi ảnh phòng
import { getRoomsByRoomTypeId } from "../../api/rooms"; // Import hàm gọi danh sách phòng
import { getBranches } from "../../api/branches"; // API lấy danh sách chi nhánh
import { API_BASE_URL } from "../../config/api";

export default function RoomTypeDetail() {
  const [roomType, setRoomType] = useState(null);
  const [roomPhotos, setRoomPhotos] = useState([]); // State lưu ảnh phòng
  const [rooms, setRooms] = useState([]); // State lưu danh sách phòng
  const [branches, setBranches] = useState([]); // State lưu danh sách chi nhánh
  const [selectedBranch, setSelectedBranch] = useState(""); // State lưu chi nhánh đã chọn
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("view");
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL
  const location = useLocation();
  const [isEditingMainPhoto, setIsEditingMainPhoto] = useState(false);
  const [selectedFileURL, setSelectedFileURL] = useState(""); // Store the selected file



  // Fetch RoomType data from API
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await getRoomTypeDetails(id); // Gọi API lấy chi tiết phòng
        setRoomType(response.data.result);
        setMode(location.search.includes("mode=edit") ? "edit" : "view");

        // Fetch room photos
        const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
        setRoomPhotos(roomPhotosResponse.data.result); // Set ảnh phòng vào state

        // Fetch rooms by roomTypeId
        const roomsResponse = await getRoomsByRoomTypeId(id);
        setRooms(roomsResponse.data.result); // Set danh sách phòng vào state

        // Fetch branches for dropdown
        const branchesResponse = await getBranches();
        setBranches(branchesResponse.data.result);
        setSelectedBranch(response.data.result.branch.id); // Set chi nhánh mặc định là chi nhánh của phòng
      } catch (error) {
        console.error("Error fetching room type details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, location.search]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Handle Save (chỉ cập nhật Room Type, Capacity, Description)
  const handleSaveBasicInfo = async () => {
    const updatedInfo = {
      typeName: roomType.typeName,
      capacity: roomType.capacity,
      description: roomType.description,
    };

    try {
      await updateBasicInfo(id, updatedInfo);  // Chỉ gọi updateBasicInfo với RoomType, Capacity, Description
      setMode("view"); // Chuyển sang chế độ xem sau khi lưu
    } catch (error) {
      console.error("Error saving basic info", error);
    }
  };

  // Handle Save (chỉ cập nhật Room Type, Capacity, Description)
  const handleSave = async () => {
    const updatedInfo = {
      typeName: roomType.typeName,
      capacity: roomType.capacity,
      description: roomType.description,
    };

    try {
      await updateBasicInfo(id, updatedInfo);  // Chỉ gọi updateBasicInfo với RoomType, Capacity, Description
      setMode("view"); // Chuyển sang chế độ xem sau khi lưu
    } catch (error) {
      console.error("Error saving basic info", error);
    }
  };

  // Handle Remove Main Photo (sẽ ẩn ảnh chính và hiển thị input file)
  const handleRemoveMainPhoto = () => {
    setIsEditingMainPhoto(true); // Khi bấm "X", bật chế độ chỉnh sửa ảnh chính
  };

// Handle File Change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời cho ảnh đã chọn
      const fileURL = URL.createObjectURL(file);
      
      setSelectedFileURL(fileURL)

      // Ẩn ô chọn file
      setIsEditingMainPhoto(false);

      // Gửi ảnh lên server nếu cần (có thể sử dụng một hàm upload file ở đây)
      // Gửi ảnh lên API để lưu (nếu cần)
      console.log("File selected:", file);
    }
  };

 

  // Handle Cancel  
  const handleCancel = () => {
    setMode("view");
    setSelectedFileURL("")
    // Optionally reload the room type data
    // fetchRoomDetails(); // Uncomment nếu muốn reload lại dữ liệu từ API
  };

  // Handle Delete
  const handleDelete = () => {
    console.log("Deleting Room Type:", roomType.id);
    // Thực hiện logic để xóa loại phòng, ví dụ gọi API DELETE
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          {mode === "edit" ? "Edit Room Type" : "Room Type Details"}
        </h1>
      </div>

      {/* Thông Tin Cơ Bản */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thông Tin Cơ Bản</h3>

        {/* Row 1: Room Type, Capacity, Select Branch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Room Type Info */}
          <div>
            <label className="block font-medium text-gray-600 mb-2">Room Type</label>
            <input
              type="text"
              value={roomType.typeName}
              onChange={(e) => setRoomType({ ...roomType, typeName: e.target.value })}
              className="border p-3 w-full rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={mode === "view"} // Không cho phép chỉnh sửa khi ở chế độ "view"
            />
          </div>

          {/* Capacity Info */}
          <div>
            <label className="block font-medium text-gray-600 mb-2">Capacity</label>
            <input
              type="number"
              value={roomType.capacity}
              onChange={(e) => setRoomType({ ...roomType, capacity: e.target.value })}
              className="border p-3 w-full rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={mode === "view"} // Không cho phép chỉnh sửa khi ở chế độ "view"
            />
          </div>

          {/* Select Branch */}
          <div>
            <label className="block font-medium text-gray-600 mb-2">Select Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border p-3 w-full rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={mode !== "add"}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description Info */}
        <div className="mb-6">
          <label className="block font-medium text-gray-600 mb-2">Description</label>
          <textarea
            value={roomType.description}
            onChange={(e) => setRoomType({ ...roomType, description: e.target.value })}
            className="border p-3 w-full rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            readOnly={mode === "view"} // Không cho phép chỉnh sửa khi ở chế độ "view"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {mode === "edit_info" ? (
<>
              <button
                onClick={handleSaveBasicInfo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500"
              >
                Cancel
              </button>
            </>

          ) : (

            <button
              onClick={() => setMode("edit_info")}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
            >
              Edit
            </button>
            
          )}
        </div>


      </div>

      {/* Room Image */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <label className="block font-medium text-gray-600 mb-2">Room Photos</label>

        {/* Room Photo for Main */}
        {roomPhotos
          .filter(photo => photo.isMain) // Lọc ảnh chính ra
          .map((photo) => (
            <div key={photo.id} className="relative w-1/3 mx-auto h-60 mb-4 border-4 border-yellow-500 rounded-lg">
              {/* Hiển thị 'X' để xóa ảnh chính khi ở chế độ chỉnh sửa */}
              {mode === "edit_img" && (
                <button
                  onClick={handleRemoveMainPhoto}
                  className="absolute top-2 right-2 text-white bg-red-500 p-2 rounded-full hover:bg-red-600"
                >
                  X
                </button>
              )}

              {/* Hiển thị ô chọn file nếu đang ở chế độ chỉnh sửa ảnh */}
              {mode === "edit_img" && isEditingMainPhoto ? (
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <img
                  src={(selectedFileURL !== "")?selectedFileURL:`${API_BASE_URL}/${photo.photoUrl}`} // Hiển thị ảnh chính đã được cập nhật
                  alt="Main Room"
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
          ))}


        {/* Room Photos for others */}
        <div className="flex justify-start space-x-4">
          {roomPhotos
            .filter(photo => !photo.isMain) // Lọc các ảnh còn lại
            .map((photo) => (
              <div key={photo.id} className="w-40 h-32">
                <img
                  src={`${API_BASE_URL}/${photo.photoUrl}`}
                  alt="Room"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {mode === "edit_img" ? (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setMode("edit_img")}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>



      {/* Rooms List */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <label className="block font-medium text-gray-600 mb-2">Rooms List</label>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.roomId} className="p-4 border-b">
              <p className="text-lg font-semibold">Room {room.roomNumber}</p>
              <p className="text-gray-600">{room.description}</p>
              <p className={`text-sm ${room.status === "Available" ? "text-green-600" : "text-red-600"}`}>
                {room.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        {mode === "edit" ? (
          <>
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
              Save
            </button>
            <button onClick={handleCancel} className="px-6 py-3 bg-gray-400 text-white rounded-lg shadow-md hover:bg-gray-500">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate(`/admin/room-types/${roomType.id}?mode=edit`)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
            >
              Delete
            </button>
          </>
        )}
        <button
          onClick={() => navigate("/admin/roomtypes")}
          className="px-6 py-3 bg-gray-300 text-black rounded-lg shadow-md hover:bg-gray-400"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}

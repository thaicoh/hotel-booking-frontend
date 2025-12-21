import { useState, useEffect } from "react";

export default function RoomModal({
  room,
  roomType,
  onClose,
  onSave
}) {
  // Nếu room không có số phòng → đang thêm phòng mới → bật edit mode
  const isNewRoom = !room?.roomNumber;

  const [isEditing, setIsEditing] = useState(isNewRoom);
  const [errorMessage, setErrorMessage] = useState("");

  const canEditStatusOnly = isEditing; // chỉ cho phép sửa các trường khác ngoài roomName, roomType, branch

  const [formData, setFormData] = useState({
    roomNumber: "",
    description: "",
    branchName: "",
    roomTypeId: "",
    roomTypeName: "",
  });

  // Load dữ liệu phòng vào form
  useEffect(() => {
    if (room) {
    setFormData({
      roomNumber: room.roomNumber?.toString() || "",
      description: room.description || "",
      branchName: roomType.branch.branchName || "",
      roomTypeId: roomType.id || "",
      roomTypeName: roomType.typeName || "",
    });

    console.log(formData)

      // Nếu là phòng mới → cho nhập tất cả
      if (isNewRoom) {
        setIsEditing(true);
      }
      // Nếu là phòng cũ → chỉ bật edit khi bấm nút Edit
      else {
        setIsEditing(room.__forceEditStatus === true);
      }

      setErrorMessage("");
    }
  }, [room]);

  useEffect(() => {
    console.log("formData changed:", formData);
    console.log(room)
  }, [formData]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData)

  };

  // Kiểm tra hợp lệ
  const isValid =
    formData.roomNumber.trim() !== "" && formData.description.trim() !== "";

  const handleSaveClick = async () => {
    if (!isValid) return;

    const result = await onSave(formData, room);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    setErrorMessage("");
    setIsEditing(false);
  };

  if (!room) return null;

  return (

    

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[600px] max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {isNewRoom ? "Thêm phòng mới" : "Thông tin phòng"}
        </h2>

        <div className="space-y-4">
          {errorMessage && (
            <div className="text-red-600 font-semibold">{errorMessage}</div>
          )}

          {/* Room Number */}
          <div>
            <label className="block font-semibold mb-1">Room Number</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              disabled={!isEditing}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditing}   // ⭐ chỉ mở khi bấm Chỉnh sửa
              className="border p-2 rounded w-full"
              rows="3"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block font-semibold mb-1">Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branchName}
              onChange={handleChange}
              disabled={!isNewRoom && "branch" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block font-semibold mb-1">Room Type</label>
            <input
              type="text"
              name="roomType"
              value={formData.roomTypeName}
              onChange={handleChange}
              disabled={!isNewRoom && "roomType" !== "status"}   // ⭐
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {!isEditing ? (
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded text-white ${isValid ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
                onClick={handleSaveClick}
                disabled={!isValid}
              >
                Lưu
              </button>
            )}

            <button
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

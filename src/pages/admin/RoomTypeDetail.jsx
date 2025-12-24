import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getRoomTypeDetails, updateBasicInfo  } from "../../api/roomtypes"; // Import hàm từ roomtypes.js
import RoomModal from "../../components/admin/RoomModal";

import {
  getPricesByRoomTypeId,
  createRoomTypeBookingTypePrice,
  updateRoomTypeBookingTypePrice,
  deleteRoomTypeBookingTypePrice,
} from "../../api/roomTypeBookingTypePrices";


import {
  getRoomPhotosByRoomTypeId,
  deleteRoomPhoto,
  uploadMainRoomPhoto,
  updateMainRoomPhoto,
  updateRoomPhoto ,
  uploadSubRoomPhoto,

} from "../../api/roomPhotos";



import { getRoomsByRoomTypeId,createRoom, updateRoom } from "../../api/rooms"; // Import hàm gọi danh sách phòng
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
  const [extraFiles, setExtraFiles] = useState([]); // optional: lưu preview ảnh phụ mới chọn
  const [editingOtherId, setEditingOtherId] = useState(null); // id ảnh phụ đang đổi
  const [otherPreviewMap, setOtherPreviewMap] = useState({}); // { [id]: blobUrl 


  const [selectedRoom, setSelectedRoom] = useState(null);

  const [editingRowData, setEditingRowData] = useState(null);


  const mainFileInputRef = useRef(null);
  // Thêm ref vào từng ảnh phụ
  const otherFileInputRefs = useRef({}); // Lưu ref cho từng ảnh phụ

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");




  const BOOKING_TYPES = [
    { key: "DAY", label: "Ngày", bookingTypeId: 1 },
    { key: "NIGHT", label: "Đêm", bookingTypeId: 3 },
    { key: "HOUR", label: "Giờ", bookingTypeId: 2 },
  ];

  const [priceRows, setPriceRows] = useState(
    BOOKING_TYPES.map((t) => ({
      bookingType: t.key,
      price: "",
      weekendSurcharge: "",
      additionalHourPrice: "",
    }))
  );

  const [editingKey, setEditingKey] = useState(null);


  // Hàm load lại giá từ API
  const loadPrices = async () => {
    try {
      const pricesRes = await getPricesByRoomTypeId(id);
      const priceList = pricesRes?.data?.result || [];

      setPriceRows(
        BOOKING_TYPES.map((t) => {
          const found = priceList.find((x) => x.bookingTypeId === t.bookingTypeId);
          return {
            bookingType: t.key,
            id: found?.id ?? null,
            bookingTypeId: t.bookingTypeId,
            price: found?.price ?? "",
            weekendSurcharge: found?.weekendSurcharge ?? "",
            additionalHourPrice: found?.additionalHourPrice ?? "",
          };
        })
      );
    } catch (err) {
      console.error("Error loading prices", err);
    }
  };


  // Fetch RoomType data from API
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await getRoomTypeDetails(id);
        setRoomType(response.data.result);
        setMode(location.search.includes("mode=edit") ? "edit" : "view");

        const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
        setRoomPhotos(roomPhotosResponse.data.result);

        const roomsResponse = await getRoomsByRoomTypeId(id);
        setRooms(roomsResponse.data.result);

        // ✅ gọi loadPrices thay vì viết lại logic
        await loadPrices();

        const branchesResponse = await getBranches();
        setBranches(branchesResponse.data.result);
        setSelectedBranch(response.data.result.branch.id);
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



  const loadRooms = async () => {
    try {
      const roomsResponse = await getRoomsByRoomTypeId(id);
      setRooms(roomsResponse.data.result || []);
    } catch (error) {
      console.error("Error loading rooms", error);
    }
  };

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


  const handleMainFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasMainPhoto = roomPhotos.some((p) => p.isMain);

    // ✅ Nếu chưa có ảnh chính -> upload luôn
    if (!hasMainPhoto) {
      try {
        await uploadMainRoomPhoto(id, file);

        const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
        setRoomPhotos(roomPhotosResponse.data.result || []);

        setSelectedFileURL("");
        setIsEditingMainPhoto(false);
      } catch (err) {
        console.error("Upload main photo failed:", err);
        alert("Upload ảnh chính thất bại. Vui lòng thử lại.");
      } finally {
        e.target.value = "";
      }
      return;
    }

    // ✅ Nếu đã có ảnh chính -> preview (tạm thời)
    const fileURL = URL.createObjectURL(file);
    setSelectedFileURL(fileURL);
    setIsEditingMainPhoto(false);

    e.target.value = "";
  };

  const handleMainUpdateFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await updateMainRoomPhoto(id, file);

      const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(roomPhotosResponse.data.result || []);

      setSelectedFileURL(""); // không cần preview nữa vì đã upload
    } catch (err) {
      console.error("Update main photo failed:", err);
      alert("Đổi ảnh chính thất bại. Vui lòng thử lại.");
    } finally {
      e.target.value = "";
    }
  };

  // Khi chọn file cho ảnh phụ
  const handleOtherFileChange = async (photoId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);

    // Nếu là ảnh local (preview), chỉ cần thay đổi file preview
    if (String(photoId).startsWith("local-")) {
      setOtherPreviewMap((prev) => ({
        ...prev,
        [photoId]: fileURL,
      }));

      setEditingOtherId(null);
      e.target.value = "";
      return;
    }

    // Nếu là ảnh trên server -> gọi API để cập nhật ảnh
    try {
      await updateRoomPhoto(photoId, file);
      const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(roomPhotosResponse.data.result || []);

      // Xóa preview cũ nếu có
      if (otherPreviewMap[photoId]) {
        URL.revokeObjectURL(otherPreviewMap[photoId]);
        setOtherPreviewMap((prev) => {
          const next = { ...prev };
          delete next[photoId];
          return next;
        });
      }

      setEditingOtherId(null);
    } catch (err) {
      console.error("Update other photo failed:", err);
      alert("Đổi ảnh thất bại. Vui lòng thử lại.");
    } finally {
      e.target.value = "";
    }
  };


  // Handle Cancel  
  const handleCancel = () => {
    setMode("view");
    setSelectedFileURL("")
    // Optionally reload the room type data
    // fetchRoomDetails(); // Uncomment nếu muốn reload lại dữ liệu từ API
  };

  const handleRemoveOtherPhoto = async (photo) => {
    const ok = window.confirm("Bạn có chắc muốn xóa ảnh không?");
    if (!ok) return;

    // Xóa ảnh local (preview)
    if (String(photo.id).startsWith("local-")) {
      setExtraFiles((prev) => prev.filter((x) => `local-${x.url}` !== photo.id));
      return;
    }

    // Xóa ảnh server (gọi API)
    try {
      await deleteRoomPhoto(photo.id);
      setRoomPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      console.error("Delete other photo failed:", err);
      alert("Xóa ảnh thất bại. Vui lòng thử lại.");
    }
  };


  const handleAddOtherPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    try {
      // Gọi API để upload ảnh phụ
      await uploadSubRoomPhoto(id, file);

      // Sau khi upload thành công, reload lại danh sách ảnh (nếu cần)
      const roomPhotosResponse = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(roomPhotosResponse.data.result || []);

    } catch (err) {
      console.error("Upload other photo failed:", err);
      alert("Thêm ảnh phụ thất bại. Vui lòng thử lại.");
    }

    // reset input để chọn lại cùng file vẫn trigger
    e.target.value = "";
  };

  const handleChangeOtherPhotoClick = (photo) => {
    setEditingOtherId(photo.id);  // Để biết ảnh nào đang được chỉnh sửa

    // Lấy ref của ảnh phụ (từng ảnh riêng biệt)
    const fileInputRef = otherFileInputRefs.current[photo.id];

    // Nếu có ref, mở hộp thoại chọn file
    if (fileInputRef) {
      fileInputRef.click(); // Gọi click() để mở hộp thoại chọn file
    }
  };


  const handleDeleteMainPhoto = async (mainPhotoId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa ảnh chính không?");
    if (!ok) return;

    try {
      await deleteRoomPhoto(mainPhotoId);

      // ✅ cập nhật UI: bỏ ảnh vừa xóa ra khỏi state
      setRoomPhotos((prev) => prev.filter((p) => p.id !== mainPhotoId));

      // ✅ sau khi xóa -> bật chọn file để user set ảnh main mới
      setSelectedFileURL("");
      setIsEditingMainPhoto(true);
    } catch (err) {
      console.error("Delete main photo failed:", err);
      alert("Xóa ảnh chính thất bại. Vui lòng thử lại.");
    }
  };

    // Handle delete room
  const handleDeleteRoom = async (roomId) => {
    const confirmed = window.confirm("Are you sure you want to delete this room?");
    if (confirmed) {
      try {
        await deleteRoom(roomId); // Assuming you have a delete API
        setRooms(rooms.filter((room) => room.roomId !== roomId)); // Remove from state
      } catch (error) {
        console.error("Error deleting room", error);
      }
    }
  };


  const handleSaveRoom = async (formData, selectedRoom) => {
    try {
      const isNew = !selectedRoom?.roomId; // kiểm tra phòng mới hay cũ

      console.log("selectedRoom", selectedRoom);

      const roomRequest = {
        roomNumber: formData.roomNumber,
        description: formData.description,
        roomTypeId: formData.roomTypeId,
        status: formData.status || "Available", // mặc định Available
      };

      // ✅ Gửi JSON, không dùng FormData
      const res = isNew
        ? await createRoom(roomRequest) // POST /room
        : await updateRoom(selectedRoom.roomId, roomRequest); // PUT /room/{id}

      if (res.data.code !== 1000) {
        return { error: res.data.message };
      }

      setSelectedRoom(null); // Reset selectedRoom
      loadRooms(); // Reload danh sách phòng
      return { success: true };
    } catch (err) {
      console.log("ERR:", err);

      const code = err?.data?.code;
      const message = err?.data?.message;

      return {
        error: message ? `Lỗi ${code}: ${message}` : "Lỗi kết nối server",
      };

    }
  };

  const handlePriceRowChange = (bookingType, field, value) => {
    // Chuyển giá trị nhập vào thành giá trị số nguyên không có dấu phân cách
    const parsedValue = parseVND(value);

    setPriceRows((prev) =>
      prev.map((row) =>
        row.bookingType === bookingType ? { ...row, [field]: parsedValue } : row
      )
    );
  };

  const formatVND = (value) => {
    if (value === null || value === undefined || value === "") return "Chưa có giá trị";
    const num = Number(value);
    if (isNaN(num)) return "Không hợp lệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const parseVND = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).replace(/\D/g, ""); // Loại bỏ tất cả ký tự không phải số
  };

  const handleSavePriceRow = async (bookingTypeKey) => {
    try {
      const bookingType = BOOKING_TYPES.find((t) => t.key === bookingTypeKey);

      const today = new Date().toISOString().split("T")[0];

      const payload = {
        roomTypeId: id,
        bookingTypeId: bookingType.bookingTypeId,
        price: Number(editingRowData?.price) || 0,
        currency: "VND",
        effectiveDate: today,
        isActive: true,
        weekendSurcharge: Number(editingRowData?.weekendSurcharge) || 0,
        additionalHourPrice: Number(editingRowData?.additionalHourPrice) || 0,
        maxHours: 4,
      };

      if (!editingRowData?.id) {
        await createRoomTypeBookingTypePrice(payload);
      } else {
        await updateRoomTypeBookingTypePrice(editingRowData.id, payload);
      }

      await loadPrices();
      setEditingKey(null);
      setEditingRowData(null);
    } catch (err) {
      console.error("Save price failed:", err);
      alert("Có lỗi xảy ra khi lưu giá");
    }
  };

  const handleCancelEdit = async () => {
    setEditingKey(null);
    setEditingRowData(null);

    await loadPrices(); // gọi lại API để lấy dữ liệu gốc
  };

  const handleEditRow = (tKey) => {
    const row = priceRows.find((r) => r.bookingType === tKey);
    setEditingKey(tKey);
    setEditingRowData({ ...row }); // copy dữ liệu gốc
  };


  return (
    <>
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

        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleMainUpdateFileChange}
          className="sr-only"
        />

        {/* Main photo */}
        {(() => {
          const mainPhotos = roomPhotos.filter((p) => p.isMain);

          if (mainPhotos.length === 0) {
            return (
              <div className="relative group w-1/3 mx-auto h-60 mb-6 border-4 border-yellow-500 rounded-lg overflow-hidden bg-white">
                <label className="w-full h-full flex items-center justify-center cursor-pointer">
                  <span className="text-5xl font-semibold text-gray-400 group-hover:text-blue-600 transition">+</span>
                  <input
                    ref={mainFileInputRef}  // Thêm ref cho ảnh chính
                    type="file"
                    accept="image/*"
                    onChange={handleMainFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            );
          }

          return mainPhotos.map((photo) => (
            <div key={photo.id} className="relative group w-1/3 mx-auto h-60 mb-6 border-4 border-yellow-500 rounded-lg overflow-hidden">
              {isEditingMainPhoto ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <input
                    ref={mainFileInputRef}  // Đảm bảo có ref cho ảnh chính
                    type="file"
                    accept="image/*"
                    onChange={handleMainFileChange}
                    className="sr-only"
                  />
                </div>
              ) : (
                <img
                  src={selectedFileURL || `${API_BASE_URL}/${photo.photoUrl}`}
                  alt="Main Room"
                  className="w-full h-full object-cover"
                  onClick={() => {setPhotoPreview(`${API_BASE_URL}/${photo.photoUrl}`), setIsPhotoModalOpen(true)}}
                />
              )}

              {!isEditingMainPhoto && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleDeleteMainPhoto(photo.id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = mainFileInputRef.current;
                      if (el) el.click();  // Hiển thị hộp thoại chọn file
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Đổi ảnh chính
                  </button>
                </div>
              )}
            </div>
          ));
        })()}

        {/* Room Photos for others */}
        {(() => {
          const serverOthers = roomPhotos.filter((p) => !p.isMain);
          const previews = extraFiles.map((x) => ({ id: `local-${x.url}`, photoUrl: x.url, isLocal: true }));
          const combined = [...serverOthers, ...previews].slice(0, 9);
          const missing = 9 - combined.length;

          return (
            <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
              {combined.map((p) => (
                <div key={p.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-gray-50">
                  {editingOtherId === p.id ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <input
                        ref={(el) => (otherFileInputRefs.current[p.id] = el)}  // Thêm ref cho từng ảnh phụ
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOtherFileChange(p.id, e)}
                        className="block w-full text-xs"
                      />
                    </div>
                  ) : (
                    <img
                      src={otherPreviewMap[p.id] || `${API_BASE_URL}/${p.photoUrl}`}
                      alt="Room"
                      onClick={() => {setPhotoPreview(`${API_BASE_URL}/${p.photoUrl}`), setIsPhotoModalOpen(true)}}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {editingOtherId !== p.id && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => handleRemoveOtherPhoto(p)}
                        className="px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeOtherPhotoClick(p)}  // Thêm click vào "Đổi"
                        className="px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Đổi
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {Array.from({ length: missing }).map((_, idx) => (
                <label
                  key={`empty-${idx}`}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:text-blue-600 transition"
                  title="Thêm ảnh"
                >
                  <span className="text-2xl font-semibold">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddOtherPhoto}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          );
        })()}


      </div>


      {/* Rooms List */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-600 mb-2">Rooms List</label>
          <button
            onClick={() => setSelectedRoom({ ...null })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Add Room
          </button>
        </div>   

        {isLoading ? (
          <p>Loading rooms...</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full table-auto border-collapse">
              <thead className=" text-black">
                <tr>
                  <th className="px-6 py-3 border-b text-left">Room Number</th>
                  <th className="px-6 py-3 border-b text-left">Description</th>
                  <th className="px-6 py-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.roomId} className="hover:bg-gray-100">
                    <td className="px-6 py-4 border-b">{room.roomNumber}</td>
                    <td className="px-6 py-4 border-b">{room.description}</td>
                    <td className="px-6 py-4 border-b text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedRoom({ ...room })}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.roomId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Table */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-600 mb-2">Giá</label>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b text-left">Loại đặt phòng</th>
                <th className="px-4 py-3 border-b text-left">Giá</th>
                <th className="px-4 py-3 border-b text-left">Weekend Surcharge</th>
                <th className="px-4 py-3 border-b text-left">Additional Hour Price</th>
                <th className="px-4 py-3 border-b text-left">Actions</th>

              </tr>
            </thead>

            <tbody>
              {BOOKING_TYPES.map((t) => {
                const row = priceRows.find((r) => r.bookingType === t.key);
                const hasValue =
                  row &&
                  [row.price, row.weekendSurcharge, row.additionalHourPrice].some(
                    (v) => v !== null && v !== undefined && v !== ""
                  );

                const isEditingRow = editingKey === t.key;

                console.log("t.key:", t.key); // in ra key của từng loại


                return (
                  <tr key={t.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b font-medium">{t.label}</td>

                    <td className="px-4 py-3 border-b">
                      {isEditingRow ? (
                        <input
                          type="number"
                          value={editingRowData?.price || ""}
                          onChange={(e) =>
                            setEditingRowData({ ...editingRowData, price: e.target.value })
                          }
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        formatVND(row?.price) || "Chưa có giá trị"
                      )}
                    </td>

                    <td className="px-4 py-3 border-b">
                      {isEditingRow ? (
                        <input
                          type="number"
                          value={editingRowData?.weekendSurcharge || ""}
                          onChange={(e) =>
                            setEditingRowData({
                              ...editingRowData,
                              weekendSurcharge: e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        formatVND(row?.weekendSurcharge) || "Chưa có giá trị"
                      )}
                    </td>

                    <td className="px-4 py-3 border-b">
                      {isEditingRow ? (
                        <input
                          type="number"
                          value={editingRowData?.additionalHourPrice || ""}
                          onChange={(e) =>
                            setEditingRowData({
                              ...editingRowData,
                              additionalHourPrice: e.target.value,
                            })
                          }
                          className="border p-2 rounded w-full"
                        />
                      ) : (
                        formatVND(row?.additionalHourPrice) || "Chưa có giá trị"
                      )}
                    </td>


                    <td className="px-4 py-3 border-b text-center">
                      <div className="flex gap-2 justify-center">
                        {isEditingRow ? (
                          <>
                            <button
                              onClick={() => handleSavePriceRow(t.key)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit()}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : hasValue ? (
                          <button
                            onClick={() => handleEditRow(t.key)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditRow(t.key)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>


          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        
        <button
          onClick={() => navigate("/admin/roomtypes")}
          className="px-6 py-3 bg-gray-300 text-black rounded-lg shadow-md hover:bg-gray-400"
        >
          Back to List
        </button>
      </div>

    </div>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          roomType={roomType}
          onClose={() => setSelectedRoom(null)}
          onSave={handleSaveRoom}
        />
      )}    

      {/* Fullscreen Photo Modal */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
            onClick={() => setIsPhotoModalOpen(false)}
          >
            &times;
          </button>
          <img
            src={
                  photoPreview && (photoPreview.startsWith("http") || photoPreview.startsWith("blob:"))
                    ? photoPreview
                    : API_BASE_URL + "/" + photoPreview
                }
            alt="Chi nhánh"
            className="max-h-[90%] max-w-[90%] object-contain rounded-lg border"
          />
        </div>
      )}

    </>

  );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Icons
import { FaArrowLeft, FaSave, FaEdit, FaTimes, FaPlus, FaTrash, FaImage } from "react-icons/fa";

// APIs
import { getRoomTypeDetails, updateBasicInfo } from "../../api/roomtypes"; //
import {
  getPricesByRoomTypeId,
  createRoomTypeBookingTypePrice,
  updateRoomTypeBookingTypePrice,
} from "../../api/roomTypeBookingTypePrices"; //
import {
  getRoomPhotosByRoomTypeId,
  deleteRoomPhoto,
  uploadMainRoomPhoto,
  updateMainRoomPhoto,
  updateRoomPhoto,
  uploadSubRoomPhoto,
} from "../../api/roomPhotos"; //
import { getRoomsByRoomTypeId, createRoom, updateRoom } from "../../api/rooms"; // // Lưu ý: Cần thêm hàm deleteRoom vào rooms.js nếu chưa có
import { API_BASE_URL } from "../../config/api";

// Components
import RoomModal from "../../components/admin/RoomModal"; // Sử dụng chung Modal với Admin


// Định nghĩa hằng số bên ngoài component để dùng chung
const BOOKING_TYPES = [
  { key: "DAY", label: "Theo Ngày", bookingTypeId: 1 },
  { key: "HOUR", label: "Theo Giờ", bookingTypeId: 2 },
  { key: "NIGHT", label: "Theo Đêm", bookingTypeId: 3 },
];


export default function StaffRoomTypeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // --- States ---
  const [roomType, setRoomType] = useState(null);
  const [roomPhotos, setRoomPhotos] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit Modes
  const [mode, setMode] = useState("view"); // view | edit_info
  
  // Photos Logic
  const [isEditingMainPhoto, setIsEditingMainPhoto] = useState(false);
  const [selectedFileURL, setSelectedFileURL] = useState("");
  const [extraFiles, setExtraFiles] = useState([]);
  const [editingOtherId, setEditingOtherId] = useState(null);
  const [otherPreviewMap, setOtherPreviewMap] = useState({});
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const mainFileInputRef = useRef(null);
  const otherFileInputRefs = useRef({});

  // Rooms Logic
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Pricing Logic
  const BOOKING_TYPES = [
    { key: "DAY", label: "Theo Ngày", bookingTypeId: 1 },
    { key: "NIGHT", label: "Theo Đêm", bookingTypeId: 3 },
    { key: "HOUR", label: "Theo Giờ", bookingTypeId: 2 },
  ];
  // const [priceRows, setPriceRows] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editingRowData, setEditingRowData] = useState(null);

  // Bên trong component StaffRoomTypeDetail
  const [priceRows, setPriceRows] = useState(
    BOOKING_TYPES.map(t => ({
      bookingType: t.key,
      label: t.label,
      bookingTypeId: t.bookingTypeId,
      id: null,
      price: "",
      weekendSurcharge: "",
      additionalHourPrice: ""
    }))
  );

  // --- Load Data ---
  const loadPrices = async () => {
    try {
      const pricesRes = await getPricesByRoomTypeId(id);
      const priceList = pricesRes?.data?.result || [];

      setPriceRows(prevRows => 
        prevRows.map(row => {
          const found = priceList.find(x => x.bookingTypeId === row.bookingTypeId);
          if (found) {
            return {
              ...row,
              id: found.id,
              price: found.price,
              weekendSurcharge: found.weekendSurcharge,
              additionalHourPrice: found.additionalHourPrice,
            };
          }
          return row; // Giữ nguyên row với id=null nếu không tìm thấy
        })
      );
    } catch (err) {
      console.error("Lỗi khi tải bảng giá:", err);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsResponse = await getRoomsByRoomTypeId(id); //
      setRooms(roomsResponse.data.result || []);
    } catch (error) {
      console.error("Error loading rooms", error);
    }
  };

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // 1. Thông tin cơ bản
        const response = await getRoomTypeDetails(id); //
        setRoomType(response.data.result);
        setMode(location.search.includes("mode=edit") ? "edit_info" : "view");

        // 2. Hình ảnh
        const photosRes = await getRoomPhotosByRoomTypeId(id); //
        setRoomPhotos(photosRes.data.result);

        // 3. Danh sách phòng vật lý
        await loadRooms();

        // 4. Bảng giá
        await loadPrices();

      } catch (error) {
        console.error("Error fetching room type details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, location.search]);

  if (isLoading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!roomType) return <div className="p-10 text-center">Không tìm thấy loại phòng!</div>;

  // --- Handlers: Basic Info ---
  const handleSaveBasicInfo = async () => {
    try {
      const updatedInfo = {
        typeName: roomType.typeName,
        capacity: roomType.capacity,
        description: roomType.description,
      };
      await updateBasicInfo(id, updatedInfo); //
      setMode("view");
    } catch (error) {
      console.error("Error saving basic info", error);
      alert("Lỗi khi lưu thông tin cơ bản");
    }
  };

  // --- Handlers: Photos (Main) ---
  const handleMainFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasMainPhoto = roomPhotos.some((p) => p.isMain);
    try {
      if (!hasMainPhoto) {
        await uploadMainRoomPhoto(id, file); //
      } else {
        await updateMainRoomPhoto(id, file); //
      }
      // Reload photos
      const res = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(res.data.result || []);
      setSelectedFileURL("");
      setIsEditingMainPhoto(false);
    } catch (err) {
      console.error("Main photo error:", err);
      alert("Lỗi upload ảnh chính.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDeleteMainPhoto = async (photoId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ảnh chính?")) return;
    try {
      await deleteRoomPhoto(photoId); //
      setRoomPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setIsEditingMainPhoto(true);
    } catch (err) {
      alert("Xóa ảnh thất bại");
    }
  };

  // --- Handlers: Photos (Sub) ---
  const handleAddOtherPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadSubRoomPhoto(id, file); //
      const res = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(res.data.result || []);
    } catch (err) {
      alert("Thêm ảnh phụ thất bại.");
    }
    e.target.value = "";
  };

  const handleOtherFileChange = async (photoId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await updateRoomPhoto(photoId, file); //
      const res = await getRoomPhotosByRoomTypeId(id);
      setRoomPhotos(res.data.result || []);
      setEditingOtherId(null);
    } catch (err) {
      alert("Cập nhật ảnh thất bại.");
    }
  };

  const handleRemoveOtherPhoto = async (photoId) => {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      await deleteRoomPhoto(photoId); //
      setRoomPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      alert("Xóa thất bại.");
    }
  };

  // --- Handlers: Rooms (Physical) ---
  const handleSaveRoom = async (formData) => {
    try {
      const isNew = !selectedRoom?.roomId;
      const payload = {
        roomNumber: formData.roomNumber,
        description: formData.description,
        roomTypeId: id, // ID của RoomType hiện tại
        status: formData.status || "Available",
      };

      const res = isNew
        ? await createRoom(payload) //
        : await updateRoom(selectedRoom.roomId, payload); //

      if (res.data.code === 1000) {
        setSelectedRoom(null);
        loadRooms();
        return { success: true };
      } else {
        return { error: res.data.message };
      }
    } catch (err) {
      return { error: err?.message || "Lỗi server" };
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này khỏi danh sách?")) return;
    // Giả định có hàm deleteRoom, nếu chưa có trong rooms.js bạn cần thêm vào
    // await deleteRoom(roomId); 
    alert("Chức năng xóa đang được cập nhật (cần API deleteRoom)");
  };

  // --- Handlers: Pricing ---
  const handleSavePriceRow = async () => {
    try {
      const payload = {
        roomTypeId: id,
        bookingTypeId: editingRowData.bookingTypeId,
        price: Number(editingRowData.price) || 0,
        currency: "VND",
        effectiveDate: new Date().toISOString().split("T")[0],
        isActive: true,
        weekendSurcharge: Number(editingRowData.weekendSurcharge) || 0,
        additionalHourPrice: Number(editingRowData.additionalHourPrice) || 0,
        maxHours: 5,
      };

      if (!editingRowData.id) {
        await createRoomTypeBookingTypePrice(payload); //
      } else {
        await updateRoomTypeBookingTypePrice(editingRowData.id, payload); //
      }

      await loadPrices();
      setEditingKey(null);
      setEditingRowData(null);
    } catch (err) {
      alert("Lỗi lưu giá: " + err.message);
    }
  };

  // --- Helper: Format Money ---
  const formatVND = (val) => {
    if (val === "" || val === null || val === undefined) return "—";
    return Number(val).toLocaleString("vi-VN") + " đ";
  };
  const parseVND = (val) => String(val).replace(/\D/g, "");

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => navigate("/staff/hotel")}
                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 shadow-sm border border-gray-200 transition-all"
             >
                <FaArrowLeft />
             </button>
             <div>
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết loại phòng</h1>
                <p className="text-sm text-gray-500">{roomType.typeName}</p>
             </div>
          </div>
        </div>

        {/* 1. Thông Tin Cơ Bản */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-gray-800">Thông tin chung</h3>
            {mode === "view" ? (
                <button onClick={() => setMode("edit_info")} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <FaEdit /> Sửa
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => setMode("view")} className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Hủy</button>
                    <button onClick={handleSaveBasicInfo} className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                        <FaSave /> Lưu
                    </button>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên loại phòng</label>
              <input
                disabled={mode === "view"}
                value={roomType.typeName}
                onChange={(e) => setRoomType({ ...roomType, typeName: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Sức chứa (Người)</label>
              <input
                type="number"
                disabled={mode === "view"}
                value={roomType.capacity}
                onChange={(e) => setRoomType({ ...roomType, capacity: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Chi nhánh</label>
              <input
                disabled
                value={roomType.branch?.branchName || "N/A"}
                className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mô tả</label>
              <textarea
                rows={3}
                disabled={mode === "view"}
                value={roomType.description}
                onChange={(e) => setRoomType({ ...roomType, description: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Hình Ảnh */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Hình ảnh phòng</h3>
            
            {/* Ảnh chính */}
            <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-2">Ảnh đại diện</p>
                {(() => {
                    const mainPhoto = roomPhotos.find(p => p.isMain);
                    return (
                        <div className="relative group w-full md:w-1/3 h-48 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                             {mainPhoto ? (
                                <>
                                    <img 
                                        src={`${API_BASE_URL}/${mainPhoto.photoUrl}`} 
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => {setPhotoPreview(`${API_BASE_URL}/${mainPhoto.photoUrl}`); setIsPhotoModalOpen(true)}}
                                        alt="Main"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                        <button onClick={() => mainFileInputRef.current.click()} className="px-3 py-1 bg-white text-blue-600 rounded text-xs font-bold hover:bg-gray-100">Đổi ảnh</button>
                                        <button onClick={() => handleDeleteMainPhoto(mainPhoto.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Xóa</button>
                                    </div>
                                </>
                             ) : (
                                <div onClick={() => mainFileInputRef.current.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                                    <FaImage className="text-gray-300 text-3xl mb-2"/>
                                    <span className="text-sm text-gray-400 font-medium">Tải ảnh chính</span>
                                </div>
                             )}
                             <input ref={mainFileInputRef} type="file" hidden accept="image/*" onChange={handleMainFileChange} />
                        </div>
                    );
                })()}
            </div>

            {/* Ảnh phụ */}
            <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Ảnh chi tiết</p>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {roomPhotos.filter(p => !p.isMain).map(photo => (
                        <div key={photo.id} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                             <img 
                                src={`${API_BASE_URL}/${photo.photoUrl}`} 
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => {setPhotoPreview(`${API_BASE_URL}/${photo.photoUrl}`); setIsPhotoModalOpen(true)}}
                                alt="Sub"
                             />
                             <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => {setEditingOtherId(photo.id); otherFileInputRefs.current[photo.id].click()}} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"><FaEdit size={10}/></button>
                                <button onClick={() => handleRemoveOtherPhoto(photo.id)} className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"><FaTimes size={10}/></button>
                             </div>
                             <input 
                                ref={el => otherFileInputRefs.current[photo.id] = el}
                                type="file" hidden accept="image/*" 
                                onChange={(e) => handleOtherFileChange(photo.id, e)} 
                             />
                        </div>
                    ))}
                    {/* Nút thêm ảnh phụ */}
                    <label className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-blue-500">
                        <FaPlus size={20} />
                        <span className="text-xs font-medium mt-1">Thêm ảnh</span>
                        <input type="file" hidden accept="image/*" onChange={handleAddOtherPhoto} />
                    </label>
                </div>
            </div>
        </div>

        {/* 3. Danh Sách Phòng */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-gray-800">Danh sách phòng vật lý</h3>
                 <button onClick={() => setSelectedRoom({})} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all">
                    <FaPlus size={12}/> Thêm phòng
                 </button>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="p-4 border-b">Số phòng</th>
                            <th className="p-4 border-b">Mô tả</th>
                            <th className="p-4 border-b">Trạng thái</th>
                            <th className="p-4 border-b text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rooms.map(room => (
                            <tr key={room.roomId} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-800">{room.roomNumber}</td>
                                <td className="p-4 text-gray-600">{room.description || "—"}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => setSelectedRoom(room)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit/></button>
                                    <button onClick={() => handleDeleteRoom(room.roomId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash/></button>
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && (
                            <tr><td colSpan="4" className="p-6 text-center text-gray-400 italic">Chưa có phòng nào được tạo.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 4. Cấu Hình Giá */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Bảng giá tiêu chuẩn</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                        <tr>
                            <th className="p-4 border-b">Loại hình</th>
                            <th className="p-4 border-b">Giá cơ bản</th>
                            <th className="p-4 border-b">Phụ thu cuối tuần</th>
                            <th className="p-4 border-b">Phụ thu quá giờ</th>
                            <th className="p-4 border-b text-center w-40">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {priceRows.map((row) => {
                            const isEditing = editingKey === row.bookingType;
                            return (
                                <tr key={row.bookingType} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-700">{row.label}</td>
                                    
                                    {/* Giá cơ bản */}
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                className="w-full p-2 border rounded"
                                                value={editingRowData?.price || ""} 
                                                onChange={e => setEditingRowData({...editingRowData, price: e.target.value.replace(/\D/g, "")})}
                                            />
                                        ) : (
                                            <span className={row.price ? "text-gray-900" : "text-gray-400 italic"}>
                                                {row.price ? Number(row.price).toLocaleString() + " đ" : "Chưa thiết lập"}
                                            </span>
                                        )}
                                    </td>
                                    
                                    {/* Phụ thu cuối tuần */}
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editingRowData.weekendSurcharge} 
                                                onChange={e => setEditingRowData({...editingRowData, weekendSurcharge: parseVND(e.target.value)})}
                                                className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                                                placeholder="0"
                                            />
                                        ) : (
                                            <span className={row.weekendSurcharge ? "text-gray-800" : "text-gray-400 italic"}>
                                                {row.weekendSurcharge ? formatVND(row.weekendSurcharge) : "0 đ"}
                                            </span>
                                        )}
                                    </td>

                                    {/* Phụ thu quá giờ */}
                                    <td className="p-4">
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={editingRowData.additionalHourPrice} 
                                                onChange={e => setEditingRowData({...editingRowData, additionalHourPrice: parseVND(e.target.value)})}
                                                className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                                                placeholder="0"
                                            />
                                        ) : (
                                            <span className={row.additionalHourPrice ? "text-gray-800" : "text-gray-400 italic"}>
                                                {row.additionalHourPrice ? formatVND(row.additionalHourPrice) : "0 đ"}
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 text-center">
                                      {isEditing ? (
                                          <div className="flex justify-center gap-2">
                                              <button onClick={handleSavePriceRow} className="p-2 bg-green-600 text-white rounded"><FaSave /></button>
                                              <button onClick={() => {setEditingKey(null); setEditingRowData(null)}} className="p-2 bg-gray-400 text-white rounded"><FaTimes /></button>
                                          </div>
                                      ) : (
                                          <button 
                                              onClick={() => {setEditingKey(row.bookingType); setEditingRowData({...row})}}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                                  row.id ? "border-blue-200 text-blue-600" : "border-amber-200 text-amber-600"
                                              }`}
                                          >
                                              {row.id ? "Cập nhật" : "Thiết lập giá"}
                                          </button>
                                      )}
                                  </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* Modals */}
      
      {/* Modal Add/Edit Room (Physical) */}
      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          roomType={roomType}
          onClose={() => setSelectedRoom(null)}
          onSave={handleSaveRoom}
        />
      )}

      {/* Fullscreen Photo View */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setIsPhotoModalOpen(false)}>
          <button className="absolute top-6 right-6 text-white hover:text-red-500"><FaTimes size={30} /></button>
          <img src={photoPreview} className="max-h-full max-w-full object-contain rounded-lg" alt="Preview" />
        </div>
      )}
    </div>
  );
}
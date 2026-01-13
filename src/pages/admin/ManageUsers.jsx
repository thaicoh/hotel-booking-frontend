import { useState, useEffect } from "react";
import { 
  getUsers, 
  createUserAdmin, 
  updateUserStatus
} from "../../api/users"; // Giả sử import đúng đường dẫn

import { getRoles } from "../../api/roles"
import { getBranches } from "../../api/branches"

import UserModal from "../../components/admin/UserModal";
import ConfirmModal from "../../components/common/ConfirmModal";

// Import Icons để giao diện đẹp hơn
import { 
  FaPlus, FaSearch, FaSync, 
  FaEye, FaPen, FaTrash, 
  FaFilter, FaUserShield, FaPhone, FaEnvelope 
} from "react-icons/fa";

export default function ManageUsers() {
  // ==================== LOGIC GIỮ NGUYÊN ====================
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [branches, setBranches] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ACTIVE"); 

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // const [errorMessage, setErrorMessage] = useState(""); // Không dùng trong code gốc nên comment
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers(page, size, search, filterRole, filterStatus);
      if (res.data.code === 1000) {
        setUsers(res.data.result.items);
        setTotalPages(res.data.result.totalPages);
      }
    } catch (err) {
      console.error("Lỗi tải user:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      if(res.data.code === 1000){
        setRoles(res.data.result)
      }
    } catch (error) {
      console.log("Loi tai roles: " , error)
    }
  }

  const loadBranchs = async () => {
    try {
      const res = await getBranches();
      if(res.data.code === 1000){
        setBranches(res.data.result)
      }
    } catch (error) {
      console.log("Loi tai branch: " , error)
    }
  }

  const resetFilters = () => {
    setSearch("");        
    setFilterRole("");    
    setFilterStatus("ACTIVE");
    setPage(-1);   
    setTimeout(() => setPage(0), 0); 
  };

  const handleSaveUser = async (formData) => {
    try {
      const isNewUser = !selectedUser?.email && !selectedUser?.phone;
      if (isNewUser) {
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          roles: [formData.role],
          branchId: formData.branch || null,
          status: formData.status,
        };
        const res = await createUserAdmin(payload);
        if (res.data.code !== 1000) {
          return { error: res.data.message || "Tạo user thất bại" };
        }
      } else {
        const res = await updateUserStatus(selectedUser.email, formData.status);
        if (res.data.code !== 1000) {
          return { error: res.data.message || "Cập nhật user thất bại" };
        }
      }
      setSelectedUser(null);
      loadUsers();
      return { success: true }; 
    } catch (err) {
      return { error: "Lỗi kết nối server" };
    }
  };

  const handleBlockUser = async () => {
    try {
      const res = await updateUserStatus(userToDelete.email, "LOGIN_LOCKED");
      if (res.data.code !== 1000) {
        alert("Khóa user thất bại");
        return;
      }
      setShowConfirm(false);
      loadUsers();
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadBranchs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, filterRole, filterStatus]);

  // ==================== HELPER RENDER UI ====================
  
  // Hàm render badge trạng thái đẹp hơn
  const renderStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
      BOOKING_LOCKED: "bg-amber-100 text-amber-700 border-amber-200",
      LOGIN_LOCKED: "bg-rose-100 text-rose-700 border-rose-200",
      UNKNOWN: "bg-gray-100 text-gray-600 border-gray-200",
    };
    const currentStyle = styles[status] || styles.UNKNOWN;
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách nhân viên và khách hàng</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all text-sm font-medium"
          onClick={() => setSelectedUser({})}
        >
          <FaPlus /> Thêm mới
        </button>
      </div>

      {/* --- FILTER SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              name="no-autofill-search"
              autoComplete="off"
              placeholder="Tìm tên, email, sđt..."
              className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Role */}
          <div className="lg:col-span-3">
             <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm appearance-none bg-white"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">Tất cả vai trò</option>
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <FaUserShield className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
             </div>
          </div>

          {/* Filter Status */}
          <div className="lg:col-span-3">
             <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm appearance-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Active</option>
                  <option value="LOGIN_LOCKED">Login Locked</option>
                  <option value="BOOKING_LOCKED">Booking Locked</option>
                </select>
                <FaFilter className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
             </div>
          </div>

          {/* Buttons */}
          <div className="lg:col-span-2 flex gap-2">
             <button
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                onClick={resetFilters}
                title="Tải lại"
             >
                <FaSync />
             </button>
             <button
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                onClick={() => {
                  setPage(0);
                  loadUsers();
                }}
             >
                Tìm
             </button>
          </div>
        </div>
      </div>

      {/* --- LOADING --- */}
      {loading && (
        <div className="flex justify-center items-center h-40">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* --- CONTENT --- */}
      {!loading && (
        <>
          {/* 1. TABLE VIEW (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Thông tin User</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Ngày tạo</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        Không tìm thấy dữ liệu
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{u.fullName}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className="flex items-center gap-2 text-gray-500">
                                <FaEnvelope className="text-xs" /> {u.email}
                              </span>
                              <span className="flex items-center gap-2 text-gray-500">
                                <FaPhone className="text-xs" /> {u.phone}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                             {u.roles?.length > 0 ? u.roles.map((r) => r.name).join(", ") : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderStatusBadge(u.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Xem chi tiết"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => setSelectedUser({ ...u, __forceEditStatus: true })}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FaPen />
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setShowConfirm(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Khóa/Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CARD VIEW (Mobile) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {users.length === 0 ? (
               <div className="text-center p-8 bg-white rounded-lg shadow text-gray-500">Không có dữ liệu</div>
            ) : (
              users.map((u) => (
                <div key={u.email} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{u.fullName}</h3>
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {u.roles?.length > 0 ? u.roles.map((r) => r.name).join(", ") : "User"}
                      </span>
                    </div>
                    {renderStatusBadge(u.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                       <FaEnvelope className="text-gray-400" /> <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <FaPhone className="text-gray-400" /> <span>{u.phone}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Ngày tạo: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t pt-3">
                    <button 
                       onClick={() => setSelectedUser(u)}
                       className="flex-1 py-2 bg-gray-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                    >
                      Xem
                    </button>
                    <button 
                       onClick={() => setSelectedUser({ ...u, __forceEditStatus: true })}
                       className="flex-1 py-2 bg-gray-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                       onClick={() => {
                        setUserToDelete(u);
                        setShowConfirm(true);
                      }}
                       className="flex-1 py-2 bg-gray-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          {users.length > 0 && (
             <div className="flex justify-between items-center mt-6 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page === 0
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Trước
              </button>

              <span className="text-sm text-gray-600">
                Trang <span className="font-bold text-gray-900">{page + 1}</span> / {totalPages}
              </span>

              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page + 1 >= totalPages
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {/* --- MODALS --- */}
      <UserModal
        user={selectedUser}
        roles={roles}
        branches={branches}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveUser}
      />

      {showConfirm && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn khóa quyền đăng nhập của "${userToDelete?.fullName}" không?`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleBlockUser}
        />
      )}
    </div>
  );
}
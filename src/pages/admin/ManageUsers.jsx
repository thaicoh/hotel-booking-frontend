import { useState, useEffect } from "react";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  createUserAdmin ,
  updateUserStatus
} from "../../api/users";

import { getRoles } from "../../api/roles"
import { getBranches } from "../../api/branches"

import UserModal from "../../components/admin/UserModal";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [branches, setBranches] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ACTIVE"); // mặc định ACTIVE

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);


  const [errorMessage, setErrorMessage] = useState("");


  // roles
  const [roles, setRoles] = useState([])

  const [loading, setLoading] = useState(true);

  // ✅ Load users from API
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

  // Load all role
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

    // Load all branch
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
    setSearch("");        // reset ô search
    setFilterRole("");    // reset dropdown role
    setFilterStatus("ACTIVE");

    setPage(-1);   // ⭐ ép thay đổi
    setTimeout(() => setPage(0), 0); // ⭐ đưa về 0 để load đúng


    // loadUsers();
    // loadRoles();
    // loadBranchs();
  };

  const renderStatus = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="px-2 py-1 rounded text-white bg-green-600">
            ACTIVE
          </span>
        );

      case "BOOKING_LOCKED":
        return (
          <span className="px-2 py-1 rounded text-white bg-yellow-500">
            BOOKING LOCKED
          </span>
        );

      case "LOGIN_LOCKED":
        return (
          <span className="px-2 py-1 rounded text-white bg-red-600">
            LOGIN LOCKED
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded bg-gray-400 text-white">
            UNKNOWN
          </span>
        );
    }
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
          return { error: res.data.message || "Tạo user thất bại" };  // 🔥 TRẢ LỖI
        }
      } else {

        const res = await updateUserStatus(selectedUser.email, formData.status);

        if (res.data.code !== 1000) {
          return { error: res.data.message || "Cập nhật user thất bại" }; // 🔥 TRẢ LỖI
        }
      }

      // Thành công
      setSelectedUser(null);
      loadUsers();
      return { success: true }; // 🔥 TRẢ THÀNH CÔNG

    } catch (err) {
      return { error: "Lỗi kết nối server" }; // 🔥 TRẢ LỖI
    }
  };

  const handleBlockUser = async () => {
    try {
      // Gọi API update status
      const res = await updateUserStatus(userToDelete.email, "LOGIN_LOCKED");

      if (res.data.code !== 1000) {
        alert("Khóa user thất bại");
        return;
      }

      // Đóng modal
      setShowConfirm(false);

      // Reload danh sách
      loadUsers();

    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  useEffect(() => {
    setFilterStatus(filterStatus);
    loadUsers();
    loadRoles();
    loadBranchs();
  }, [page, search, filterRole, filterStatus]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => setSelectedUser({})} // mở modal thêm user
        >
          + Thêm User
        </button>
      </div>


        {/* 🔍 Search + Filter */}
        <div className="bg-white shadow rounded p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">
            <input
                name="no-autofill-search"
                autocomplete="off"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                class="border p-2 rounded w-full"
                type="text"

                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>


            {/* Filter Role */}
            <div className="flex-1 md:max-w-[200px]">
              <select
                className="border p-2 rounded w-full"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Lọc theo Role</option>
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>

            </div>


            {/* Filter Status */}
            <div className="flex-1 md:max-w-[200px]">
              <select
                className="border p-2 rounded w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Lọc theo Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="LOGIN_LOCKED">LOGIN_LOCKED</option>
                <option value="BOOKING_LOCKED">BOOKING_LOCKED</option>
              </select>
            </div>



            {/* refresh default */}
            <div className="flex-1 md:max-w-[150px]">
              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded w-full"
                onClick={resetFilters}
              >
                Tải lại
              </button>
            </div>


            {/* Search Button */}
            <div className="flex-1 md:max-w-[150px]">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded w-full"
                onClick={() => {
                  setPage(0);   // reset về trang đầu
                  loadUsers();  // gọi API tìm kiếm
                }}
              >
                Tìm kiếm
              </button>
            </div>

            

        </div>
        </div>

      {/* ✅ Loading */}
      {loading && <p>Đang tải dữ liệu...</p>}

      {/* ✅ User Table */}
      {!loading && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Created At</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="hover:bg-gray-50">
                  <td className="p-3 border">{u.fullName}</td>
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.phone}</td>

                  {/* ✅ Role lấy từ mảng roles */}
                  <td className="p-3 border">
                    {u.roles?.length > 0
                      ? u.roles.map((r) => r.name).join(", ")
                      : "No Role"}
                  </td>

                  <td className="p-3 border">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>

                  <td className="p-3 border">
                    {renderStatus(u.status)}
                  </td>

                  <td className="p-3 border">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                      onClick={() => setSelectedUser(u)}
                    >
                      View
                    </button>

                    <button 
                      className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                      onClick={() => setSelectedUser({ ...u, __forceEditStatus: true })}
                      
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      onClick={() => {
                        setUserToDelete(u);
                        setShowConfirm(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ Pagination */}
          <div className="flex justify-between items-center p-4">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded ${
                page === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Previous
            </button>

            <span>
              Trang <strong>{page + 1}</strong> / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded ${
                page + 1 >= totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <UserModal
        user={selectedUser}
        roles={roles}
        branches={branches}
        onClose={() => setSelectedUser(null)}
        onSave={handleSaveUser}   // 🔥 truyền hàm đã định nghĩa
      />

      {showConfirm && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa user "${userToDelete.fullName}" không?`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleBlockUser}

        />
      )}

    </div>
  );
}
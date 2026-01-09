import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInfo } from '../../api/users';
import { 
  FaUserCircle, FaEnvelope, FaPhone, 
  FaCalendarCheck, FaUserShield, FaSignOutAlt, FaChevronRight 
} from 'react-icons/fa';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getMyInfo();
        if (res.data && res.data.code === 1000) {
          setUser(res.data.result);
        } else {
          setError("Không thể tải thông tin người dùng.");
        }
      } catch (err) {
        setError("Phiên đăng nhập đã hết hạn hoặc có lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hoặc logic xóa session của bạn
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <p className="text-red-500 mb-4 font-medium">{error}</p>
      <button onClick={() => navigate('/login')} className="text-orange-600 underline">Quay lại đăng nhập</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4">
              <div className="inline-block p-2 bg-white rounded-2xl shadow-lg">
                <FaUserCircle className="text-8xl text-gray-300" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{user?.fullName}</h1>
                <p className="text-gray-500 font-medium">Thành viên từ: {new Date(user?.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="flex gap-2">
                {user?.roles?.map((role, idx) => (
                  <span key={idx} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 uppercase">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Thông tin cá nhân</h2>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                    <p className="text-gray-700 font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Số điện thoại</p>
                    <p className="text-gray-700 font-medium">{user?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                    <FaUserShield />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Trạng thái tài khoản</p>
                    <p className="text-green-600 font-bold">{user?.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu nhanh bên phải */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 px-2">Hoạt động</h3>
              <button 
                onClick={() => navigate('/my-bookings')}
                className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <FaCalendarCheck className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Lịch sử đặt phòng</span>
                </div>
                <FaChevronRight className="text-gray-300 group-hover:text-orange-500 transition" />
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition border border-red-100"
            >
              <FaSignOutAlt />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
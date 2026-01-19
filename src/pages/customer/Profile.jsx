import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInfo, changePassword } from '../../api/users'; // Đã thêm import changePassword
import { 
  FaUserCircle, FaEnvelope, FaPhone, 
  FaCalendarCheck, FaUserShield, FaSignOutAlt, FaChevronRight,
  FaLock, FaTimes // Thêm icon Lock và Times (đóng)
} from 'react-icons/fa';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal Đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passMessage, setPassMessage] = useState({ type: '', content: '' }); // type: 'success' | 'error'
  const [passLoading, setPassLoading] = useState(false);

  const navigate = useNavigate();

    // 👉 Cuộn lên đầu trang khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

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
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Xử lý đổi mật khẩu
// Xử lý đổi mật khẩu
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', content: '' });

    // Validate client
    if (!passData.oldPassword || !passData.newPassword) {
      setPassMessage({ type: 'error', content: 'Vui lòng nhập đầy đủ thông tin.' });
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      setPassMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (passData.newPassword.length < 6) {
      setPassMessage({ type: 'error', content: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });

      // Trường hợp API trả về HTTP 200 nhưng code lỗi (ít gặp với cấu hình của bạn nhưng cứ giữ để an toàn)
      if (res.data && res.data.code === 1000) {
        setPassMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
        setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setShowPasswordModal(false), 1500);
      } else {
        // Fallback nếu code != 1000 mà vẫn lọt vào try
        throw { data: res.data }; 
      }
    } catch (err) {
      // Do interceptor trả về `Promise.reject(error.response)` nên `err` ở đây chính là response object
      // Chúng ta lấy data từ `err.data`
      
      const errorData = err?.data || err?.response?.data; // Lấy data an toàn

      if (errorData?.code === 1014) {
        setPassMessage({ type: 'error', content: 'Mật khẩu cũ không chính xác.' });
      } else {
        // In ra message từ server hoặc message mặc định
        setPassMessage({ 
          type: 'error', 
          content: errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.' 
        });
      }
    } finally {
      setPassLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Profile (Giữ nguyên) */}
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
                <p className="text-gray-500 font-medium">Thành viên từ: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
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

        {/* Layout Chính */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Cột trái: Thông tin cá nhân (Giữ nguyên) */}
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

          {/* Cột phải: Menu nhanh */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 px-2">Hoạt động</h3>
              
              <button 
                onClick={() => navigate('/my-bookings')}
                className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition group mb-2"
              >
                <div className="flex items-center gap-3">
                  <FaCalendarCheck className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Lịch sử đặt phòng</span>
                </div>
                <FaChevronRight className="text-gray-300 group-hover:text-orange-500 transition" />
              </button>

              {/* Nút Đổi mật khẩu mới */}
              <button 
                onClick={() => {
                  setShowPasswordModal(true);
                  setPassMessage({ type: '', content: '' });
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-orange-50 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <FaLock className="text-orange-500" />
                  <span className="text-gray-700 font-medium">Đổi mật khẩu</span>
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

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-10 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              
              {/* Thông báo lỗi/thành công */}
              {passMessage.content && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  passMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {passMessage.content}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="Nhập mật khẩu cũ"
                  value={passData.oldPassword}
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="Nhập mật khẩu mới"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input 
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={passLoading}
                  className={`px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-lg shadow-orange-200 ${
                    passLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {passLoading ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import { 
  FaChartBar, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaSearch, 
  FaBuilding,
  FaFileInvoiceDollar 
} from "react-icons/fa";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { getBranches } from "../../api/bookings"; // Tận dụng API cũ
import { getRevenueStatistics } from "../../api/statistics";

const AdminDashboard = () => {
  // --- STATE ---
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [branches, setBranches] = useState([]);
  
  // Filter State
  const [filter, setFilter] = useState({
    type: "MONTHLY", // YEARLY, MONTHLY, DAILY
    year: currentYear,
    month: currentMonth,
    branchId: ""
  });

  // Data State
  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECT: Load Metadata ---
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await getBranches();
        if (res.data && res.data.result) {
          setBranches(res.data.result);
        }
      } catch (error) {
        console.error("Failed to load branches", error);
      }
    };
    fetchMetadata();
    // Load data lần đầu
    handleFetchData();
  }, []);

  // --- FUNCTION: Fetch Data ---
  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      const { type, year, month, branchId } = filter;
      
      // Gọi API
      const res = await getRevenueStatistics(type, year, month, branchId);
      
      if (res.data && res.data.code === 1000) {
        // Map dữ liệu để hiển thị đẹp hơn
        const mappedData = res.data.result.map(item => ({
          ...item,
          name: formatLabel(item.timeUnit, type), // Tạo label cho trục X
          revenue: item.totalRevenue,
          bookings: item.bookingCount
        }));
        setStatsData(mappedData);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPER: Formatters ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatLabel = (timeUnit, type) => {
    if (type === "YEARLY") return `Năm ${timeUnit}`;
    if (type === "MONTHLY") return `T${timeUnit}`;
    if (type === "DAILY") return `${timeUnit}/${filter.month}`;
    return timeUnit;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // --- MEMO: Calculate Totals ---
  const summary = useMemo(() => {
    return statsData.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + (curr.totalRevenue || 0),
      totalBookings: acc.totalBookings + (curr.bookingCount || 0)
    }), { totalRevenue: 0, totalBookings: 0 });
  }, [statsData]);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartBar className="text-orange-600" /> Dashboard Thống Kê
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Tổng quan hiệu quả kinh doanh của khách sạn</p>
        </div>
      </div>

      {/* --- Filter Section (Giống ManageBookings) --- */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
           <FaSearch className="text-gray-400 size-4"/> Bộ lọc báo cáo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* 1. Loại Báo Cáo */}
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loại thống kê</label>
             <select 
                name="type" 
                value={filter.type} 
                onChange={handleFilterChange}
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
             >
               <option value="DAILY">Theo Ngày (Trong tháng)</option>
               <option value="MONTHLY">Theo Tháng (Trong năm)</option>
               <option value="YEARLY">Theo Năm</option>
             </select>
          </div>

          {/* 2. Chọn Chi Nhánh */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chi nhánh</label>
            <select
              name="branchId"
              value={filter.branchId}
              onChange={handleFilterChange}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Toàn hệ thống</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branchName}</option>
              ))}
            </select>
          </div>

          {/* 3. Chọn Năm (Hiện nếu type != YEARLY hoặc user vẫn muốn chỉnh) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Năm</label>
            <select
              name="year"
              value={filter.year}
              onChange={handleFilterChange}
              disabled={filter.type === 'YEARLY'} // Disable nếu xem theo năm (API tự lấy list năm)
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100"
            >
              {[0,1,2,3,4].map(i => (
                <option key={i} value={currentYear - i}>{currentYear - i}</option>
              ))}
            </select>
          </div>

          {/* 4. Chọn Tháng (Chỉ hiện nếu type == DAILY) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tháng</label>
            <select
              name="month"
              value={filter.month}
              onChange={handleFilterChange}
              disabled={filter.type !== 'DAILY'}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                 <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* 5. Button Submit */}
          <div>
            <button
              onClick={handleFetchData}
              disabled={isLoading}
              className="w-full h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {isLoading ? 'Đang tải...' : <><FaChartBar /> Xem báo cáo</>}
            </button>
          </div>
        </div>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Doanh thu */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Tổng Doanh Thu</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {formatCurrency(summary.totalRevenue)}
            </h3>
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
              {filter.type === 'DAILY' ? 'Tháng này' : filter.type === 'MONTHLY' ? 'Năm nay' : 'Tất cả'}
            </span>
          </div>
        </div>

        {/* Card 2: Số lượng đơn */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Tổng Booking</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {summary.totalBookings} <span className="text-sm font-normal text-gray-500">đơn</span>
            </h3>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              Đã thanh toán & chưa TT
            </span>
          </div>
        </div>

        {/* Card 3: Trung bình đơn */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl">
            <FaBuilding />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium uppercase">Giá Trị Trung Bình</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {summary.totalBookings > 0 
                ? formatCurrency(summary.totalRevenue / summary.totalBookings) 
                : formatCurrency(0)}
            </h3>
            <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded">
              / 1 booking
            </span>
          </div>
        </div>
      </div>

      {/* --- Chart Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Biểu đồ (Chiếm 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar className="text-orange-500"/> 
            Biểu đồ doanh thu - {filter.type === 'DAILY' ? `Tháng ${filter.month}/${filter.year}` : filter.type === 'MONTHLY' ? `Năm ${filter.year}` : 'Các năm'}
          </h3>
          
          <div className="h-[400px] w-full">
            {statsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis 
                    tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)} 
                    tick={{fontSize: 12}}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" name="Doanh thu (VND)" fill="#ea580c" radius={[4, 4, 0, 0]}>
                     {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#ea580c' : '#f3f4f6'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FaCalendarAlt className="text-4xl mb-3 opacity-30"/>
                <p>Chưa có dữ liệu cho khoảng thời gian này</p>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Bảng chi tiết (Chiếm 1/3) */}
        <div className="bg-white p-0 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-700">Chi tiết số liệu</h3>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[450px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Đơn</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsData.length > 0 ? (
                   statsData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-orange-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-right text-blue-600 font-bold">{item.bookingCount}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-700">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-6 text-gray-500 text-xs">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {statsData.length > 0 && (
             <div className="p-3 bg-gray-50 border-t text-right text-xs text-gray-500">
               * Đã bao gồm booking chưa thanh toán
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
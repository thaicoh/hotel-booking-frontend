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

import { getMyBranch } from "../../api/staff";
import { getRevenueStatistics } from "../../api/statistics";

const StaffDashboard = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [myBranch, setMyBranch] = useState(null);
  const [filter, setFilter] = useState({
    type: "MONTHLY",
    year: currentYear,
    month: currentMonth,
  });

  const [statsData, setStatsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECT: Load Thông tin Chi nhánh & Dữ liệu ban đầu ---
  useEffect(() => {
    const initDashboard = async () => {
      setIsLoading(true);
      try {
        // 1. Lấy thông tin chi nhánh từ token
        const branchRes = await getMyBranch();
        if (branchRes.data && branchRes.data.result) {
          const branch = branchRes.data.result;
          setMyBranch(branch);
          
          // 2. Sau khi có branchId, gọi API thống kê lần đầu
          fetchData(branch.id, filter);
        }
      } catch (error) {
        console.error("Failed to initialize dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    initDashboard();
  }, []);

  // --- FUNCTION: Fetch Data ---
  const fetchData = async (branchId, currentFilter) => {
    if (!branchId) return;
    setIsLoading(true);
    try {
      const { type, year, month } = currentFilter;
      const res = await getRevenueStatistics(type, year, month, branchId);
      
      if (res.data && res.data.code === 1000) {
        const mappedData = res.data.result.map(item => ({
          ...item,
          name: formatLabel(item.timeUnit, type, month),
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

  const handleViewReport = () => {
    fetchData(myBranch?.id, filter);
  };

  // --- HELPER: Formatters ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatLabel = (timeUnit, type, monthFilter) => {
    if (type === "YEARLY") return `Năm ${timeUnit}`;
    if (type === "MONTHLY") return `Tháng ${timeUnit}`;
    if (type === "DAILY") return `${timeUnit}/${monthFilter}`;
    return timeUnit;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const summary = useMemo(() => {
    return statsData.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + (curr.totalRevenue || 0),
      totalBookings: acc.totalBookings + (curr.bookingCount || 0)
    }), { totalRevenue: 0, totalBookings: 0 });
  }, [statsData]);

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartBar className="text-blue-600" /> Báo cáo Doanh thu
          </h1>
          <p className="text-gray-500 mt-1 text-sm flex items-center gap-2">
            <FaBuilding className="text-blue-400"/> Chi nhánh: <span className="font-bold text-blue-700">{myBranch?.branchName || "Đang tải..."}</span>
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 hidden md:block">
            <p className="text-xs text-blue-600 font-bold uppercase">Địa chỉ</p>
            <p className="text-xs text-gray-600 truncate max-w-xs">{myBranch?.address}</p>
        </div>
      </div>

      {/* --- Filter Section --- */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kiểu báo cáo</label>
              <select 
                name="type" 
                value={filter.type} 
                onChange={handleFilterChange}
                className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="DAILY">Theo Ngày (Trong tháng)</option>
                <option value="MONTHLY">Theo Tháng (Trong năm)</option>
                <option value="YEARLY">Theo Năm</option>
              </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Năm</label>
            <select
              name="year"
              value={filter.year}
              onChange={handleFilterChange}
              disabled={filter.type === 'YEARLY'}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            >
              {[0,1,2,3,4].map(i => (
                <option key={i} value={currentYear - i}>{currentYear - i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tháng</label>
            <select
              name="month"
              value={filter.month}
              onChange={handleFilterChange}
              disabled={filter.type !== 'DAILY'}
              className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                 <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleViewReport}
              disabled={isLoading || !myBranch}
              className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-bold shadow-md disabled:opacity-70"
            >
              {isLoading ? 'Đang tải...' : <><FaSearch /> Lọc kết quả</>}
            </button>
          </div>
        </div>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Doanh thu chi nhánh</p>
            <h3 className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Tổng lượt Booking</p>
            <h3 className="text-xl font-bold text-gray-800">{summary.totalBookings} đơn</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
            <FaBuilding />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Doanh thu TB / Đơn</p>
            <h3 className="text-xl font-bold text-gray-800">
              {summary.totalBookings > 0 ? formatCurrency(summary.totalRevenue / summary.totalBookings) : formatCurrency(0)}
            </h3>
          </div>
        </div>
      </div>

      {/* --- Chart & Table --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar className="text-blue-500"/> Trực quan hóa doanh thu
          </h3>
          <div className="h-[350px] w-full">
            {statsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tickFormatter={(val) => val.toLocaleString()} tick={{fontSize: 11}} />
                  <Tooltip 
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#2563eb" radius={[4, 4, 0, 0]}>
                     {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#2563eb' : '#f1f5f9'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                <FaCalendarAlt className="text-3xl mb-2 opacity-20"/>
                <p className="text-sm italic">Không có dữ liệu thống kê</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-700">Số liệu chi tiết</h3>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">LIVE</span>
          </div>
          <div className="overflow-y-auto flex-1 max-h-[400px]">
            <table className="w-full text-xs text-left">
              <thead className="text-gray-500 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Booking</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-700">{item.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{item.bookingCount}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Server, AlertTriangle, Activity, Package, 
  ArrowUpRight, ArrowDownRight, HardDrive, Cpu, Wifi 
} from 'lucide-react';

// Map tên icon sang component lucide-react
const ICON_MAP = {
  Server,
  Activity,
  Package,
  HardDrive,
  Cpu,
  Wifi,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
};

import axios from '../api/axiosClient';
import { useEffect, useState } from 'react';

const COLORS = [
  '#6366F1', '#06B6D4', '#F59E42', '#F43F5E', '#10B981', '#FBBF24', '#3B82F6', '#A78BFA', '#F472B6', '#F87171'
];

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Active': 'bg-green-100 text-green-800',
    'In Stock': 'bg-blue-100 text-blue-800',
    'Maintenance': 'bg-yellow-100 text-yellow-800',
    'Low Stock': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [kpiData, setKpiData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [movementData, setMovementData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [assetDistribution, setAssetDistribution] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get('/dashboard/kpis'),
      axios.get('/dashboard/categories'),
      axios.get('/dashboard/movements'),
      axios.get('/dashboard/recent-activities'),
      axios.get('/dashboard/stats'),
      axios.get('/dashboard/asset-distribution')
    ])
      .then(([kpiRes, catRes, movRes, actRes, statsRes, distRes]) => {
        setKpiData(kpiRes.data.data);
        setCategoryData(catRes.data.data);
        setMovementData(movRes.data.data);
        setRecentActivities(actRes.data.data);
        setStats(statsRes.data.data);
        setAssetDistribution(distRes.data.data);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải dữ liệu dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Đang tải dữ liệu dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Lấy top 5 thiết bị phân bổ để hiển thị (theo số lượng lớn nhất)
  const topCategoryData = [...categoryData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Dashboard Quản Lý Kho IT</h1>
          <p className="text-gray-500 text-base md:text-lg">Tổng quan hạ tầng và tài sản thiết bị</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold shadow">Cập nhật: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
        {kpiData.map((item, index) => {
          const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] : item.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${item.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                  {Icon && <Icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />}
                </div>
                <span className="text-xs font-medium text-white bg-gradient-to-r from-indigo-400 to-cyan-400 px-2 py-1 rounded shadow">Tháng này</span>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-800 mb-1 drop-shadow-sm">{item.value}</h3>
              <p className="text-base text-gray-600 font-semibold mb-1">{item.title}</p>
              <p className="text-xs text-gray-400 mt-2 flex items-center">
                {item.sub.includes('+') ? <ArrowUpRight className="w-3 h-3 text-green-500 mr-1"/> : <AlertTriangle className="w-3 h-3 text-amber-500 mr-1"/>}
                {item.sub}
              </p>
            </div>
          );
        })}
        {/* KPI nhỏ bổ sung */}
        {stats && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-gray-400 mb-1">Đang sửa chữa</span>
              <span className="text-2xl font-bold text-yellow-500">{stats.assets.inRepair}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-gray-400 mb-1">Đã thu hồi</span>
              <span className="text-2xl font-bold text-gray-500">{stats.assets.retired}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-gray-400 mb-1">Cảnh báo tồn kho</span>
              <span className="text-2xl font-bold text-red-500">{stats.lowStockCount}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-gray-400 mb-1">Phiếu mua chờ duyệt</span>
              <span className="text-2xl font-bold text-indigo-500">{stats.pendingOrders}</span>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Import/Export Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex flex-col justify-between">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Biến động Nhập / Xuất Kho</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{fill: '#F3F4F6'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}}/>
                <Bar dataKey="nhap" name="Nhập kho" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="xuat" name="Xuất kho" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Nhóm các PieChart vào 1 cột */}
        <div className="flex flex-col gap-6">
          {/* Pie Chart: Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Phân bổ Thiết bị</h2>
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {topCategoryData.map((entry, idx) => (
                <div key={entry.name} className={`flex justify-between items-center text-sm${idx < topCategoryData.length - 1 ? ' border-b border-gray-100 pb-2' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-gray-600">{entry.name}</span>
                  </div>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Pie Chart: Asset Distribution by Location */}
          {assetDistribution && assetDistribution.byLocation && assetDistribution.byLocation.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Phân bổ tài sản theo vị trí</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-64 w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution.byLocation
                          .map(loc => loc.toJSON ? loc.toJSON() : loc)
                          .sort((a, b) => Number(b.count) - Number(a.count))
                          .slice(0, 5)
                          .map(loc => ({
                            name: loc.location && loc.location.location_name ? loc.location.location_name : `ID ${loc.location_id}`,
                            value: Number(loc.count)
                          }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetDistribution.byLocation
                          .slice(0, 5)
                          .map((entry, index) => (
                            <Cell key={`cell-loc-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 md:mt-0 w-full max-h-64 overflow-y-auto space-y-3 divide-y divide-gray-100">
                  {assetDistribution.byLocation
                    .map(loc => loc.toJSON ? loc.toJSON() : loc)
                    .sort((a, b) => Number(b.count) - Number(a.count))
                    .slice(0, 5)
                    .map((loc, idx) => (
                      <div key={loc.location_id} className="flex justify-between items-center text-sm py-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="text-gray-600">{loc.location && loc.location.location_name ? loc.location.location_name : `ID ${loc.location_id}`}</span>
                        </div>
                        <span className="font-semibold">{loc.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          {/* Pie Chart: Asset Distribution by Type */}
          {assetDistribution && assetDistribution.byType && assetDistribution.byType.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Phân bổ tài sản theo loại</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="h-64 w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution.byType
                          .map(type => type.toJSON ? type.toJSON() : type)
                          .sort((a, b) => Number(b.count) - Number(a.count))
                          .slice(0, 5)
                          .map(type => ({
                            name: type.assetModel && type.assetModel.asset_type ? type.assetModel.asset_type : `ID ${type.asset_model_id}`,
                            value: Number(type.count)
                          }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetDistribution.byType
                          .slice(0, 5)
                          .map((entry, index) => (
                            <Cell key={`cell-type-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 md:mt-0 w-full max-h-64 overflow-y-auto space-y-3 divide-y divide-gray-100">
                  {assetDistribution.byType
                    .map(type => type.toJSON ? type.toJSON() : type)
                    .sort((a, b) => Number(b.count) - Number(a.count))
                    .slice(0, 5)
                    .map((type, idx) => (
                      <div key={type.asset_model_id} className="flex justify-between items-center text-sm py-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="text-gray-600">{type.assetModel && type.assetModel.asset_type ? type.assetModel.asset_type : `ID ${type.asset_model_id}`}</span>
                        </div>
                        <span className="font-semibold">{type.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg md:text-xl font-bold text-indigo-700">Hoạt động gần đây</h2>
        </div>
        <div className="p-6">
          <ol className="relative border-l-4 border-indigo-300 pl-6 space-y-10">
            {recentActivities.map((item, idx) => (
              <li key={item.activity_id} className="relative flex items-start group">
                {/* Timeline dot */}
                <span className="absolute -left-7 top-4 w-5 h-5 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full border-4 border-white shadow-lg z-10"></span>
                {/* Timeline line */}
                {idx !== recentActivities.length - 1 && (
                  <span className="absolute -left-2 top-8 w-1 h-[calc(100%-2rem)] bg-indigo-200 rounded"></span>
                )}
                {/* Card content */}
                <div className="ml-2 flex-1">
                  <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col gap-2 transition-transform group-hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-normal text-gray-400">
                        {item.action_timestamp ? new Date(item.action_timestamp).toLocaleString() : ''}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600">{item.user}</span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium mb-1 break-words">
                      {item.description_vn}
                    </div>
                    {item.change_details && (
                      <div className="flex flex-wrap gap-4 mt-1">
                        {item.change_details.holder_name && (
                          <div className="text-xs text-gray-500">Người nhận: <span className="font-medium text-gray-800">{item.change_details.holder_name}</span></div>
                        )}
                        {item.change_details.item_name && (
                          <div className="text-xs text-gray-500">Thiết bị: <span className="font-medium text-gray-800">{item.change_details.item_name}</span></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
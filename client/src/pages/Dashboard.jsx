import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Server, AlertTriangle, Activity, Package, 
  ArrowUpRight, ArrowDownRight, HardDrive, Cpu, Wifi 
} from 'lucide-react';

// --- MOCK DATA (Mô phỏng Schema DB) ---

// 1. Thống kê tổng quan (KPIs)
const kpiData = [
  { 
    title: 'Tổng tài sản', 
    value: '1,248', 
    sub: '+12 nhập mới tháng này', 
    icon: Server, 
    color: 'bg-blue-500' 
  },
  { 
    title: 'Giá trị ước tính', 
    value: '4.2 Tỷ VNĐ', 
    sub: 'Khấu hao 5% so với quý trước', 
    icon: Activity, 
    color: 'bg-green-500' 
  },
  { 
    title: 'Đang bảo trì/Sửa chữa', 
    value: '15', 
    sub: 'Cần xử lý gấp: 3', 
    icon: AlertTriangle, 
    color: 'bg-amber-500' 
  },
  { 
    title: 'Cảnh báo sắp hết hàng', 
    value: '8', 
    sub: 'Dây nhảy quang, Chuột, RAM', 
    icon: Package, 
    color: 'bg-red-500' 
  },
];

// 2. Dữ liệu biểu đồ phân bổ thiết bị theo danh mục (Pie Chart)
const categoryData = [
  { name: 'Máy chủ (Servers)', value: 120 },
  { name: 'Mạng (Network)', value: 300 },
  { name: 'PC/Laptop', value: 450 },
  { name: 'Linh kiện/Khác', value: 378 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// 3. Dữ liệu biến động nhập/xuất kho 6 tháng gần nhất (Bar Chart)
const movementData = [
  { month: 'T7', nhap: 40, xuat: 24 },
  { month: 'T8', nhap: 30, xuat: 18 },
  { month: 'T9', nhap: 20, xuat: 50 },
  { month: 'T10', nhap: 27, xuat: 38 },
  { month: 'T11', nhap: 18, xuat: 40 },
  { month: 'T12', nhap: 55, xuat: 30 },
];

// 4. Danh sách thiết bị mới nhập hoặc cần chú ý gần đây (Table)
const recentActivities = [
  { id: 'IVT-001', device: 'Cisco Switch 2960', type: 'Network', status: 'In Stock', date: '2023-12-20', user: 'Admin' },
  { id: 'IVT-002', device: 'Dell PowerEdge R740', type: 'Server', status: 'Active', date: '2023-12-19', user: 'Nguyễn Văn A' },
  { id: 'IVT-003', device: 'MacBook Pro M2', type: 'Laptop', status: 'Maintenance', date: '2023-12-18', user: 'Trần Thị B' },
  { id: 'IVT-004', device: 'Dây cáp mạng Cat6', type: 'Accessory', status: 'Low Stock', date: '2023-12-18', user: 'Admin' },
  { id: 'IVT-005', device: 'HP LaserJet Pro', type: 'Printer', status: 'Active', date: '2023-12-17', user: 'Lê Văn C' },
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
  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Quản Lý Kho IT</h1>
          <p className="text-gray-500 text-sm">Tổng quan hạ tầng và tài sản thiết bị</p>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
        {kpiData.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.color} bg-opacity-10`}>
                <item.icon className={`w-6 h-6 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">Tháng này</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{item.value}</h3>
            <p className="text-sm text-gray-500 font-medium">{item.title}</p>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              {item.sub.includes('+') ? <ArrowUpRight className="w-3 h-3 text-green-500 mr-1"/> : <AlertTriangle className="w-3 h-3 text-amber-500 mr-1"/>}
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Bar Chart: Import/Export Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
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

        {/* Pie Chart: Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Phân bổ Thiết bị</h2>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
             {/* Custom Mini Legend/Stats below chart */}
             <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                   <Server size={16} className="text-blue-500" />
                   <span className="text-gray-600">Máy chủ</span>
                </div>
                <span className="font-semibold">120</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                   <Wifi size={16} className="text-green-500" />
                   <span className="text-gray-600">Thiết bị mạng</span>
                </div>
                <span className="font-semibold">300</span>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
          <a href="#" className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Xem tất cả</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Mã Tài Sản</th>
                <th className="px-6 py-4 font-medium">Tên Thiết Bị</th>
                <th className="px-6 py-4 font-medium">Danh mục</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Người phụ trách</th>
                <th className="px-6 py-4 font-medium text-right">Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentActivities.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      {item.type === 'Server' && <Server size={16} />}
                      {item.type === 'Network' && <Wifi size={16} />}
                      {item.type === 'Laptop' && <HardDrive size={16} />}
                      {item.type === 'Printer' && <Package size={16} />}
                      {item.device}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.user}</td>
                  <td className="px-6 py-4 text-gray-500 text-right">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
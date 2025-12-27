import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ASSETS_MOCK } from "./data/mockSchemaData";
import { Plus, Search, Filter, Server, MapPin, User, Eye } from "lucide-react";

// Component hiển thị Badge trạng thái dựa trên enum check trong DB
const StatusBadge = ({ status }) => {
  const styles = {
    'Deployed': 'bg-green-100 text-green-800 border-green-200',
    'In Stock': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Repair': 'bg-orange-100 text-orange-800 border-orange-200',
    'Retired': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  // Mapping tiếng Việt hiển thị
  const labels = {
    'Deployed': 'Đang cấp phát',
    'In Stock': 'Trong kho',
    'In Repair': 'Đang sửa chữa',
    'Retired': 'Thanh lý/Hủy'
  };
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full border ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

export default function AssetList() {
  const [data] = useState(ASSETS_MOCK);
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài Sản</h1>
          <p className="text-sm text-gray-500 mt-1">Dữ liệu từ bảng <code className="text-xs bg-gray-200 px-1 rounded">assets</code></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo Asset Tag, Serial Number..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            <Filter size={18} /> Bộ lọc
          </button>
        </div>

        {/* Table View */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Asset Tag / Serial</th>
              <th className="px-6 py-4 font-semibold">Model & Loại</th>
              <th className="px-6 py-4 font-semibold">Vị trí / Người giữ</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Giá trị (VNĐ)</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.asset_id} className="hover:bg-gray-50 transition-colors">
                {/* Column: Asset Tag & Serial */}
                <td className="px-6 py-4">
                  <div className="font-bold text-indigo-600">{item.asset_tag}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">{item.serial_number}</div>
                </td>

                {/* Column: Model Info (Join asset_models) */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{item.asset_model.model_name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Server size={12} /> {item.asset_model.asset_type} | {item.asset_model.manufacturer}
                  </div>
                </td>

                {/* Column: Location & Holder (Join locations & assignments) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 mb-1">
                    <MapPin size={14} className="text-gray-400" />
                    {item.location.location_name}
                  </div>
                  {item.current_assignment && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                      <User size={12} />
                      {item.current_assignment.asset_holder.full_name}
                    </div>
                  )}
                </td>

                {/* Column: Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={item.current_status} />
                </td>

                {/* Column: Purchase Cost */}
                <td className="px-6 py-4 text-right text-sm font-mono text-gray-700">
                  {new Intl.NumberFormat('vi-VN').format(item.purchase_cost)}
                </td>

                {/* Column: Actions */}
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors"
                    onClick={() => navigate(`/assets/${item.asset_id}`)}
                    title="Xem chi tiết"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
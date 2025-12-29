import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axiosClient';
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchAssets = () => {
    setLoading(true);
    setError(null);
    axios.get('/assets', {
      params: {
        search: search || undefined,
        page,
        limit: 10
      }
    })
      .then(res => {
        setData(res.data.data.assets);
        setTotalPages(res.data.data.totalPages);
        setTotal(res.data.data.total);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải danh sách tài sản'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line
  }, [debouncedSearch, page]);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Quản lý Tài Sản</h1>
          <p className="text-gray-500 text-base md:text-lg">Dữ liệu từ bảng <code className="text-xs bg-gray-200 px-1 rounded">assets</code></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo Asset Tag, Serial Number..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              value={search}
              onChange={e => {
                setPage(1);
                setSearch(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchAssets();
                }
              }}
            />
          </div>
        </div>

        {/* Table View */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Asset Tag / Serial</th>
              <th className="px-6 py-4 font-semibold">Model & Loại</th>
              <th className="px-6 py-4 font-semibold">Vị trí / Người giữ</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Giá trị (VNĐ)</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-8">Đang tải dữ liệu...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center text-red-500 py-8">{error}</td></tr>
            ) : data.map((item) => (
              <tr key={item.asset_id} className="hover:bg-indigo-50 transition-colors">
                {/* Column: Asset Tag & Serial */}
                <td className="px-6 py-4">
                  <div className="font-bold text-indigo-600 text-base">{item.asset_tag}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">{item.serial_number}</div>
                </td>
                {/* Column: Model Info (Join asset_models) */}
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">{item.assetModel.model_name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Server size={12} /> {item.assetModel.asset_type} | {item.assetModel.manufacturer}
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
                    className="text-gray-400 hover:text-white hover:bg-indigo-500 p-1 rounded transition-colors"
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
        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-indigo-50">
          <div className="text-sm text-gray-600">Tổng số: {total}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <span className="px-2 py-1">Trang {page} / {totalPages}</span>
            <button
              className="px-3 py-1 rounded border text-indigo-700 bg-white hover:bg-indigo-100 hover:text-indigo-900 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
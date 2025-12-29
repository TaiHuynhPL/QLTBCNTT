import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Filter, Search, Eye, FileCheck } from 'lucide-react';
import axios from '../api/axiosClient';

const POStatusBadge = ({ status }) => {
  const styles = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Pending Approval': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Completed': 'bg-green-100 text-green-800', // Đã nhập kho xong
    'Cancelled': 'bg-gray-200 text-gray-500 line-through',
  };
  const labels = {
    'Draft': 'Nháp',
    'Pending Approval': 'Chờ duyệt',
    'Approved': 'Đã duyệt',
    'Rejected': 'Từ chối',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Hủy',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

export default function PurchaseOrderList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef();

  const fetchPOs = () => {
    setLoading(true);
    setError(null);
    axios.get('/purchase-orders', {
      params: {
        search: debouncedSearch || undefined,
        page,
        limit: 10
      }
    })
      .then(res => {
        setData(res.data.data.purchaseOrders);
        setTotalPages(res.data.data.totalPages);
        setTotal(res.data.data.total);
      })
      .catch(err => setError(err.response?.data?.error || 'Không thể tải danh sách đơn hàng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPOs();
    // eslint-disable-next-line
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 drop-shadow">Đơn Mua Hàng (PO)</h1>
          <p className="text-base text-gray-600 mt-1">Quản lý quy trình mua sắm và nhập kho</p>
        </div>
        <button 
          onClick={() => navigate('/purchase-orders/new')}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-cyan-600 shadow transition-all text-base font-medium"
        >
          <Plus size={20} /> Tạo đơn hàng
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo mã đơn PO..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              value={search}
              onChange={e => {
                setPage(1);
                setSearch(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setDebouncedSearch(search);
                }
              }}
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-indigo-700 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Mã Đơn</th>
              <th className="px-6 py-4 font-semibold">Nhà cung cấp</th>
              <th className="px-6 py-4 font-semibold">Ngày tạo</th>
              <th className="px-6 py-4 font-semibold">Tổng tiền</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-lg text-gray-500 animate-pulse">Đang tải dữ liệu...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center text-red-500 py-10 text-lg">{error}</td></tr>
            ) : data.map((po) => (
              <tr key={po.purchase_order_id} className="hover:bg-cyan-50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600">{po.order_code}</td>
                <td className="px-6 py-4 text-base text-gray-700">{po.supplier.supplier_name}</td>
                <td className="px-6 py-4 text-base text-gray-500">{po.order_date}</td>
                <td className="px-6 py-4 text-base font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN').format(po.total_amount)} ₫
                </td>
                <td className="px-6 py-4">
                  <POStatusBadge status={po.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => navigate(`/purchase-orders/${po.purchase_order_id}`)}
                    className="text-gray-400 hover:text-indigo-600 p-1" title="Xem chi tiết"
                  >
                    <Eye size={22} />
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
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Filter, Search, Eye, FileCheck, Edit2, Trash2 } from 'lucide-react';
import axios from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/RoleGate';
import { errorToast } from '../utils/toast';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const { hasPermission } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const debounceRef = useRef();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchPOs = () => {
    setLoading(true);
    setError(null);
    axios.get('/purchase-orders', {
      params: {
        search: debouncedSearch || undefined,
        status: status || undefined,
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

  const handleDeletePO = (poId) => {
    setPendingDeleteId(poId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await axios.delete(`/purchase-orders/${pendingDeleteId}`);
      fetchPOs();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Không thể xóa đơn hàng');
    } finally {
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  useEffect(() => {
    fetchPOs();
    // eslint-disable-next-line
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="flex md:flex-row justify-between items-start md:items-center gap-2 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700 tracking-tight mb-1 drop-shadow-sm">Đơn Mua Hàng (PO)</h1>
          <p className="text-gray-500 text-base md:text-lg">Quản lý quy trình mua sắm và nhập kho</p>
        </div>
        <PermissionGate action="createPO">
          <button 
            onClick={() => navigate('/purchase-orders/new')}
            className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2 rounded-xl hover:bg-indigo-600 shadow-md transition-all font-semibold"
          >
            <Plus size={18} /> Tạo đơn hàng
          </button>
        </PermissionGate>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="grid grid-cols-3 md:grid-cols-3 p-4 border-b border-gray-100 gap-4 md:items-center">
          <div className="md:col-span-2">
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
          <div className="flex md:col-span-1 w-full items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-gray-600 font-medium">Trạng thái:</label>
            <select
              id="status-filter"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={status}
              onChange={e => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">Tất cả</option>
              <option value="Draft">Nháp</option>
              <option value="Pending Approval">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Từ chối</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Cancelled">Hủy</option>
            </select>
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
              <tr><td colSpan="6" className="text-center py-8">Đang tải dữ liệu...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center text-red-500 py-8">{error}</td></tr>
            ) : data.map((po) => (
              <tr key={po.purchase_order_id} className="hover:bg-indigo-50 transition-colors">
                <td className="px-6 py-4 font-bold text-indigo-600 text-base">{po.order_code}</td>
                <td className="px-6 py-4 text-base text-gray-700">{po.supplier.supplier_name}</td>
                <td className="px-6 py-4 text-base text-gray-500">{po.order_date}</td>
                <td className="px-6 py-4 text-right text-sm font-mono text-gray-700">
                  {new Intl.NumberFormat('vi-VN').format(po.total_amount)}
                </td>
                <td className="px-6 py-4">
                  <POStatusBadge status={po.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => navigate(`/purchase-orders/${po.purchase_order_id}`)}
                      className="text-gray-400 hover:text-white hover:bg-indigo-500 p-1 rounded transition-colors" title="Xem chi tiết"
                    >
                      <Eye size={20} />
                    </button>
                    {/* <PermissionGate action="updatePO">
                      <button 
                        onClick={() => navigate(`/purchase-orders/${po.purchase_order_id}/edit`)}
                        className="text-gray-400 hover:text-white hover:bg-yellow-500 p-1 rounded transition-colors" title="Chỉnh sửa"
                      >
                        <Edit2 size={20} />
                      </button>
                    </PermissionGate> */}
                    <PermissionGate action="deletePO">
                      <button 
                        onClick={() => handleDeletePO(po.purchase_order_id)}
                        className="text-gray-400 hover:text-white hover:bg-red-500 p-1 rounded transition-colors" title="Xóa"
                      >
                        <Trash2 size={20} />
                      </button>
                    </PermissionGate>
                  </div>
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
      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận xoá đơn hàng"
        message="Bạn chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
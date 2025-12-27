import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Filter, Search, Eye, FileCheck } from 'lucide-react';
import { PO_MOCK } from './data/mockPurchaseData';

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
  const [data] = useState(PO_MOCK);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn Mua Hàng (PO)</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý quy trình mua sắm và nhập kho</p>
        </div>
        <button 
          onClick={() => navigate('/purchase-orders/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus size={18} /> Tạo đơn hàng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Tìm theo mã đơn PO..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Mã Đơn</th>
              <th className="px-6 py-4 font-semibold">Nhà cung cấp</th>
              <th className="px-6 py-4 font-semibold">Ngày tạo</th>
              <th className="px-6 py-4 font-semibold">Tổng tiền</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((po) => (
              <tr key={po.purchase_order_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-indigo-600">{po.order_code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{po.supplier.supplier_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{po.order_date}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
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